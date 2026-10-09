// accounts, in abymed: which Claude account an agent abyme launches runs on, as clodcurrent picks
// one for `cl` in a terminal (design.md). It answers `agents.prepare` with the account's folder.
//
// Tokens: read from the macOS keychain, where Claude Code keeps them, for one request, and never
// kept: not in the store, a value a page follows, a log line, an error, an answer or a command's
// arguments (a renewed one goes to `security -i` on stdin).
import abyme from "@abyme/plugin";
import agents from "@abyme/agents";
import options from "./options";
import { best, capped, expirePast, family, parse, parseModels, type ModelWindow, type Row, type Usage } from "./pick";

const o = abyme.with(options).plugin.options;
const HOME = o.home || abyme.env.HOME!;
const USER = abyme.env.USER ?? "user";
const FRESH_MS = 60_000;
const STALE_OK_MS = 30 * 60_000;
const PICKED_MS = 60_000;

type Account = { slug: string; dir: string; main: boolean; key: string; service: string };

// ---- accounts: ~/.claude (main) and every ~/.claude-<slug> with an identity ----

async function identity(file: string): Promise<{ email: string; uuid?: string } | null> {
  try {
    const a = (JSON.parse((await abyme.fs.read(file)) ?? "{}") as { oauthAccount?: { emailAddress?: string; accountUuid?: string } }).oauthAccount;
    return a?.emailAddress ? { email: a.emailAddress, uuid: a.accountUuid } : null;
  } catch {
    return null;
  }
}

async function discover(): Promise<Account[]> {
  const out: Account[] = [];
  const main = (await abyme.fs.stat(`${HOME}/.claude`))?.kind === "dir" ? await identity(`${HOME}/.claude.json`) : null;
  if (main) out.push({ slug: "main", dir: `${HOME}/.claude`, main: true, key: main.uuid ?? `email:${main.email}`, service: "Claude Code-credentials" });
  const rest: Account[] = [];
  for (const f of (await abyme.fs.list(HOME)) ?? []) {
    if (f.kind !== "dir" || !f.name.startsWith(".claude-")) continue;
    const dir = `${HOME}/${f.name}`;
    if (await abyme.fs.stat(`${dir}/.clodcurrent-disabled`)) continue;
    const id = await identity(`${dir}/.claude.json`);
    if (!id) continue;
    const service = `Claude Code-credentials-${abyme.crypto.hash("sha256", dir).slice(0, 8)}`;
    rest.push({ slug: f.name.slice(8), dir, main: false, key: id.uuid ?? `email:${id.email}`, service });
  }
  rest.sort((a, b) => a.slug.localeCompare(b.slug));
  return [...out, ...rest];
}

// ---- tokens ----

type Credentials = { claudeAiOauth?: { accessToken?: string; refreshToken?: string; expiresAt?: number; scopes?: string[] } } & Record<string, unknown>;

async function credentials(a: Account): Promise<Credentials | null> {
  const r = await abyme.process.run(o.security, { args: ["find-generic-password", "-s", a.service, "-a", USER, "-w"] });
  if (r.code !== 0 || !r.stdout.trim()) return null;
  try {
    return JSON.parse(r.stdout.trim()) as Credentials;
  } catch {
    return null;
  }
}

async function writeCredentials(a: Account, c: Credentials) {
  // `security -i` reads its command from stdin: the secret is never in a process's arguments.
  const secret = JSON.stringify(c).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const r = await abyme.process.run(o.security, { args: ["-i"], stdin: `add-generic-password -U -s "${a.service}" -a "${USER}" -w "${secret}"\n` });
  // Never r.stderr: it could echo the line.
  if (r.code !== 0) throw new Error(`${a.slug}: the keychain refused the renewed token`);
}

/** The account's access token, renewed first when it has expired, renewal is on, it is not main's
 * and nothing runs on it: a running Claude renews its own, and a second renewal rotates its
 * refresh token away. */
