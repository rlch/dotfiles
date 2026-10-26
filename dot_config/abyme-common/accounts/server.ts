// accounts, in abymed: which Claude account an agent abyme launches runs on, as clodcurrent picks
// one for `cl` in a terminal (design.md). An account is a setup-token in the keychain
// (`abyme-accounts-<slug>`, a year long); `agents.prepare` answers a Claude launch of the owner's
// with that account's token as the harness's `CLAUDE_CODE_OAUTH_TOKEN` (`secret`) and its slug
// (`account`), on Claude Code's default config folder.
//
// Tokens: read from the keychain for one launch and never kept: not in the store, a value a page
// follows, a log line, an error, an answer or a command's arguments (a new one goes to
// `security -i` on stdin).
import abyme from "@abyme/plugin";
import type { Json } from "@abyme/server";
import agents from "@abyme/agents";
import fs from "@abyme/fs/optional";
import process from "@abyme/process/optional";
import load from "@abyme/load/optional";
import kinds from "@abyme/kinds/inventory";
import { setCondition, type Condition } from "@abyme/kinds/condition";
import options from "./options";
import { accountReady, accountRecord } from "./kind";
import { resetSaid, stale, tokenEnds, tokenFrom, tokensListed, loadAccounts, best, binding, expirePast, family, lastAnswer, parse, parseModels, rowsSeen, said, takePushes, turnError, unified, warm, windowSaid, WARM_MS, type Account, type AccountSeen, type Kept, type Pushed, type Read, type Row, type Spent } from "./pick";

const o = abyme.with(options).plugin.options;
const HOME = o.home || fs?.home || "";

/** The control plane's files: the plugin's scratch and the model settings a launch reads. */
function files() {
  if (!fs) throw new Error("no machine provides fs here, to keep Claude's setup-tokens");
  return fs;
}
/** The control plane's processes: the keychain, ps and claude. */
function processes() {
  if (!process) throw new Error("no machine provides process here, to read the keychain");
  return process;
}
const USER = abyme.env.USER ?? "user";
const PICKED_MS = 60_000;

// ---- accounts: one per setup-token in the keychain ----

const tokenService = (slug: string) => `abyme-accounts-${slug}`;
/** Accounts the operator took off the rotation, by slug. */
const ignoredSlugs = () => (abyme.store.get("ignored") ?? []) as string[];

/** Every setup-token in the keychain, `main` first then by name, and when each was made: listed
 * from the keychain's attributes (`security dump-keychain`, never a secret), at most once a
 * second. The one owner of which accounts there are and when their tokens end. */
let listed: { at: number; tokens: { slug: string; made: number | null }[] } | null = null;
async function keychainTokens(): Promise<{ slug: string; made: number | null }[]> {
  if (listed && Date.now() - listed.at < 1_000) return listed.tokens;
  const r = await processes().run(o.security, { args: ["dump-keychain"] });
  const tokens = r.code === 0 ? tokensListed(r.stdout) : [];
  tokens.sort((a, b) => (a.slug === "main" ? -1 : b.slug === "main" ? 1 : a.slug.localeCompare(b.slug)));
  listed = { at: Date.now(), tokens };
  return tokens;
}

/** The accounts a pick may take: a token each, none the operator ignores. Each is its own login. */
async function discover(): Promise<Account[]> {
  const off = new Set(ignoredSlugs());
  return (await keychainTokens()).filter((t) => !off.has(t.slug)).map((t) => ({ slug: t.slug, key: t.slug }));
}

/** A setup-token into the keychain as account `slug`'s, replacing any: on `security -i`'s stdin,
 * never an argument. */
const keep = (slug: string, secret: string) =>
  processes().run(o.security, { args: ["-i"], stdin: `add-generic-password -U -s "${tokenService(slug)}" -a "${USER}" -l "abyme accounts: ${slug} setup-token" -w "${secret}"\n` });

/** An account's setup-token, for one launch. */
async function tokenOf(slug: string): Promise<string | null> {
  const r = await processes().run(o.security, { args: ["find-generic-password", "-s", tokenService(slug), "-a", USER, "-w"] });
  const t = r.code === 0 ? r.stdout.trim() : "";
  return t || null;
}

