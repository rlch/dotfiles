// clodcurrent's picking, as it is in ~/dev/clodcurrent/src (usage.rs, select.rs, model.rs), with
// nothing of abyme in it: server.ts gives it the accounts (one per setup-token) and what their
// agents' harnesses said of their usage, and test.ts (in the dotfiles source only, never deployed)
// checks it.

export type Family = "fable" | "opus" | "sonnet" | "haiku" | "other";

/** The family of a model alias or id; null for none or `default`. */
export function family(raw: string | null | undefined): Family | null {
  let n = (raw ?? "").trim().toLowerCase();
  if (n.endsWith("[1m]")) n = n.slice(0, -4).trimEnd();
  if (!n || n === "default") return null;
  if (n === "fable" || n === "best") return "fable";
  if (n === "opus" || n === "opusplan") return "opus";
  if (n === "sonnet" || n === "haiku") return n;
  const i = n.lastIndexOf("claude-");
  const tail = i >= 0 ? n.slice(i + 7) : n;
  const word = tail.split(/[-@.]/)[0];
  return word === "fable" || word === "opus" || word === "sonnet" || word === "haiku" ? word : "other";
}

/** The family a window's name says. */
function familyOfName(name: string): Family | null {
  const n = name.toLowerCase();
  for (const f of ["fable", "opus", "sonnet", "haiku"] as const) if (n.includes(f)) return f;
  return null;
}

export type Usage = { five: number; seven: number; fiveResets: string | null; sevenResets: string | null };
export type ModelWindow = { name: string; family: Family | null; utilization: number | null; resetsAt: string | null };

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : null);
const num = (v: unknown): number | null => (typeof v === "number" ? v : null);
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** The 5-hour and 7-day windows of a usage answer. */
export function parse(data: Raw): Usage {
  const w = (k: string) => obj(data[k]);
  return {
    five: num(w("five_hour")?.utilization) ?? 0,
    seven: num(w("seven_day")?.utilization) ?? 0,
    fiveResets: str(w("five_hour")?.resets_at),
    sevenResets: str(w("seven_day")?.resets_at),
  };
}

/** Its model-scoped windows: the fixed keys and the `limits` entries that name a model. */
export function parseModels(data: Raw): ModelWindow[] {
  const out: ModelWindow[] = [];
  for (const key of ["seven_day_opus", "seven_day_sonnet"]) {
    const o = obj(data[key]);
    if (o) out.push({ name: key, family: familyOfName(key), utilization: num(o.utilization), resetsAt: str(o.resets_at) });
  }
  for (const entry of Array.isArray(data.limits) ? data.limits : []) {
    const e = obj(entry);
    const model = obj(obj(e?.scope)?.model);
    const name = str(model?.display_name) ?? str(model?.id);
    if (!e || !name) continue;
    out.push({ name, family: familyOfName(name), utilization: num(e.percent) ?? num(e.utilization), resetsAt: str(e.resets_at) });
  }
  return out;
}

/** The window governing `f`: the most used of those that name it. */
export function windowFor(windows: ModelWindow[], f: Family): ModelWindow | null {
  let best: ModelWindow | null = null;
  for (const w of windows) if (w.family === f && (best === null || (w.utilization ?? -1) > (best.utilization ?? -1))) best = w;
  return best;
}

/** A cached answer, with every window whose reset has passed at 0: that quota is back. */
export function expirePast(data: Raw, now: number): Raw {
  const past = (w: Raw) => {
    const t = str(w.resets_at);
    return t !== null && Date.parse(t) < now;
  };
  const out: Raw = {};
  for (const [k, v] of Object.entries(data)) {
    const w = obj(v);
    out[k] = w && past(w) ? { ...w, utilization: 0, resets_at: null } : v;
  }
  if (Array.isArray(data.limits))
    out.limits = data.limits.map((v) => {
      const w = obj(v);
      return w && past(w) ? { ...w, utilization: 0, percent: 0, resets_at: null } : v;
    });
  return out;
}

const HORIZON = 5 * 3600;
const WEEK = 7 * 86400;
const WEEKLY_FLOOR = 0.15;
const secsUntil = (t: string | null, now: number) => {
  if (t === null) return null;
  const at = Date.parse(t);
  return Number.isNaN(at) ? null : (at - now) / 1000;
};