async function token(a: Account, busy: boolean): Promise<string | null> {
  const c = await credentials(a);
  const t = c?.claudeAiOauth;
  if (!t?.accessToken) return null;
  const expired = t.expiresAt !== undefined && Date.now() + 5 * 60_000 >= t.expiresAt;
  if (!expired || !o.renew || busy || a.main || !t.refreshToken) return t.accessToken;
  const r = await abyme.net.fetch(o.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "refresh_token", refresh_token: t.refreshToken, client_id: "9d1c250a-e61b-44d9-88ed-5944d1962f5e" }),
    timeoutMs: 10_000,
  });
  if (r.status !== 200) {
    abyme.log.warn(`${a.slug}: renewing the token answered HTTP ${r.status}`);
    return t.accessToken;
  }
  const n = JSON.parse(r.body) as { access_token?: string; expires_in?: number; refresh_token?: string; scope?: string };
  if (!n.access_token) return t.accessToken;
  const next: Credentials = {
    ...c,
    claudeAiOauth: {
      ...t,
      accessToken: n.access_token,
      ...(n.expires_in ? { expiresAt: Date.now() + n.expires_in * 1000 } : {}),
      ...(n.refresh_token ? { refreshToken: n.refresh_token } : {}),
      ...(n.scope ? { scopes: n.scope.split(" ") } : {}),
    },
  };
  await writeCredentials(a, next);
  abyme.log.info(`${a.slug}: token renewed`);
  return n.access_token;
}

// ---- quota: one fetch per identity, 60 s fresh, a 30-minute-old answer when the API fails ----

type Quota = { at: number; usage: Usage; windows: ModelWindow[] } | { at: number; error: string };
const quota = new Map<string, { at: number; data: Record<string, unknown> }>();

const answer = (at: number, data: Record<string, unknown>): Quota => {
  const now = expirePast(data, Date.now());
  return { at, usage: parse(now), windows: parseModels(now) };
};

async function fetchOne(a: Account, busy: boolean): Promise<Quota> {
  const had = quota.get(a.key);
  if (had && Date.now() - had.at < FRESH_MS) return answer(had.at, had.data);
  const t = await token(a, busy);
  if (!t) return { at: Date.now(), error: "no credentials" };
  const fallback = (error: string): Quota => (had && Date.now() - had.at < STALE_OK_MS ? answer(had.at, had.data) : { at: Date.now(), error });
  let r: { status: number; body: string };
  try {
    r = await abyme.net.fetch(o.usageUrl, { headers: { authorization: `Bearer ${t}`, "anthropic-beta": "oauth-2025-04-20" }, timeoutMs: 5_000 });
  } catch {
    return fallback("unreachable");
  }
  if (r.status === 401) return { at: Date.now(), error: "unauthorized" };
  if (r.status !== 200) return fallback(r.status === 429 ? "usage API rate-limited (HTTP 429)" : `HTTP ${r.status}`);
  try {
    const data = JSON.parse(r.body) as Record<string, unknown>;
    quota.set(a.key, { at: Date.now(), data });
    return answer(Date.now(), data);
  } catch {
    return fallback("an answer that is not JSON");
  }
}

/** Each account's quota: one fetch per identity, each folder's token tried until one answers. */
async function quotas(all: Account[], busy: Set<string>): Promise<Map<string, Quota>> {
  const groups = new Map<string, Account[]>();
  for (const a of all) groups.set(a.key, [...(groups.get(a.key) ?? []), a]);
  const out = new Map<string, Quota>();
  await Promise.all(
    [...groups].map(async ([key, members]) => {
      let q: Quota = { at: Date.now(), error: "no credentials" };
      for (const a of members) {
        q = await fetchOne(a, busy.has(key));
        if ("usage" in q) break;
      }
      out.set(key, q);
    }),
  );
  return out;
}

// ---- busy: terminal sessions, abyme's live agents, and picks not listed yet ----

/** Picks of the last minute, by identity: busy from the moment they are made, as clodcurrent
 * registers a launch before it starts claude. */
let picked: { key: string; at: number }[] = [];

