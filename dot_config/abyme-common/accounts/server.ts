// accounts, in abymed: which Claude account an agent abyme launches runs on, as clodcurrent picks
// one for `cl` in a terminal (design.md). It answers `agents.prepare` with the account's folder.
//
// Tokens: read from the macOS keychain, where Claude Code keeps them, for one request, and never
// kept: not in the store, a value a page follows, a log line, an error, an answer or a command's
// arguments (a renewed one goes to `security -i` on stdin).
import abyme from "@abyme/plugin";
import agents from "@abyme/agents";
import terminal from "@abyme/terminal";
import fs from "@abyme/fs/optional";
import process from "@abyme/process/optional";
import options from "./options";
import { best, binding, disbelieved, errorWins, expirePast, family, loginOf, parse, parseModels, newest, rowsSeen, staleOk, takePushes, windowSaid, type AccountSeen, type Pushed, type Read, type Row, type Spent } from "./pick";

const o = abyme.with(options).plugin.options;
const HOME = o.home || fs?.home || "";

/** The control plane's files, where the account folders are; refused where there are none. */
function files() {
  if (!fs) throw new Error("no machine provides fs here, to read the Claude accounts");
  return fs;
}
/** The control plane's processes: the keychain, ps, git and cp. */
function processes() {
  if (!process) throw new Error("no machine provides process here, to read the keychain");
  return process;
}
const USER = abyme.env.USER ?? "user";
const FRESH_MS = 60_000;
const PICKED_MS = 60_000;

type Account = { slug: string; dir: string; main: boolean; key: string; service: string };

// ---- accounts: ~/.claude (main) and every ~/.claude-<slug> with an identity ----

/** A folder's login, read from its `.claude.json` at every look and never kept: a folder signed in
 * again as another login (tuteroai as tutero.ai@gmail.com, 2026-10-23) moves to that login's row,
 * quota, spent mark and busy at once. */
async function identity(file: string) {
  return loginOf((await files().read(file).catch(() => null)) ?? null);
}

async function discover(): Promise<Account[]> {
  const out: Account[] = [];
  const main = (await files().stat(`${HOME}/.claude`))?.kind === "dir" ? await identity(`${HOME}/.claude.json`) : null;
  if (main) out.push({ slug: "main", dir: `${HOME}/.claude`, main: true, key: main.key, service: "Claude Code-credentials" });
  const rest: Account[] = [];
  for (const f of (await files().list(HOME)) ?? []) {
    if (f.kind !== "dir" || !f.name.startsWith(".claude-")) continue;
    const dir = `${HOME}/${f.name}`;
    if (await files().stat(`${dir}/.clodcurrent-disabled`)) continue;
    const id = await identity(`${dir}/.claude.json`);
    if (!id) continue;
    const service = `Claude Code-credentials-${abyme.crypto.hash("sha256", dir).slice(0, 8)}`;
    rest.push({ slug: f.name.slice(8), dir, main: false, key: id.key, service });
  }
  rest.sort((a, b) => a.slug.localeCompare(b.slug));
  return [...out, ...rest];
}

// ---- tokens ----

type Credentials = { claudeAiOauth?: { accessToken?: string; refreshToken?: string; expiresAt?: number; refreshTokenExpiresAt?: number; scopes?: string[] } } & Record<string, unknown>;

/** Accounts whose refresh token the token endpoint refused (400, 401): only a browser login brings
 * them back. Forgotten when the keychain holds another refresh token. */
const refusedTokens = new Map<string, string>();

/** Signed out: the access token has expired and nothing can renew it, a refresh token past its
 * end or one refused. Claude Code fails such an agent at its first message ("OAuth session expired
 * and could not be refreshed", 2026-10-19), so no launch is given one. */