// ---- usage: what each account's agents' harnesses said, each turn ----

/** Each login's read, by slug: what its harnesses last said of its windows (`usage_limits` on its
 * agents), kept in the store so a cap stands across abymed's restarts. */
const reads = () => (abyme.store.get("reads") ?? {}) as Record<string, Kept>;
const answer = (at: number, data: Record<string, unknown>): Read => {
  const now = expirePast(data, Date.now());
  return { at, usage: parse(now), windows: parseModels(now), said: said(now) };
};
const readsNow = (all: Account[]) => new Map(all.flatMap((a) => (reads()[a.key] ? [[a.key, answer(reads()[a.key]!.at, reads()[a.key]!.data)] as const] : [])));

// ---- busy: abyme's live agents, by the account a launch said, and picks not listed yet ----

/** Picks of the last minute, by login and agent: busy from the moment they are made. */
let picked: { key: string; at: number; agent: string | null }[] = [];

/** abyme's agents as `agents.all` joins them: the account each is on and what its harness last said
 * of that account's usage. */
type Joined = { id: string; name: string; busy: boolean; closed: unknown; account: string | null; usage_limits?: Pushed[] | null };
const joined = async (): Promise<Joined[]> => Object.values((await agents.all()) as unknown as Record<string, Joined | undefined>).filter((x): x is Joined => !!x);

/** abyme's agents per account: busy as agents says it, the one rule; with `open`, every agent not closed. */
async function agentsByAccount(open = false): Promise<Map<string, { id: string; name: string }[]>> {
  const out = new Map<string, { id: string; name: string }[]>();
  for (const x of await joined()) {
    if (!x.account || !(open ? !x.closed : x.busy)) continue;
    out.set(x.account, [...(out.get(x.account) ?? []), { id: x.id, name: x.name ?? x.id }]);
  }
  return out;
}

/** How many agents are busy on each login, by key: those agents says, and the picks of the last
 * minute, each agent once. Busy is more than none. */
async function busyCounts(all: Account[]): Promise<Map<string, number>> {
  const on = await agentsByAccount();
  picked = picked.filter((p) => Date.now() - p.at < PICKED_MS);
  const out = new Map<string, number>();
  for (const a of all) {
    const ids = new Set((on.get(a.slug) ?? []).map((x) => x.id));
    for (const p of picked) if (p.key === a.key) ids.add(p.agent ?? `pick-${p.at}`);
    if (ids.size) out.set(a.key, ids.size);
  }
  return out;
}

// ---- spent: an account a turn hit its usage limit on ----

/** Accounts a turn hit a usage limit on, by login, and until when: out of every pick until then,
 * whatever a push says meanwhile. Kept in the store, so a restart puts no spent account back in the
 * rotation; one past its end is dropped. */
const spentMarks = () => (abyme.store.get("spent") ?? {}) as Record<string, Spent>;
/** How long an account is spent when nothing gives a reset still ahead. */
const SPENT_MS = 60 * 60_000;
/** The marks standing, by login: those past their end leave the store. */
function spentNow(): Map<string, Spent> {
  const all = Object.entries(spentMarks());
  const standing = all.filter(([, m]) => Date.now() < m.until);
  if (standing.length !== all.length) abyme.store.set("spent", Object.fromEntries(standing));
  return new Map(standing);
}
/** Until when an account is spent (ISO), or null when it is not. */
function spentUntil(key: string): string | null {
  const mark = spentNow().get(key);
  return mark ? new Date(mark.until).toISOString() : null;
}
/** Account `slug` is spent until its limit resets: when the refusal says it (a harness's push's
 * `resets_at`, else the time its message names), which replaces any mark; else the window its read
 * has at 100, or the one `why` names, at the reset that read gives, only while that read is fresh
 * (a stale one can hold an old week's reset: hsone's said 29 Oct when its refusal said 10pm,
 * 2026-10-25); else for SPENT_MS. */