/** Slugs in clodcurrent's register whose process still runs. Read only. */
async function terminalSlugs(): Promise<string[]> {
  let list: { slug: string; pid: number }[] = [];
  try {
    list = JSON.parse((await abyme.fs.read(`${HOME}/.local/state/clodcurrent/sessions.json`)) ?? "[]") as typeof list;
  } catch {
    return [];
  }
  if (!list.length) return [];
  // Every pid, not `-p`: one pid ps rejects makes it print none.
  const r = await abyme.process.run("ps", { args: ["-A", "-o", "pid="] });
  const alive = new Set(r.stdout.split("\n").map((l) => Number(l.trim())).filter(Boolean));
  return list.filter((s) => alive.has(s.pid)).map((s) => s.slug);
}

/** Live abyme agents per account folder. */
function agentsByDir(): Map<string, { id: string; name: string; session: string | null }[]> {
  const out = new Map<string, { id: string; name: string; session: string | null }[]>();
  if (!agents.ready) return out;
  for (const x of agents.items.list()) {
    if (!x.config_dir || x.status === "done") continue;
    out.set(x.config_dir, [...(out.get(x.config_dir) ?? []), { id: `${x.plugin}:${x.id}`, name: x.name ?? x.id, session: x.session_id ?? null }]);
  }
  return out;
}

async function busyKeys(all: Account[]): Promise<Set<string>> {
  const slugs = new Set(await terminalSlugs());
  const dirs = agentsByDir();
  picked = picked.filter((p) => Date.now() - p.at < PICKED_MS);
  const out = new Set(picked.map((p) => p.key));
  for (const a of all) if (slugs.has(a.slug) || dirs.has(a.dir)) out.add(a.key);
  return out;
}

// ---- what pages see: no token, no email, no uuid ----

type Seen = {
  slug: string;
  five: number | null;
  seven: number | null;
  fiveResets: string | null;
  sevenResets: string | null;
  windows: { name: string; utilization: number | null; resetsAt: string | null }[];
  capped: boolean;
  error: string | null;
  agents: number;
};
const view = abyme.value<{ accounts: Seen[]; at: number }>({ accounts: [], at: 0 });

function show(all: Account[], q: Map<string, Quota>) {
  const dirs = agentsByDir();
  view.set({
    at: Date.now(),
    accounts: all.map((a) => {
      const x = q.get(a.key);
      const u = x && "usage" in x ? x : null;
      return {
        slug: a.slug,
        five: u ? u.usage.five : null,
        seven: u ? u.usage.seven : null,
        fiveResets: u?.usage.fiveResets ?? null,
        sevenResets: u?.usage.sevenResets ?? null,
        windows: (u?.windows ?? []).map((w) => ({ name: w.name, utilization: w.utilization, resetsAt: w.resetsAt })),
        capped: u ? capped(u.usage) : false,
        error: x && "error" in x ? x.error : null,
        agents: dirs.get(a.dir)?.length ?? 0,
      };
    }),
  });
}

async function refresh() {
  const all = await discover();
  show(all, await quotas(all, await busyKeys(all)));
}

// ---- picking ----

/** Picks run one at a time, so each sees the one before. */
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(f: () => Promise<T>): Promise<T> {
  const run = queue.then(f, f);
  queue = run.catch(() => {});
  return run;
}

/** The pin of a session: the account its resumes run on. */
const pins = () => (abyme.store.get("pins") ?? {}) as Record<string, string>;