/** clodcurrent's score: 5-hour headroom and the refill due within 5 hours, gated below 15 % of the
 * week left, urged by the week's burn pace, with the week left as a tiebreak. */
export function score(u: Usage, now: number): number {
  const h5 = Math.max(0, 100 - u.five) / 100;
  const h7 = Math.max(0, 100 - u.seven) / 100;
  const gate = Math.min(1, h7 / WEEKLY_FLOOR);
  const weekLeft = secsUntil(u.sevenResets, now);
  const slack = weekLeft === null ? 0 : h7 - Math.min(1, Math.max(0, weekLeft / WEEK));
  const reset = secsUntil(u.fiveResets, now);
  const h5Score = reset === null ? h5 : h5 + (Math.min(100, u.five) / 100) * (Math.max(0, HORIZON - Math.max(0, reset)) / HORIZON);
  return h5Score * gate * (1 + slack) * 100 + h7 * 5;
}

export const capped = (u: Usage) => u.five >= 100 || u.seven >= 100;

/** A window of an account's usage. */
export type Window = "five" | "seven";

/** The window that caps `u` and when it resets: the one at or over 100, the later reset when both
 * are; null when neither is. A week-capped account stays capped whatever its five hours say. */
export function binding(u: Usage): { window: Window; resets: string | null } | null {
  const five = u.five >= 100;
  const seven = u.seven >= 100;
  if (five && seven) return Date.parse(u.fiveResets ?? "") > Date.parse(u.sevenResets ?? "") ? { window: "five", resets: u.fiveResets } : { window: "seven", resets: u.sevenResets ?? u.fiveResets };
  if (seven) return { window: "seven", resets: u.sevenResets };
  if (five) return { window: "five", resets: u.fiveResets };
  return null;
}

/** The window a harness's limit message names: "weekly" or "7-day" the week, "5-hour" or
 * "session" the five hours; null for neither. */
export function windowSaid(why: string): Window | null {
  if (/weekly|7-day|seven[_ ]day/i.test(why)) return "seven";
  if (/5-hour|session|five[_ ]hour/i.test(why)) return "five";
  return null;
}

/** The usage with the model's window as the binding week, when it is the more used. */
function withWindow(u: Usage, w: ModelWindow): Usage {
  return w.utilization !== null && w.utilization > u.seven ? { ...u, seven: w.utilization, sevenResets: w.resetsAt ?? u.sevenResets } : u;
}

/** An account to pick from: `spent` is until when a turn's limit keeps it out (ISO), if it does. */
export type Row = { slug: string; key: string; usage: Usage | null; windows: ModelWindow[]; busy: boolean; spent?: string | null; read?: number | null };

/** How old a read may be and still be taken as how the account stands now: windows come only from
 * its agents' turns, so an account nobody runs on keeps its last numbers however full it has since
 * become (hsone read 89% of its week for 13 h after its token answered its weekly limit, 2026-10-25). */
export const STALE_MS = 30 * 60_000;
/** Whether a read is stale at `now`. */
export const stale = (read: number | null | undefined, now: number) => read != null && now - read > STALE_MS;
/** A stale read near its cap (5h at 90, 7d at 85): what it says may already be full. */
const nearCap = (u: Usage) => u.five >= 90 || u.seven >= 85;
export type Outcome = { pick: number; why: string } | { pick: null; why: string };
/** An account not read yet, as a pick counts it. */
const UNREAD: Usage = { five: 0, seven: 0, fiveResets: null, sevenResets: null };

/** A row's usage for `f`, the model's window binding the week; null when that window is spent. */
function effective(r: Row, f: Family | null): Usage | null {
  const u = r.usage ?? UNREAD;
  const w = f ? windowFor(r.windows, f) : null;
  if (w && w.utilization !== null && w.utilization >= 100) return null;
  return w ? withWindow(u, w) : u;
}

/** clodcurrent's `best_for`, without its capped tiers: an account whose window for the model is
 * spent is out, the model's window binds the week, then free and not capped, then not capped, the
 * highest score in the first tier that has one. A capped account is never picked: with only those
 * left the answer names the first back. Busy is per identity. An account no harness has said
 * anything of yet counts as unused: its windows come only with its first turn's push. */