function markSpent(slug: string, why: string, said?: { window: "five" | "seven"; resets: string | null }) {
  const now = Date.now();
  const kept = reads()[slug];
  const q = kept && !stale(kept.at, now) ? answer(kept.at, kept.data) : null;
  const u = q ? q.usage : null;
  const named = windowSaid(why);
  const pushed = Date.parse(said?.resets ?? "");
  const told = Number.isFinite(pushed) && pushed > now ? pushed : resetSaid(why, now);
  const bound = said ?? (u && binding(u)) ?? (named && { window: named, resets: u ? (named === "seven" ? u.sevenResets : u.fiveResets) : null });
  const reset = told ?? Date.parse(bound?.resets ?? "");
  const until = Number.isFinite(reset) && reset > now ? reset : now + SPENT_MS;
  const was = spentNow().get(slug);
  // A reset the refusal states is the truth, earlier or later; any other only lengthens a mark.
  if (was && (told === null ? was.until >= until : was.until === until)) return;
  abyme.store.set("spent", { ...spentMarks(), [slug]: { until, window: bound ? bound.window : null } });
  abyme.log.warn(`${slug}: a turn hit its limit (${why}); spent until ${new Date(until).toISOString()}${bound ? `, by its ${bound.window === "seven" ? "week" : "five hours"}` : ""}`);
}

// ---- what pages see: no token, no email, no uuid ----

/** Each login's quota and how many agents run on it, and when each account's setup-token ends.
 * Who runs where is `agents()`. */
const view = abyme.value<{ accounts: AccountSeen[]; tokens: Record<string, string> }>({ accounts: [], tokens: {} });

/** The same rows as load's accounts (resource-budgets): what Resources shows and turns wait on,
 * which load asks for once a minute. */
let forLoad: ReturnType<typeof loadAccounts> = [];
load?.readers.add({ id: "accounts", accounts: () => forLoad });

/** When each account's setup-token ends (ISO), by slug: a year after the keychain says it was made. */
async function tokensEnding(): Promise<Record<string, string>> {
  return Object.fromEntries((await keychainTokens()).flatMap((t) => (t.made === null ? [] : [[t.slug, new Date(tokenEnds(t.made)).toISOString()] as const])));
}

// Its kind, for kinds' describe and stuck: each login, not Ready while capped or spent, `since`
// when that changed.
const readies = new Map<string, Condition[]>();

/** The last value set, as JSON: a set that changes nothing sends nothing. */
let shown = "";
async function show() {
  const all = await discover();
  const on = await agentsByAccount();
  const counts = new Map([...on].map(([slug, xs]) => [slug, xs.length]));
  const next = { accounts: rowsSeen(all, readsNow(all), counts, spentNow()), tokens: await tokensEnding() };
  const json = JSON.stringify(next);
  if (json === shown) return;
  shown = json;
  view.set(next);
  forLoad = loadAccounts(next.accounts);
  const at = Date.now();
  for (const a of next.accounts) readies.set(a.slugs[0] ?? "", setCondition(readies.get(a.slugs[0] ?? "") ?? [], accountReady(a), at));
}

const accountsNow = () => view.getState().accounts.map((a) => accountRecord(a, readies.get(a.slugs[0] ?? "") ?? []));
kinds.kinds.add({
  kind: "Account",
  get: (id) => accountsNow().find((r) => r.id === id) ?? null,
  list: accountsNow,
  expire: { none: "a login is not work: it is capped or open" },
  retry: { none: "a login is not work: a cap ends by itself" },
});

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

/** `last`: the account an agent taken up again last ran on and when its last call was, which it
 * stays on while warm (`warm`). */