function pick(model: string | null, how: { session?: string; count?: boolean } = {}): Promise<{ account: Account; why: string }> {
  return serial(async () => {
    const all = await discover();
    if (!all.length) throw new Error(`no Claude account in ${HOME} (~/.claude or ~/.claude-<slug>)`);
    const pinned = how.session ? pins()[how.session] : undefined;
    const busy = await busyKeys(all);
    const q = await quotas(all, busy);
    show(all, q);
    let account: Account | undefined;
    let why: string;
    if (pinned && (account = all.find((a) => a.slug === pinned))) why = "pinned";
    else {
      if (pinned) abyme.log.warn(`pinned account ${pinned} is gone; picking by quota`);
      const f = family(model);
      const rows: Row[] = all.map((a) => {
        const x = q.get(a.key);
        return { slug: a.slug, key: a.key, usage: x && "usage" in x ? x.usage : null, windows: x && "usage" in x ? x.windows : [], busy: busy.has(a.key) };
      });
      const out = best(rows, f, Date.now());
      if (out.pick === null) {
        const errors = all.map((a) => {
          const x = q.get(a.key);
          return `${a.slug}: ${x && "error" in x ? x.error : "spent"}`;
        });
        throw new Error(`no account can serve ${model ?? "Claude"} now (${out.why}; ${errors.join(", ")})`);
      }
      account = all[out.pick]!;
      why = out.why;
    }
    if (how.count) picked.push({ key: account.key, at: Date.now() });
    return { account, why };
  });
}

/** The model a launch asks for: its chosen value of category `model`, else what Claude Code would
 * read (ANTHROPIC_MODEL, then the project's and the user's settings), as clodcurrent does. */
async function modelOf(l: { config: Record<string, { value: string; category?: string }>; env: Record<string, string>; cwd: string }): Promise<string | null> {
  const chosen = Object.values(l.config).find((c) => c.category === "model")?.value;
  if (chosen) return chosen;
  const env = l.env.ANTHROPIC_MODEL ?? abyme.env.ANTHROPIC_MODEL;
  if (env) return env;
  for (const file of [`${l.cwd}/.claude/settings.local.json`, `${l.cwd}/.claude/settings.json`, `${HOME}/.claude/settings.json`]) {
    try {
      const m = (JSON.parse((await abyme.fs.read(file)) ?? "{}") as { model?: unknown }).model;
      if (typeof m === "string" && m) return m;
    } catch {}
  }
  return null;
}

// ---- trust: the folder's repository root, in the account's .claude.json ----

async function trust(a: Account, cwd: string) {
  const top = await abyme.process.run("git", { args: ["-C", cwd, "rev-parse", "--show-toplevel"] });
  const path = (await abyme.fs.realpath(top.code === 0 && top.stdout.trim() ? top.stdout.trim() : cwd)) ?? cwd;
  if (!path.startsWith(`${HOME}/`)) return;
  const file = a.main ? `${HOME}/.claude.json` : `${a.dir}/.claude.json`;
  for (let tries = 0; tries < 3; tries++) {
    const now = await abyme.fs.read(file, { version: true });
    if (!now?.text) return;
    const c = JSON.parse(now.text) as { projects?: Record<string, Record<string, unknown>> };
    const p = ((c.projects ??= {})[path] ??= {});
    if (p.hasTrustDialogAccepted === true && p.hasCompletedProjectOnboarding === true) return;
    Object.assign(p, { hasTrustDialogAccepted: true, hasCompletedProjectOnboarding: true });
    // Only over the version read: never over a running Claude's own write.
    if ((await abyme.fs.write(file, JSON.stringify(c, null, 2), { ifVersion: now.version })).written) return;
  }
}

// ---- conversations: the newest copy of each, in every account folder ----

let syncing: Promise<number> | null = null;

/** Copies the newest copy of each `projects/<p>/<s>.jsonl` changed within `syncDays` into every
 * account folder that has an older one or none, its time kept. Answers how many it copied. */