export function best(rows: Row[], f: Family | null, now: number): Outcome {
  const busyKeys = new Set(rows.filter((r) => r.busy).map((r) => r.key));
  const eff = rows.map((r) => effective(r, f));
  const usable = rows.map((_, i) => i).filter((i) => eff[i] !== null);
  if (!usable.length) return { pick: null, why: rows.length ? `every account's ${f} window is spent` : "no account" };
  const busy = (i: number) => busyKeys.has(rows[i]!.key);
  const cap = (i: number) => !!rows[i]!.spent || capped(eff[i]!);
  // A stale read near its cap may already be full: such an account is the last tried.
  const doubtful = (i: number) => stale(rows[i]!.read, now) && nearCap(eff[i]!);
  const tiers: [string, (i: number) => boolean][] = [
    ["free", (i) => !busy(i) && !cap(i) && !doubtful(i)],
    ["in use, has quota", (i) => !cap(i) && !doubtful(i)],
    ["stale near its cap", (i) => !cap(i)],
  ];
  for (const [name, keep] of tiers) {
    const pool = usable.filter(keep);
    if (!pool.length) continue;
    let top = pool[0]!;
    // On a tie the later wins, as Rust's `max_by` does.
    for (const i of pool) if (score(eff[i]!, now) >= score(eff[top]!, now)) top = i;
    const u = eff[top]!;
    return { pick: top, why: `${name}, 5h ${Math.round(u.five)}% 7d ${Math.round(u.seven)}%${f ? `, ${f}` : ""}` };
  }
  const backs = usable
    .map((i) => ({ slug: rows[i]!.slug, at: later(rows[i]!.spent ?? null, binding(eff[i]!)?.resets ?? null) }))
    .filter((b): b is { slug: string; at: string } => b.at !== null)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const first = backs[0];
  return { pick: null, why: first ? `every account is capped; the first back is ${first.slug} at ${first.at}` : "every account is capped; none says when it is back" };
}

/** How long a prompt cache lives: agents write 1-hour caches, and each is its account's alone. */
export const WARM_MS = 60 * 60_000;

/** The account an agent taken up again stays on: the one its last call ran on (`last`), while that
 * call's cache lives and the account can serve `f` (not spent, no window at 100, the model's window
 * not spent), busy or not; else null, and the pick is `best`'s. Moving it re-writes its whole
 * context at the cache-write price on the new account (design.md, Warm). */
export function warm(rows: Row[], last: { slug: string; at: number } | null, f: Family | null, now: number): Outcome | null {
  if (!last || now - last.at >= WARM_MS) return null;
  const i = rows.findIndex((r) => r.slug === last.slug);
  const u = i < 0 ? null : effective(rows[i]!, f);
  if (!u || rows[i]!.spent || capped(u)) return null;
  return { pick: i, why: `warm, its last call ${Math.max(0, Math.round((now - last.at) / 60_000))} min ago, 5h ${Math.round(u.five)}% 7d ${Math.round(u.seven)}%${f ? `, ${f}` : ""}` };
}

/** When a Claude transcript's lines last have the model answering (ms): its last assistant line,
 * not a subagent's (`isSidechain`) nor one Claude Code wrote itself (model `<synthetic>`, an error).
 * Not the file's mtime: Claude Code writes its `cost-state` and `last-prompt` there as it exits. */
export function lastAnswer(lines: string[]): number | null {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i]!.includes('"assistant"')) continue;
    try {
      const o = JSON.parse(lines[i]!) as { type?: unknown; isSidechain?: unknown; timestamp?: unknown; message?: { model?: unknown } };
      if (o.type !== "assistant" || o.isSidechain === true || o.message?.model === "<synthetic>") continue;
      const at = typeof o.timestamp === "string" ? Date.parse(o.timestamp) : NaN;
      if (Number.isFinite(at)) return at;
    } catch {}
  }
  return null;
}