function pick(model: string | null, how: { pinned?: string; count?: boolean; agent?: string; last?: { slug: string; at: number } | null } = {}): Promise<{ account: Account; why: string }> {
  return serial(async () => {
    const all = await discover();
    if (!all.length) throw new Error("no Claude account has a setup-token (`abyme call accounts token slug=<s>`)");
    const pinned = how.pinned && how.pinned !== BY_QUOTA ? how.pinned : undefined;
    const busy = await busyCounts(all);
    const q = readsNow(all);
    await show();
    let account: Account | undefined;
    let why: string;
    const pin = pinned ? all.find((a) => a.slug === pinned) : undefined;
    // A pin capped by its harness or its read is skipped until it resets, so the agent does not
    // loop on "account full"; it comes back to the pin once it has room (operator, 2026-10-26).
    const pinUsage = pin ? q.get(pin.key)?.usage : undefined;
    const pinCapped = !!pin && (!!spentUntil(pin.key) || (!!pinUsage && !!binding(pinUsage)));
    if (pin && !pinCapped) (account = pin), (why = "pinned");
    else {
      if (pinned) abyme.log.warn(`pinned account ${pinned} is ${pin ? "capped" : "gone"}; picking by quota`);
      const rows: Row[] = all.map((a) => {
        const x = q.get(a.key);
        return { slug: a.slug, key: a.key, usage: x ? x.usage : null, windows: x ? x.windows : [], busy: busy.has(a.key), spent: spentUntil(a.key), read: x ? x.at : null, said: x?.said, agents: busy.get(a.key) ?? 0 };
      });
      const out = warm(rows, how.last ?? null, family(model), Date.now()) ?? best(rows, family(model), Date.now());
      if (out.pick === null) throw new Error(`no account can serve ${model ?? "Claude"} now (${out.why})`);
      account = all[out.pick]!;
      why = out.why;
    }
    if (how.count) picked.push({ key: account.key, at: Date.now(), agent: how.agent ?? null });
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

/** How much of a transcript's end is read for its last answer. */
const TAIL = 1 << 20;
/** When a session's transcript last has the model answering (ms), from its last MB; null when none. */
async function answeredAt(cwd: string, session: string): Promise<number | null> {
  const path = `${HOME}/.claude/projects/${cwd.replace(/[^A-Za-z0-9]/g, "-")}/${session}.jsonl`;
  const info = await files().stat(path).catch(() => undefined);
  if (info?.kind !== "file") return null;
  const from = Math.max(0, info.size - TAIL);
  const lines = ((await files().read(path, { from }).catch(() => undefined)) ?? "").split("\n");
  // Cut into at `from`: its first line is part of one.
  return lastAnswer(from > 0 ? lines.slice(1) : lines);
}

/** The account agent `id` last ran on and when its last call was: the later of its harness's last
 * usage push (`usage_limits`, said with most calls, not every one) and its transcript's last answer,
 * read only when the push is past the hour. Null when it ran on none. */
async function lastCall(id: string, cwd: string, session: string, all: Joined[]): Promise<{ slug: string; at: number } | null> {
  const x = all.find((j) => j.id === id);
  if (!x?.account) return null;
  const pushed = Math.max(0, ...(x.usage_limits ?? []).map((p) => Date.parse(p.at)).filter(Number.isFinite));
  const at = Date.now() - pushed < WARM_MS ? pushed : Math.max(pushed, (await answeredAt(cwd, session)) ?? 0);
  return at ? { slug: x.account, at } : null;
}

// ---- the hook every abyme launch passes through ----

const prepare: Parameters<typeof agents.prepare.add>[0] = {
  async prepare(l) {
    if (l.kind !== "claude") return {};
    const model = await modelOf(l);
    // The agent's pin: the menu's, else what New agent's Account field picked, which is kept as
    // the agent's pin so the menu shows it and can take it off ("auto").
    const field = l.with?.["accounts.account"];
    if (l.agent && field && pins()[l.agent] === undefined) abyme.store.set("pins", { ...pins(), [l.agent]: field });
    const pinned = l.agent ? pins()[l.agent] : undefined;
    // Its last turn hit a usage limit on the account it ran on: that account is out until it
    // resets, and a pick by quota moves it (a pinned agent too, until its pin has room again).
    const all = l.agent && (l.limited || l.resume) ? await joined() : [];
    // The account the limit hit is the one the launch says (`limited.account`): the agent's record
    // may already name the next one, and marking that put a healthy account out for days with
    // another's reset (rjmathies until main's week, 2026-10-26).
    if (l.limited && l.agent) {
      const was = l.limited.account ?? all.find((x) => x.id === l.agent)?.account;
      if (was) markSpent(was, l.limited.why);
    }
    // Taken up again: within the hour of its last call it stays on the account that call ran on,
    // where its prompt cache is, unless that account is spent or out of limit (design.md, Warm).
    const last = l.resume && l.agent && !l.probe ? await lastCall(l.agent, l.cwd, l.resume, all) : null;
    const { account, why } = await pick(model, { pinned, count: !l.probe, agent: l.agent, last });
    const token = await tokenOf(account.slug);
    if (!token) throw new Error(`${account.slug}: its setup-token is not in the keychain`);
    abyme.log.info(`${l.probe ? "choices" : l.limited ? "after a limit" : l.resume ? "resume" : "launch"} ${l.agent ?? ""} ${l.cwd}: ${account.slug} (${why})`);
    // `secret` reaches the harness's environment alone (agents gives it only to the owner's
    // launches: another user's agent runs on that user's own sign-in, never a pool account).
    return { secret: { CLAUDE_CODE_OAUTH_TOKEN: token }, account: account.slug };
  },
};

// Only with a machine: without its keychain there is no account to pick or show.
if (fs && process) {
  agents.prepare.add(prepare);
  void show().catch((e) => abyme.log.warn("accounts:", (e as Error).message));
  // A token added or taken out of the keychain by hand shows within half a minute, agents working or
  // not (vatsal was in `tokens` and not in the view, 2026-10-26). A listing changes nothing it shows
  // sends nothing.
  setInterval(() => void show().catch(() => {}), 30_000);
}

/** The last push taken of each login (ms): one heard again changes nothing. */
const taken = new Map<string, number>();
/** What agents' harnesses said of their accounts (`usage_limits`), into each login's read: newer
 * than the read, it wins; `rejected` marks the login spent until that window resets. */
async function takeUsage() {
  const all = await discover();
  const said = new Map<string, Pushed[]>();
  for (const x of await joined()) {
    if (!x.account || !x.usage_limits?.length || !all.some((a) => a.slug === x.account)) continue;
    said.set(x.account, [...(said.get(x.account) ?? []), ...x.usage_limits]);
  }
  for (const k of taken.keys()) if (!all.some((a) => a.key === k)) taken.delete(k);
  for (const [slug, pushes] of said) {
    const next = takePushes(reads()[slug], pushes, taken.get(slug) ?? 0);
    if (!next) continue;
    taken.set(slug, next.at);
    // A harness's words, JSON as they came.
    abyme.store.set("reads", { ...reads(), [slug]: { at: next.at, data: next.data } } as unknown as Json);
    for (const r of next.rejected) markSpent(slug, `its harness said its ${r.window === "seven" ? "weekly" : "5-hour"} limit is reached`, r);
  }
}
// An agent's list changes many times a second while agents work: once a moment at most.
let showing: ReturnType<typeof setTimeout> | null = null;
if (fs && process)
  agents.items.on("change", () => {
    showing ??= setTimeout(() => {
      showing = null;
      void takeUsage()
        .then(show)
        .catch((e) => abyme.log.warn("usage push:", (e as Error).message));
    }, 2_000);
  });

// ---- setup-tokens: one per account, in the keychain ----
//
// `token({ slug })` runs `claude setup-token` under the plugin, never in a terminal, so the token is
// in no scrollback: its authorize URL comes back to the caller (an agent opens it on that account's
// browser profile and hands it to the operator, or the operator opens it), and the token it prints
// goes straight to the keychain as `abyme-accounts-<slug>`. Where its localhost callback cannot be
// reached (another computer, a phone), Claude shows a code instead: `code({ slug, code })` gives it
// to the waiting setup-token.

/** Mints under way, by slug: one at a time an account. */
const minting = new Map<string, { url: string; scratch: string }>();

/** `claude setup-token` with stdin a fifo in the mint's scratch, held open by the shell (with stdin
 * closed it never opens the browser) and written to by `code`; its pid in the scratch, so a mint
 * whose process is gone (abymed restarted under it) is known dead; `BROWSER` a script that writes
 * the authorize URL to a file. */
const MINT = 'cd "$SCRATCH" && mkfifo -m 600 in && exec 3<>in && echo $$ > pid && exec "$CLAUDE" setup-token <&3';

async function claudePath(): Promise<string> {
  const r = await processes().run("/bin/sh", { args: ["-lc", "command -v claude"] });
  const path = r.stdout.trim();
  if (r.code !== 0 || !path) throw new Error("no claude on PATH, to make a setup-token");
  return path;
}

/** Whether a mint's setup-token still runs: its pid alive. */
async function alive(scratch: string): Promise<boolean> {
  const pid = Number(((await files().read(`${scratch}/pid`).catch(() => undefined)) ?? "").trim());
  if (!pid) return false;
  return (await processes().run("ps", { args: ["-p", String(pid), "-o", "pid="] })).code === 0;
}

async function mintToken(slug: string): Promise<{ slug: string; url: string; text: string }> {
  if (!/^[a-z0-9._-]+$/.test(slug)) throw new Error(`${slug} is no account name: letters, digits, . _ -`);
  const had = minting.get(slug);
  if (had && (await alive(had.scratch))) return { slug, url: had.url, text: `a token for ${slug} is waiting for its Authorize: ${had.url}` };
  // A mint whose setup-token is gone: forgotten, and made again.
  if (had) minting.delete(slug);
  const scratch = `${files().scratch}/mint-${slug}-${Date.now().toString(36)}`;
  await files().mkdir(scratch);
  await files().write(`${scratch}/browser`, `#!/bin/sh\nprintf '%s\\n' "$1" > '${scratch}/url'\n`);
  await processes().run("chmod", { args: ["700", scratch, `${scratch}/browser`] });
  const claude = await claudePath();
  const run = processes().run("/bin/sh", { args: ["-c", MINT], env: { BROWSER: `${scratch}/browser`, CLAUDE: claude, SCRATCH: scratch }, timeoutMs: 2 * 60 * 60_000 });
  void run
    .then(async (r) => {
      // The output holds the token: read here, and never logged, kept or answered.
      const secret = tokenFrom(r.stdout);
      if (!secret) return void abyme.log.warn(`${slug}: setup-token ended with no token (exit ${r.code})`);
      const w = await keep(slug, secret);
      if (w.code !== 0) return void abyme.log.warn(`${slug}: the keychain refused the setup-token (exit ${w.code})`);
      abyme.log.info(`${slug}: setup-token made and kept in the keychain`);
      listed = null;
      shown = "";
      await show();
    })
    .catch((e) => abyme.log.warn(`${slug}: setup-token:`, (e as Error).message))
    .finally(() => {
      if (minting.get(slug)?.scratch === scratch) minting.delete(slug);
      void files().remove(scratch).catch(() => {});
    });
  for (let i = 0; i < 60; i++) {
    const url = ((await files().read(`${scratch}/url`).catch(() => undefined)) ?? "").trim();
    if (url) {
      minting.set(slug, { url, scratch });
      return { slug, url, text: `open ${url} on browser profile claude-${slug} and have the operator Authorize: the token goes to the keychain once they do` };
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${slug}: setup-token gave no authorize URL in 30 s`);
}

// ---- refresh: an account's windows read by a turn of its own, on demand ----

/** The turn a refresh runs on an account's token: one line, on Sonnet, no tools, settings, MCP,
 * skills or session kept, in the plugin's scratch. Its `rate_limit_event` gives both windows' numbers;
 * a refused one costs nothing, one with room about $0.006 (2026-10-27). */
const REFRESH_ARGS = ["-p", "Reply with ok.", "--model", "sonnet", "--max-turns", "1", "--tools", "", "--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands", "--no-session-persistence", "--output-format", "stream-json", "--verbose"];

/** Which accounts a refresh with no slug reads: those capped (a window at 100, or spent), never read,
 * or read longer than STALE_MS ago: what only a turn of their own can change. */
function toRefresh(rows: AccountSeen[], now: number): string[] {
  return rows.filter((r) => r.capped || r.read === null || stale(Date.parse(r.read), now)).flatMap((r) => r.slugs.slice(0, 1));
}

/** One account's windows, from a turn on its token: the read overwritten with both numbers; a
 * refusal marks it spent until the reset it gives; a turn let through takes off a spent mark, so a
 * wrong mark or an early reset puts it back now. */
async function refreshOne(slug: string): Promise<{ slug: string; five: number | null; seven: number | null; capped: boolean; error?: string }> {
  const token = await tokenOf(slug);
  if (!token) return { slug, five: null, seven: null, capped: false, error: "no setup-token in the keychain" };
  const scratch = `${files().scratch}/refresh-${slug}`;
  await files().mkdir(scratch);
  const r = await processes().run(await claudePath(), { args: REFRESH_ARGS, cwd: scratch, env: { CLAUDE_CODE_OAUTH_TOKEN: token }, timeoutMs: 120_000 });
  const pushes = unified(r.stdout, new Date().toISOString());
  if (!pushes.length) return { slug, five: null, seven: null, capped: false, error: turnError(r.stdout) ?? `its turn said no limits (exit ${r.code})` };
  const next = takePushes(reads()[slug], pushes, 0);
  if (next) {
    taken.set(slug, next.at);
    abyme.store.set("reads", { ...reads(), [slug]: { at: next.at, data: next.data } } as unknown as Json);
    for (const x of next.rejected) markSpent(slug, `a refresh's turn was refused by its ${x.window === "seven" ? "weekly" : "5-hour"} limit`, x);
  }
  const refused = pushes.some((p) => p.state === "rejected");
  if (!refused && spentMarks()[slug]) {
    const { [slug]: _, ...rest } = spentMarks();
    abyme.store.set("spent", rest);
    abyme.log.info(`${slug}: a refresh's turn was let through; no longer spent`);
  }
  const n = (w: string) => pushes.find((p) => p.window === w)?.utilization ?? null;
  return { slug, five: n("five_hour"), seven: n("seven_day"), capped: refused };
}

/** Accounts given and their arguments, which a call from the shell or a page may leave out. */
function slugOf(a: { slug?: string } | undefined, fn: string): string {
  const slug = a?.slug?.trim();
  if (!slug) throw new Error(`which account: \`abyme call accounts ${fn} slug=<s>\``);
  return slug;
}

export default {
  /** `abyme call accounts token slug=…`: a setup-token for that account, a new account when no
   * token has the slug: answers the authorize URL to open on browser profile `claude-<slug>` for the
   * operator; the token goes to the keychain once they Authorize. */
  token: (a: { slug?: string }) => mintToken(slugOf(a, "token")),
  /** `abyme call accounts add slug=…`: a setup-token made elsewhere (`claude setup-token` in a
   * terminal, another computer) into the keychain as that account's, a new account when no token has
   * the slug. The token is the page's clipboard, which "Add copied Claude setup-token…" gives, else
   * this Mac's (`pbpaste`), which is then emptied: never an argument on a command line. */
  async add(a: { slug?: string; token?: string }) {
    const slug = slugOf(a, "add");
    if (!/^[a-z0-9._-]+$/.test(slug)) throw new Error(`${slug} is no account name: letters, digits, . _ -`);
    const fromMac = !a.token;
    const secret = tokenFrom(a.token ?? (await processes().run(o.pbpaste, { args: [] })).stdout);
    if (!secret) throw new Error(fromMac ? "no setup-token on the clipboard (one starts sk-ant-oat01-): copy the one `claude setup-token` printed" : "that is no setup-token (one starts sk-ant-oat01-)");
    const w = await keep(slug, secret);
    if (w.code !== 0) throw new Error(`${slug}: the keychain refused the setup-token (exit ${w.code})`);
    if (fromMac) await processes().run(o.pbcopy, { args: [], stdin: "" });
    abyme.log.info(`${slug}: setup-token added and kept in the keychain`);
    listed = null;
    shown = "";
    await show();
    return { slug, text: `${slug}'s setup-token is in the keychain${fromMac ? " and the clipboard emptied" : ""}; agents may run on it now` };
  },
  /** `abyme call accounts refresh [slug=…]`: each account's windows read by a one-line turn on its
   * token (about $0.006 each, nothing when refused): that account, else those capped, never read or
   * stale. A refusal marks it spent until the reset it gives; a turn let through takes a spent mark
   * off. On demand only. */
  async refresh(a: { slug?: string } = {}) {
    const slugs = a?.slug ? [a.slug] : toRefresh(view.getState().accounts, Date.now());
    const known = new Set((await keychainTokens()).map((t) => t.slug));
    const out = [];
    for (const slug of slugs) out.push(known.has(slug) ? await refreshOne(slug).catch((e: Error) => ({ slug, five: null, seven: null, capped: false, error: e.message })) : { slug, five: null, seven: null, capped: false, error: "no such account" });
    shown = "";
    await show();
    return { refreshed: out };
  },
  /** `abyme call accounts code slug=… code=…`: the code Claude showed after Authorize (its localhost
   * callback out of reach), given to that account's waiting setup-token. */
  async code(a: { slug: string; code: string }) {
    slugOf(a, "code");
    if (!a.code) throw new Error("which code: `abyme call accounts code slug=<s> code=<code>`");
    const m = minting.get(a.slug);
    if (!m || !(await alive(m.scratch))) throw new Error(`no setup-token for ${a.slug} is waiting: \`abyme call accounts token slug=${a.slug}\` first`);
    if (!/^[A-Za-z0-9#_-]+$/.test(a.code.trim())) throw new Error("that is not a code Claude shows");
    // Into the fifo the setup-token reads as its stdin: written in place, never replaced.
    const w = await processes().run("/bin/sh", { args: ["-c", 'printf "%s\\n" "$CODE" > "$FIFO"'], env: { CODE: a.code.trim(), FIFO: `${m.scratch}/in` } });
    if (w.code !== 0) throw new Error(`${a.slug}: its setup-token would not take the code`);
    return { slug: a.slug, text: `given to ${a.slug}'s setup-token: its token goes to the keychain` };
  },
  /** `abyme call accounts limited slug=… why=…`: a refusal an account gave outside abyme's agents
   * (a turn on its token by hand), in its words: spent until the reset they name ("resets 10pm
   * (Australia/Melbourne)"), else as any limit. */
  async limited(a: { slug: string; why: string }) {
    slugOf(a, "limited");
    if (!(await keychainTokens()).some((t) => t.slug === a.slug)) throw new Error(`no account ${a.slug}`);
    markSpent(a.slug, a.why);
    shown = "";
    await show();
    return { slug: a.slug, until: spentUntil(a.slug) };
  },
  /** When each account's setup-token ends, by slug: a year after it was made. */
  tokens: () => tokensEnding(),
  /** `abyme call accounts revoke slug=…`: that account's token out of the keychain and its agents'
   * harnesses closed, so nothing runs on it; Claude keeps the token valid until it is revoked at
   * claude.ai/settings/claude-code, which the answer says. */
  async revoke(a: { slug: string }) {
    slugOf(a, "revoke");
    const r = await processes().run(o.security, { args: ["delete-generic-password", "-s", tokenService(a.slug), "-a", USER] });
    if (r.code !== 0) throw new Error(`no setup-token for ${a.slug} in the keychain`);
    listed = null;
    const on = (await agentsByAccount(true)).get(a.slug) ?? [];
    if (on.length) await agents.close({ ids: on.map((x) => x.id) }).catch((e: unknown) => abyme.log.warn(`revoke ${a.slug}: closing its agents:`, (e as Error).message));
    shown = "";
    await show();
    return { slug: a.slug, closed: on.map((x) => x.name), text: `${a.slug}'s token is out of the keychain${on.length ? ` and ${on.length} agent(s) on it closed` : ""}; revoke it at https://claude.ai/settings/claude-code too` };
  },
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
    const on = await agentsByAccount(true);
    return [...on].flatMap(([slug, xs]) => xs.map((x) => ({ agent: x.id, name: x.name, account: slug, pinned: pins()[x.id] ?? null })));
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
    void show();
    return { agent: a.agent, slug: a.slug };
  },
  pins: () => pins(),
  /** `abyme call accounts ignore slug=… [on:=false]`: off the rotation, or back on it. */
  async ignore(a: { slug: string; on?: boolean }) {
    slugOf(a, "ignore");
    if (!(await keychainTokens()).some((t) => t.slug === a.slug)) throw new Error(`no account ${a.slug}`);
    const off = new Set(ignoredSlugs());
    if (a.on === false) off.delete(a.slug);
    else off.add(a.slug);
    abyme.store.set("ignored", [...off].sort());
    await show();
    return { slug: a.slug, ignored: a.on !== false };
  },
  /** The accounts ignored. */
  ignored: () => ignoredSlugs(),
};