function signedOut(a: Account, c: Credentials | null): boolean {
  const t = c?.claudeAiOauth;
  if (!t?.accessToken) return false;
  if (t.expiresAt === undefined || Date.now() < t.expiresAt) return false;
  if (!t.refreshToken) return true;
  if (t.refreshTokenExpiresAt !== undefined && Date.now() >= t.refreshTokenExpiresAt) return true;
  const was = refusedTokens.get(a.key);
  if (was !== undefined && was !== abyme.crypto.hash("sha256", t.refreshToken)) refusedTokens.delete(a.key);
  return refusedTokens.has(a.key);
}

async function credentials(a: Account): Promise<Credentials | null> {
  const r = await processes().run(o.security, { args: ["find-generic-password", "-s", a.service, "-a", USER, "-w"] });
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
  const r = await processes().run(o.security, { args: ["-i"], stdin: `add-generic-password -U -s "${a.service}" -a "${USER}" -w "${secret}"\n` });
  // Never r.stderr: it could echo the line.
  if (r.code !== 0) throw new Error(`${a.slug}: the keychain refused the renewed token`);
}

/** A renewal refused, by account: not asked again until `until`, each refusal doubling the wait
 * (5 min to 2 h). Every quota read asked again, and the token endpoint answered 429 to three
 * accounts every 1-4 minutes all day (2026-10-15). */
const refused = new Map<string, { until: number; wait: number }>();
const RENEW_WAIT_MS = 5 * 60_000;
const RENEW_WAIT_MAX_MS = 2 * 60 * 60_000;

/** The account's access token, renewed first when it has expired, renewal is on, it is not main's,
 * nothing runs on it and its last renewal was not refused a moment ago: a running Claude renews
 * its own, and a second renewal rotates its refresh token away. */
async function token(a: Account, busy: boolean): Promise<string | null> {
  const c = await credentials(a);
  const t = c?.claudeAiOauth;
  if (!t?.accessToken) return null;
  const expired = t.expiresAt !== undefined && Date.now() + 5 * 60_000 >= t.expiresAt;
  if (!expired || !o.renew || busy || a.main || !t.refreshToken) return t.accessToken;
  const no = refused.get(a.key);
  if (no && Date.now() < no.until) return t.accessToken;
  const r = await abyme.net.fetch(o.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "refresh_token", refresh_token: t.refreshToken, client_id: "9d1c250a-e61b-44d9-88ed-5944d1962f5e" }),
    timeoutMs: 10_000,
  });
  if (r.status === 400 || r.status === 401) {
    refusedTokens.set(a.key, abyme.crypto.hash("sha256", t.refreshToken));
    abyme.log.warn(`${a.slug}: renewing the token answered HTTP ${r.status}; signed out until a login`);
    return t.accessToken;
  }
  if (r.status !== 200) {
    const wait = no ? Math.min(no.wait * 2, RENEW_WAIT_MAX_MS) : RENEW_WAIT_MS;
    refused.set(a.key, { until: Date.now() + wait, wait });
    abyme.log.warn(`${a.slug}: renewing the token answered HTTP ${r.status}; not asked again for ${Math.round(wait / 60_000)} min`);
    return t.accessToken;
  }
  refused.delete(a.key);
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

type Quota = Read;
const quota = new Map<string, { at: number; data: Record<string, unknown> }>();

/** The last answer of each identity, shared by every profile's abymed on this Mac (coding,
 * knowledge): a profile reads the others' before it asks, so two profiles ask no more often
 * than one. Usage only, never a token. */
const SHARED = `${HOME}/.local/state/abyme-accounts-usage.json`;
type Shared = Record<string, { at: number; data: Record<string, unknown> }>;
async function readShared(): Promise<Shared> {
  try {
    return (JSON.parse((await files().read(SHARED)) ?? "{}") as Shared) ?? {};
  } catch {
    return {};
  }
}
/** One write at a time from this abymed: the identities' reads finish together, and parallel
 * writes of one file lose all but one. Another profile's write between a read and a write is
 * retried. */