async function syncOnce(): Promise<number> {
  const all = await discover();
  if (all.length < 2) return 0;
  const since = Date.now() - o.syncDays * 86_400_000;
  const have = all.map(() => new Map<string, number>());
  const newest = new Map<string, { from: string; mtime: number }>();
  await Promise.all(
    all.map(async (a, i) => {
      for (const p of (await abyme.fs.list(`${a.dir}/projects`)) ?? []) {
        if (p.kind !== "dir") continue;
        for (const f of (await abyme.fs.list(`${a.dir}/projects/${p.name}`)) ?? []) {
          if (f.kind !== "file" || !f.name.endsWith(".jsonl") || f.mtime === null) continue;
          const rel = `${p.name}/${f.name}`;
          have[i]!.set(rel, f.mtime);
          if (f.mtime >= since && (newest.get(rel)?.mtime ?? -1) < f.mtime) newest.set(rel, { from: `${a.dir}/projects/${rel}`, mtime: f.mtime });
        }
      }
    }),
  );
  let copies = 0;
  for (const [rel, { from, mtime }] of newest)
    for (const [i, a] of all.entries()) {
      const to = `${a.dir}/projects/${rel}`;
      if (to === from || (have[i]!.get(rel) ?? -1) >= mtime) continue;
      await abyme.fs.mkdir(to.slice(0, to.lastIndexOf("/")));
      // -p keeps the time the comparison rests on.
      if ((await abyme.process.run("cp", { args: ["-p", from, to] })).code === 0) copies++;
    }
  return copies;
}

/** One sync at a time: a launch's is skipped while one runs; a resume waits for it, then runs its own. */
function sync(wait: boolean): Promise<number> {
  if (syncing && !wait) return syncing;
  const after = syncing ?? Promise.resolve(0);
  const run: Promise<number> = after
    .catch(() => 0)
    .then(syncOnce)
    .finally(() => {
      if (syncing === run) syncing = null;
    });
  syncing = run;
  return run;
}

// ---- the hook every abyme launch passes through ----

agents.prepare.register({
  async prepare(l) {
    if (l.kind !== "claude") return {};
    const model = await modelOf(l);
    // A resume needs another account's copy in place before claude looks for it.
    if (l.resume) await sync(true);
    const { account, why } = await pick(model, { session: l.resume, count: !l.probe });
    if (!l.probe) {
      await trust(account, l.cwd);
      if (!l.resume) void sync(false).catch((e) => abyme.log.warn("sync:", (e as Error).message));
    }
    abyme.log.info(`${l.probe ? "choices" : l.resume ? "resume" : "launch"} ${l.cwd}: ${account.slug} (${why})`);
    return { env: account.main ? {} : { CLAUDE_CONFIG_DIR: account.dir }, configDir: account.dir };
  },
});

void refresh().catch((e) => abyme.log.warn("quota:", (e as Error).message));
setInterval(() => void refresh().catch((e) => abyme.log.warn("quota:", (e as Error).message)), 5 * 60_000);
/** The quota as last read, with the agents as they are now. */
async function showCached() {
  const all = await discover();
  const q = new Map<string, Quota>();
  for (const a of all) {
    const had = quota.get(a.key);
    q.set(a.key, had ? answer(had.at, had.data) : { at: 0, error: "not read yet" });
  }
  show(all, q);
}
agents.items.on("change", () => void showCached());

export default {
  /** `abyme call accounts pick model=…`: the account a launch would get now, and why. Counts nothing. */
  async pick(a: { model?: string } = {}) {
    const { account, why } = await pick(a.model ?? null);
    return { slug: account.slug, why };
  },
  /** Each account's quota and how many agents run on it, for the status bar. */
  view: () => view,
  /** `abyme call accounts agents`: each live abyme agent and the account it runs on. */
  async agents() {
    const all = await discover();
    const dirs = agentsByDir();
    return all.flatMap((a) => (dirs.get(a.dir) ?? []).map((x) => ({ agent: x.id, name: x.name, account: a.slug, pinned: x.session ? (pins()[x.session] ?? null) : null })));
  },
  /** The account a session's resumes run on; null takes the pin off. */
  async pin(a: { session: string; slug: string | null }) {
    const now = { ...pins() };
    if (a.slug === null) delete now[a.session];
    else {
      if (!(await discover()).some((x) => x.slug === a.slug)) throw new Error(`no account ${a.slug}`);
      now[a.session] = a.slug;
    }
    abyme.store.set("pins", now);
    return { session: a.session, slug: a.slug };
  },
  pins: () => pins(),
  /** `abyme call accounts sync`: the conversation sync now; how many copies it made. */
  sync: () => sync(true),
};