/** The later of two ISO times; either may be null. */
export function later(a: string | null, b: string | null): string | null {
  if (a === null || Number.isNaN(Date.parse(a))) return b;
  if (b === null || Number.isNaN(Date.parse(b))) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

// ---- one row per login, as pages see it: no token, no email, no uuid ----

/** An account: one setup-token in the keychain (`abyme-accounts-<slug>`), its login. */
export type Account = { slug: string; key: string };

/** The setup-tokens `security dump-keychain` lists (attributes only, never a secret): each
 * `abyme-accounts-<slug>` item's slug and when it was last written (`mdat`, ms), a token made again
 * replacing the one before. */
export function tokensListed(dump: string): { slug: string; made: number | null }[] {
  const out: { slug: string; made: number | null }[] = [];
  for (const block of dump.split(/^keychain: /m)) {
    const slug = /"svce"<blob>="abyme-accounts-([a-z0-9._-]+)"/.exec(block)?.[1];
    if (!slug || out.some((t) => t.slug === slug)) continue;
    out.push({ slug, made: keychainMade(block, "mdat") });
  }
  return out;
}

/** What a login's last read said: its windows, or why they are unknown. */
export type Read = { at: number; usage: Usage; windows: ModelWindow[] };
/** A login out of every pick until `until` (ms), by the window that capped it if known. */
export type Spent = { until: number; window: Window | null };

/** One login as pages and `accounts view` see it (design.md). */
export type AccountSeen = {
  slugs: string[];
  five: number | null;
  seven: number | null;
  fiveResets: string | null;
  sevenResets: string | null;
  windows: { name: string; utilization: number | null; resetsAt: string | null }[];
  capped: boolean;
  binding: Window | null;
  back: string | null;
  /** Until when a turn's limit keeps it out of picks, and by which window if known; null when none does. */
  spent: { until: string; window: Window | null } | null;
  read: string | null;
  /** Its read is older than STALE_MS: the numbers may no longer stand. */
  stale: boolean;
  agents: number;
};

/** The setup-token `claude setup-token` printed, out of its whole output; null when it printed none. */
export const tokenFrom = (out: string): string | null => /sk-ant-oat01-[A-Za-z0-9_-]{20,}/.exec(out)?.[0] ?? null;

/** A setup-token is good for a year: when one made at `made` (ms) ends. */
export const YEAR_MS = 365 * 86_400_000;
export const tokenEnds = (made: number) => made + YEAR_MS;

/** Whether a token ending at `ends` (ms) is within the 30 days the status bar warns of it. */
export const tokenWarns = (ends: number, now: number) => ends - now < 30 * 86_400_000;

/** When the keychain says an item was made (`cdat`) or last written (`mdat`)
 * (`"cdat"<timedate>=… "20261024013000Z…"`), in ms. */
export function keychainMade(out: string, field: "cdat" | "mdat" = "cdat"): number | null {
  const m = new RegExp(`"${field}"<timedate>=[^"]*"(\\d{4})(\\d\\d)(\\d\\d)(\\d\\d)(\\d\\d)(\\d\\d)Z`).exec(out);
  return m ? Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!, +m[6]!) : null;
}

/** A login's row as load's `Account` (resource-budgets): its id the folders' slugs, its 5-hour and
 * weekly windows a share of 1 (null when unknown, never 0), when each resets, and capped on the
 * window that binds, or on the one a spent mark names (the five hours when it names none) until the
 * mark ends: what a pick takes, so a limited agent waits for an account a pick would give it. What
 * load shows in Resources and admits turns by. */
export type LoadWindow = { name: "5h" | "week"; used: number | null; tokens: null; resets: number | null; capped: boolean };
export type LoadAccount = { id: string; label: string; folders: string[]; windows: LoadWindow[]; estimate: false };
export function loadAccounts(rows: readonly AccountSeen[]): LoadAccount[] {
  const at = (t: string | null) => (t === null || Number.isNaN(Date.parse(t)) ? null : Date.parse(t));
  const share = (n: number | null) => (n === null ? null : n / 100);
  const window = (r: AccountSeen, name: LoadWindow["name"], w: Window, used: number | null, resets: string | null): LoadWindow => {
    // Capped by its read: the window itself at 100 (`capped` also says a spent mark).
    const read = (used ?? 0) >= 100;
    const spent = !!r.spent && (r.spent.window ?? "five") === w;
    return { name, used: share(used), tokens: null, resets: at(spent ? (read ? later(resets, r.spent!.until) : r.spent!.until) : resets), capped: read || spent };
  };
  return rows.map((r) => ({
    id: r.slugs.join(","),
    label: r.slugs[0] ?? "?",
    folders: r.slugs,
    windows: [window(r, "5h", "five", r.five, r.fiveResets), window(r, "week", "seven", r.seven, r.sevenResets)],
    estimate: false,
  }));
}