let writing: Promise<void> = Promise.resolve();
function writeShared(key: string, entry: Shared[string]): Promise<void> {
  writing = writing.then(() => writeOne(key, entry)).catch(() => {});
  return writing;
}
async function writeOne(key: string, entry: Shared[string]) {
  for (let i = 0; i < 3; i++) {
    const now = await files().read(SHARED, { version: true });
    let all: Shared = {};
    try {
      all = now?.text ? (JSON.parse(now.text) as Shared) : {};
    } catch {}
    if ((all[key]?.at ?? 0) >= entry.at) return;
    all[key] = entry;
    if ((await files().write(SHARED, JSON.stringify(all), { ifVersion: now?.version ?? null })).written) return;
  }
}
/** What each identity's last read said, an error included, for the status bar between reads. */
const last = new Map<string, Quota>();

const answer = (at: number, data: Record<string, unknown>): Quota => {
  const now = expirePast(data, Date.now());
  return { at, usage: parse(now), windows: parseModels(now) };
};

async function fetchOne(a: Account, busy: boolean): Promise<Quota> {
  // Before any answer kept: usage read with a token that has since died says nothing.
  const c = await credentials(a);
  if (!c?.claudeAiOauth?.accessToken) return { at: Date.now(), error: "no credentials" };
  if (signedOut(a, c)) return { at: Date.now(), error: "signed out" };
  const had = newest(quota.get(a.key), (await readShared())[a.key]);
  if (had && Date.now() - had.at < FRESH_MS) return answer(had.at, had.data);
  const t = await token(a, busy);
  if (!t) return { at: Date.now(), error: "no credentials" };
  // A failed read: the kept one stands for it only while it is young and not near a cap.
  const fallback = (error: string): Quota => {
    const kept = had ? answer(had.at, had.data) : null;
    const age = had ? Date.now() - had.at : Infinity;
    failedRead(a, error, age);
    return kept && "usage" in kept && staleOk(kept.usage, age) ? kept : { at: Date.now(), error: kept ? `stale near its cap (${error})` : error };
  };
  let r: { status: number; body: string };
  try {
    r = await abyme.net.fetch(o.usageUrl, { headers: { authorization: `Bearer ${t}`, "anthropic-beta": "oauth-2025-04-20" }, timeoutMs: 5_000 });
  } catch {
    return fallback("unreachable");
  }
  if (r.status === 401) return (failedRead(a, "unauthorized", Infinity), { at: Date.now(), error: "unauthorized" });
  if (r.status !== 200) return fallback(r.status === 429 ? "usage API rate-limited (HTTP 429)" : `HTTP ${r.status}`);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(r.body) as Record<string, unknown>;
  } catch {
    return fallback("an answer that is not JSON");
  }
  if (failed.delete(a.key)) abyme.log.info(`${a.slug}: usage read again`);
  quota.set(a.key, { at: Date.now(), data });
  await writeShared(a.key, { at: Date.now(), data });
  return answer(Date.now(), data);
}

/** The last failed read of each login, by identity, to log each distinct one once. */
const failed = new Map<string, string>();
function failedRead(a: Account, error: string, age: number) {
  if (failed.get(a.key) === error) return;
  failed.set(a.key, error);
  const kept = Number.isFinite(age) ? `kept read ${Math.round(age / 60_000)} min old` : "no read kept";
  abyme.log.warn(`${a.slug}: usage read failed (${error}); ${kept}`);
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
      last.set(key, q);
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
    list = JSON.parse((await files().read(`${HOME}/.local/state/clodcurrent/sessions.json`)) ?? "[]") as typeof list;
  } catch {
    return [];
  }
  if (!list.length) return [];
  // Every pid, not `-p`: one pid ps rejects makes it print none.
  const r = await processes().run("ps", { args: ["-A", "-o", "pid="] });
  const alive = new Set(r.stdout.split("\n").map((l) => Number(l.trim())).filter(Boolean));
  return list.filter((s) => alive.has(s.pid)).map((s) => s.slug);
}

/** abyme's agents as `agents.all` joins them: what each is on and what its harness last said of
 * its account's usage. */