/** A reset time to the minute: abymeds sharing a read answer it a second apart. */
export const minute = (t: string | null): string | null => {
  const at = t ? Date.parse(t) : NaN;
  return Number.isNaN(at) ? t : new Date(Math.round(at / 60_000) * 60_000).toISOString();
};

/** The rows: one per login, in the accounts' order (main first, then by name). `capped` is a window
 * its read has at 100, or a spent mark, until it resets: a mark is a refusal the account itself gave
 * (a rejected push, a turn at its limit; pushes are per account since setup-tokens, so another
 * login's limit no longer marks it). `stale` is a read older than STALE_MS. `agentsIn` is the busy
 * agents on each login, `spent` the marks standing. */
export function rowsSeen(accounts: Account[], reads: Map<string, Read>, agentsIn: Map<string, number>, spent: Map<string, Spent> = new Map(), now = Date.now()): AccountSeen[] {
  const groups = new Map<string, Account[]>();
  for (const a of accounts) groups.set(a.key, [...(groups.get(a.key) ?? []), a]);
  return [...groups].map(([key, members]) => {
    const x = reads.get(key);
    const u = x ?? null;
    const bound = u ? binding(u.usage) : null;
    const mark = spent.get(key);
    return {
      slugs: members.map((m) => m.slug),
      five: u ? u.usage.five : null,
      seven: u ? u.usage.seven : null,
      fiveResets: minute(u?.usage.fiveResets ?? null),
      sevenResets: minute(u?.usage.sevenResets ?? null),
      windows: (u?.windows ?? []).map((w) => ({ name: w.name, utilization: w.utilization, resetsAt: minute(w.resetsAt) })),
      // A spent mark is a refusal the account itself gave (a rejected push, a turn at its limit):
      // capped until it resets, whatever its read says.
      capped: !!bound || !!mark,
      binding: bound?.window ?? mark?.window ?? null,
      back: minute(later(bound?.resets ?? null, mark ? new Date(mark.until).toISOString() : null)),
      spent: mark ? { until: minute(new Date(mark.until).toISOString())!, window: mark.window } : null,
      read: u ? new Date(u.at).toISOString() : null,
      stale: stale(u?.at, now),
      agents: agentsIn.get(key) ?? 0,
    };
  });
}

// ---- what a harness says each turn (abyme's `usage_limits` on an agent) ----

/** One window as a harness said it: abyme's `UsageLimit` (`@abyme/agents`). */
export type Pushed = { window: string | null; state: "allowed" | "warning" | "rejected"; utilization: number | null; resets_at: string | null; at: string };

/** A login's read: what its harnesses last said, each window under its name as they say it. */
export type Kept = { at: number; data: Raw };

/** A login's read after what its agents' harnesses said: each `five_hour` or `seven_day` entry newer
 * than both the read (`base`) and the last taken overwrites that window, the other and the model
 * windows kept. Answers the read, its new time, and each window said `rejected` with its reset; null
 * when nothing is newer. With no base, the read starts from what was said: a window not said yet
 * reads as unused, as an account no harness has spoken of does. */
export function takePushes(base: Kept | undefined, pushes: Pushed[], taken: number): { at: number; data: Raw; rejected: { window: Window; resets: string | null }[] } | null {
  const since = Math.max(base?.at ?? 0, taken);
  const fresh = pushes.filter((p) => (p.window === "five_hour" || p.window === "seven_day") && Date.parse(p.at) > since).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (!fresh.length) return null;
  const data: Raw = base ? { ...base.data } : {};
  const rejected: { window: Window; resets: string | null }[] = [];
  for (const p of fresh) {
    if (p.state === "rejected") rejected.push({ window: p.window === "five_hour" ? "five" : "seven", resets: p.resets_at });
    const was = obj(data[p.window!]) ?? {};
    // A window said with no number keeps the one read; with neither it stays as it was. A refused
    // window is full, whatever number came with it.
    const said = p.utilization ?? num(was.utilization);
    const utilization = p.state === "rejected" ? Math.max(100, said ?? 0) : said;
    if (utilization !== null) data[p.window!] = { ...was, utilization, resets_at: p.resets_at ?? str(was.resets_at) };
  }
  return { at: Date.parse(fresh[fresh.length - 1]!.at), data, rejected };
}