type Joined = { id: string; name: string; busy: boolean; closed: unknown; config_dir: string | null; usage_limits?: Pushed[] | null };
const joined = async (): Promise<Joined[]> => Object.values((await agents.all()) as unknown as Record<string, Joined | undefined>).filter((x): x is Joined => !!x);

/** Busy abyme agents per account folder: busy as agents says it, the one rule; with `open`, every
 * agent not closed. */
async function agentsByDir(open = false): Promise<Map<string, { id: string; name: string }[]>> {
  const out = new Map<string, { id: string; name: string }[]>();
  for (const x of await joined()) {
    if (!x.config_dir || !(open ? !x.closed : x.busy)) continue;
    out.set(x.config_dir, [...(out.get(x.config_dir) ?? []), { id: x.id, name: x.name ?? x.id }]);
  }
  return out;
}

async function busyKeys(all: Account[]): Promise<Set<string>> {
  const slugs = new Set(await terminalSlugs());
  const dirs = await agentsByDir();
  picked = picked.filter((p) => Date.now() - p.at < PICKED_MS);
  const out = new Set(picked.map((p) => p.key));
  for (const a of all) if (slugs.has(a.slug) || dirs.has(a.dir)) out.add(a.key);
  return out;
}

// ---- spent: an account a turn hit its usage limit on ----

/** Accounts a turn hit a usage limit on, by identity, and until when: out of every pick until
 * then, whatever a quota read says, as the read can lag the limit. */
const spent = new Map<string, Spent>();
/** How long an account is spent when nothing gives a reset still ahead. */
const SPENT_MS = 60 * 60_000;
/** Until when an account is spent (ISO), or null when it is not. */
function spentUntil(key: string): string | null {
  const mark = spent.get(key);
  if (mark === undefined) return null;
  if (Date.now() < mark.until) return new Date(mark.until).toISOString();
  spent.delete(key);
  return null;
}
/** The account of config folder `dir` is spent until the window that caps it resets: the one `said`
 * (a harness's push), else the one its last read has at 100, else the one `why` names with the reset
 * its last read gives; else for SPENT_MS. */
async function markSpent(dir: string, why: string, said?: { window: "five" | "seven"; resets: string | null }) {
  const a = (await discover()).find((x) => x.dir === dir);
  if (!a) return;
  const q = last.get(a.key);
  const u = q && "usage" in q ? q.usage : null;
  const named = windowSaid(why);
  const bound = said ?? (u && binding(u)) ?? (named && { window: named, resets: u ? (named === "seven" ? u.sevenResets : u.fiveResets) : null });
  const reset = Date.parse(bound?.resets ?? "");
  const until = Number.isFinite(reset) && reset > Date.now() ? reset : Date.now() + SPENT_MS;
  const was = spent.get(a.key);
  if (was && was.until >= until) return;
  spent.set(a.key, { until, window: bound ? bound.window : null });
  abyme.log.warn(`${a.slug}: a turn hit its limit (${why}); spent until ${new Date(until).toISOString()}${bound ? `, by its ${bound.window === "seven" ? "week" : "five hours"}` : ""}`);
}

// ---- what pages see: no token, no email, no uuid ----

/** Each login's quota and how many agents run on it. Who runs where is `agents()`. */
const view = abyme.value<{ accounts: AccountSeen[] }>({ accounts: [] });

/** The last value set, as JSON: a set that changes nothing sends nothing. */
let shown = "";
async function show(all: Account[], q: Map<string, Quota>) {
  const dirs = await agentsByDir();
  const counts = new Map([...dirs].map(([dir, xs]) => [dir, xs.length]));
  const next = { accounts: rowsSeen(all, q, counts) };
  const json = JSON.stringify(next);
  if (json === shown) return;
  shown = json;
  view.set(next);
}

async function refresh() {
  const all = await discover();
  await show(all, await quotas(all, await busyKeys(all)));
}

// ---- picking ----

/** Picks run one at a time, so each sees the one before. */
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(f: () => Promise<T>): Promise<T> {
  const run = queue.then(f, f);
  queue = run.catch(() => {});
  return run;
}

/** The pin of an agent (by its id in abyme): the account its resumes run on. */
const pins = () => (abyme.store.get("pins") ?? {}) as Record<string, string>;

/** What New agent's Account field says when nothing is pinned. */
const BY_QUOTA = "auto";

function pick(model: string | null, how: { pinned?: string; count?: boolean } = {}): Promise<{ account: Account; why: string }> {
  return serial(async () => {
    const all = await discover();
    if (!all.length) throw new Error(`no Claude account in ${HOME} (~/.claude or ~/.claude-<slug>)`);
    const pinned = how.pinned && how.pinned !== BY_QUOTA ? how.pinned : undefined;
    const busy = await busyKeys(all);
    const q = await quotas(all, busy);
    await show(all, q);
    let account: Account | undefined;
    let why: string;
    if (pinned && (account = all.find((a) => a.slug === pinned))) why = "pinned";
    else {
      if (pinned) abyme.log.warn(`pinned account ${pinned} is gone; picking by quota`);
      const f = family(model);
      const rows: Row[] = all.map((a) => {
        const x = q.get(a.key);
        return { slug: a.slug, key: a.key, usage: x && "usage" in x ? x.usage : null, windows: x && "usage" in x ? x.windows : [], busy: busy.has(a.key), spent: spentUntil(a.key) };
      });
      const out = best(rows, f, Date.now());
      if (out.pick === null) {
        const errors = all.map((a) => {
          const x = q.get(a.key);
          return `${a.slug}: ${spentUntil(a.key) ? "hit its limit" : x && "error" in x ? x.error : "spent"}`;
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
      const m = (JSON.parse((await files().read(file)) ?? "{}") as { model?: unknown }).model;
      if (typeof m === "string" && m) return m;
    } catch {}
  }
  return null;
}

// ---- trust: the folder's repository root, in the account's .claude.json ----

async function trust(a: Account, cwd: string) {
  const top = await processes().run("git", { args: ["-C", cwd, "rev-parse", "--show-toplevel"] });
  const path = (await files().realpath(top.code === 0 && top.stdout.trim() ? top.stdout.trim() : cwd)) ?? cwd;
  if (!path.startsWith(`${HOME}/`)) return;
  const file = a.main ? `${HOME}/.claude.json` : `${a.dir}/.claude.json`;
  for (let tries = 0; tries < 3; tries++) {
    const now = await files().read(file, { version: true });
    if (!now?.text) return;
    const c = JSON.parse(now.text) as { projects?: Record<string, Record<string, unknown>> };
    const p = ((c.projects ??= {})[path] ??= {});
    if (p.hasTrustDialogAccepted === true && p.hasCompletedProjectOnboarding === true) return;
    Object.assign(p, { hasTrustDialogAccepted: true, hasCompletedProjectOnboarding: true });
    // Only over the version read: never over a running Claude's own write.
    if ((await files().write(file, JSON.stringify(c, null, 2), { ifVersion: now.version })).written) return;
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
      for (const p of (await files().list(`${a.dir}/projects`)) ?? []) {
        if (p.kind !== "dir") continue;
        for (const f of (await files().list(`${a.dir}/projects/${p.name}`)) ?? []) {
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
      await files().mkdir(to.slice(0, to.lastIndexOf("/")));
      // -p keeps the time the comparison rests on.
      if ((await processes().run("cp", { args: ["-p", from, to] })).code === 0) copies++;
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

const prepare: Parameters<typeof agents.prepare.add>[0] = {
  async prepare(l) {
    if (l.kind !== "claude") return {};
    const model = await modelOf(l);
    // A resume needs another account's copy in place before claude looks for it.
    if (l.resume) await sync(true);
    // The agent's pin: the menu's, else what New agent's Account field picked, which is kept as
    // the agent's pin so the menu shows it and can take it off ("auto").
    const field = l.with?.["accounts.account"];
    if (l.agent && field && pins()[l.agent] === undefined) abyme.store.set("pins", { ...pins(), [l.agent]: field });
    const pinned = l.agent ? pins()[l.agent] : undefined;
    // Its last turn hit a usage limit there: that account is out until it resets, and a pick by
    // quota moves it (a pinned agent stays, and abyme shows the limit).
    if (l.limited?.configDir) await markSpent(l.limited.configDir, l.limited.why);
    const { account, why } = await pick(model, { pinned, count: !l.probe });
    if (!l.probe) {
      await trust(account, l.cwd);
      if (!l.resume) void sync(false).catch((e) => abyme.log.warn("sync:", (e as Error).message));
    }
    abyme.log.info(`${l.probe ? "choices" : l.limited ? "after a limit" : l.resume ? "resume" : "launch"} ${l.agent ?? ""} ${l.cwd}: ${account.slug} (${why})`);
    const env: Record<string, string> = account.main ? {} : { CLAUDE_CONFIG_DIR: account.dir };
    return { env, configDir: account.dir };
  },
};

// Only with a machine: without its files and keychain there is no account to pick or show.
if (fs && process) {
  agents.prepare.add(prepare);
  void refresh().catch((e) => abyme.log.warn("quota:", (e as Error).message));
  setInterval(() => void refresh().catch((e) => abyme.log.warn("quota:", (e as Error).message)), 5 * 60_000);
}
/** The quota as last read, with the agents as they are now. */
async function showCached() {
  const all = await discover();
  const q = new Map<string, Quota>();
  for (const a of all) {
    const had = quota.get(a.key);
    const read = last.get(a.key);
    q.set(a.key, had && !errorWins(had, read) ? answer(had.at, had.data) : (read ?? { at: 0, error: "not read yet" }));
  }
  await show(all, q);
}

/** The last push taken of each login (ms), by identity: one heard again changes nothing. */
const taken = new Map<string, number>();
/** Refusals not believed, by login, window and time: each logged once. */
const ignored = new Set<string>();
/** What agents' harnesses said of their accounts (`usage_limits`), into each login's kept read:
 * newer than the read, it wins; `rejected` marks the login spent until that window resets. Never
 * into the shared file, which holds endpoint reads only. */
async function takeUsage() {
  const all = await discover();
  const byDir = new Map(all.map((a) => [a.dir, a]));
  const said = new Map<string, { a: Account; pushes: Pushed[] }>();
  for (const x of await joined()) {
    const a = x.config_dir ? byDir.get(x.config_dir) : undefined;
    if (!a || !x.usage_limits?.length) continue;
    const s = said.get(a.key) ?? { a, pushes: [] };
    s.pushes.push(...x.usage_limits);
    said.set(a.key, s);
  }
  for (const k of taken.keys()) if (!all.some((a) => a.key === k)) taken.delete(k);
  const shared = said.size ? await readShared() : {};
  for (const [key, { a, pushes }] of said) {
    // A refusal an own read newer than it contradicts is not believed (`disbelieved`).
    const own = shared[key] ? answer(shared[key].at, shared[key].data) : null;
    const read = own && "usage" in own ? own : null;
    const believed = pushes.filter((p) => {
      if (!disbelieved(p, read)) return true;
      const id = `${key} ${p.window} ${p.at}`;
      if (!ignored.has(id)) {
        ignored.add(id);
        abyme.log.warn(`${a.slug}: ignored a harness's ${p.window === "seven_day" ? "weekly" : "5-hour"} limit: its own newer read shows ${p.window === "seven_day" ? read!.usage.seven : read!.usage.five}%`);
      }
      return false;
    });
    const next = takePushes(newest(quota.get(key), shared[key]), believed, taken.get(key) ?? 0);
    if (!next) continue;
    taken.set(key, next.at);
    if (next.data) {
      quota.set(key, { at: next.at, data: next.data });
      last.set(key, answer(next.at, next.data));
    }
    for (const r of next.rejected) await markSpent(a.dir, `its harness said its ${r.window === "seven" ? "weekly" : "5-hour"} limit is reached`, r);
  }
}
// An agent's list changes many times a second while agents work, and each show lists the home
// folder and reads every account's identity: once a moment at most.
let showing: ReturnType<typeof setTimeout> | null = null;
if (fs && process)
  agents.items.on("change", () => {
    showing ??= setTimeout(() => {
      showing = null;
      void takeUsage()
        .then(showCached)
        .catch((e) => abyme.log.warn("usage push:", (e as Error).message));
    }, 2_000);
  });

export default {
  /** `abyme call accounts pick model=…`: the account a launch would get now, and why. Counts nothing. */
  async pick(a: { model?: string } = {}) {
    const { account, why } = await pick(a.model ?? null);
    return { slug: account.slug, why };
  },
  /** `abyme call accounts view`: one row per login, its windows, cap and busy agents (design.md),
   * for the status bar and any reader of each account's usage. */
  view: () => view,
  /** `abyme call accounts agents`: each abyme agent not closed and the account it runs on. */
  async agents() {
    const all = await discover();
    const dirs = await agentsByDir(true);
    return all.flatMap((a) => (dirs.get(a.dir) ?? []).map((x) => ({ agent: x.id, name: x.name, account: a.slug, pinned: pins()[x.id] ?? null })));
  },
  /** The account an agent's resumes run on; null picks by quota again. */
  async pin(a: { agent: string; slug: string | null }) {
    const now = { ...pins() };
    if (a.slug === null) now[a.agent] = BY_QUOTA;
    else {
      if (!(await discover()).some((x) => x.slug === a.slug)) throw new Error(`no account ${a.slug}`);
      now[a.agent] = a.slug;
    }
    abyme.store.set("pins", now);
    void showCached();
    return { agent: a.agent, slug: a.slug };
  },
  pins: () => pins(),
  /** `abyme call accounts sync`: the conversation sync now; how many copies it made. */
  sync: () => sync(true),
  /** `abyme call accounts login slug=…`: clodcurrent's browser login for that account, in a
   * terminal of its own the operator types into; answers the terminal's id. */
  async login(a: { slug: string }) {
    const account = (await discover()).find((x) => x.slug === a.slug);
    if (!account) throw new Error(`no account ${a.slug}`);
    const shell = await terminal.run({ key: `accounts.login.${account.slug}`, title: `Sign in: ${account.slug}`, cwd: HOME, command: `clodcurrent renew --login ${account.slug}` });
    return { shell: shell.id };
  },
  /** `abyme call accounts ignore slug=… [on:=false]`: off the rotation, or back on it, by
   * clodcurrent's own marker (`clodcurrent disable`), so a terminal's `cl` skips it too. */
  async ignore(a: { slug: string; on?: boolean }) {
    const marker = `${await folderOf(a.slug)}/.clodcurrent-disabled`;
    if (a.on === false) await files().remove(marker);
    else await files().write(marker, "");
    await refresh();
    return { slug: a.slug, ignored: a.on !== false };
  },
  /** The accounts ignored: a folder with an identity and the marker. */
  async ignored() {
    const out: string[] = [];
    for (const f of (await files().list(HOME)) ?? [])
      if (f.kind === "dir" && f.name.startsWith(".claude-") && (await files().stat(`${HOME}/${f.name}/.clodcurrent-disabled`))) out.push(f.name.slice(8));
    return out.sort();
  },
};

/** The folder of an account by slug, its marker left aside: `main` is ~/.claude. */
async function folderOf(slug: string): Promise<string> {
  const dir = slug === "main" ? `${HOME}/.claude` : `${HOME}/.claude-${slug}`;
  if (!/^[a-z0-9._-]+$/.test(slug) || (await files().stat(dir))?.kind !== "dir") throw new Error(`no account ${slug}`);
  return dir;
}

// A login that ended: read every account again, so the status bar and the next pick see it.
if (fs && process)
  terminal.followers.add({
    async exited(shell) {
      if (!shell.key?.startsWith("accounts.login.")) return;
      quota.clear();
      await refresh().catch((e) => abyme.log.warn("quota:", (e as Error).message));
    },
  });
