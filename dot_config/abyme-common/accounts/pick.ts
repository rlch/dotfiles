// clodcurrent's picking, as it is in ~/dev/clodcurrent/src (usage.rs, select.rs, model.rs,
// usage_cache.rs), with nothing of abyme in it: server.ts gives it the accounts and their usage
// answers, and test.ts (in the dotfiles source only, never deployed) checks it.

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

/** Between reads, the last read when it was an error newer than the answer kept: an older answer
 * must not hide it. It did: "hsone is signed out" was raised by each 5-minute read and cleared 2 s
 * later by the next agent change (2026-10-21). */
export const errorWins = (kept: { at: number } | undefined, read: { at: number; error?: string } | undefined): boolean =>
  read?.error !== undefined && (kept === undefined || read.at >= kept.at);

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

/** How old a kept read may be and still stand for a failed one. */
export const STALE_OK_MS = 30 * 60_000;

/** Whether a kept read may stand for a read that failed: one with a window at 100 and its reset
 * still ahead stands at any age, as a cap does not lift before its reset (hsone, 7d at 100 until
 * 2026-10-25, showed no numbers while its reads failed, 2026-10-23); else under STALE_OK_MS old and
 * not near a cap (5h under 90, 7d under 85). Near a cap an old read hides the cap: tuteroai read
 * "7d 93%" for 50 picks while it ran into its week (2026-10-23). `u` has its past windows zeroed. */
export const staleOk = (u: Usage, age: number): boolean => {
  const b = binding(u);
  if (b && Number.isFinite(Date.parse(b.resets ?? ""))) return true;
  return age < STALE_OK_MS && u.five < 90 && u.seven < 85;
};

/** The usage with the model's window as the binding week, when it is the more used. */
function withWindow(u: Usage, w: ModelWindow): Usage {
  return w.utilization !== null && w.utilization > u.seven ? { ...u, seven: w.utilization, sevenResets: w.resetsAt ?? u.sevenResets } : u;
}

/** An account to pick from: `spent` is until when a turn's limit keeps it out (ISO), if it does. */
export type Row = { slug: string; key: string; usage: Usage | null; windows: ModelWindow[]; busy: boolean; spent?: string | null };
export type Outcome = { pick: number; why: string } | { pick: null; why: string };

/** clodcurrent's `best_for`, without its capped tiers: an account whose window for the model is
 * spent is out, the model's window binds the week, then free and not capped, then not capped, the
 * highest score in the first tier that has one. A capped account is never picked: with only those
 * left the answer names the first back. Busy is per identity. */
export function best(rows: Row[], f: Family | null, now: number): Outcome {
  const busyKeys = new Set(rows.filter((r) => r.busy).map((r) => r.key));
  const eff = rows.map((r) => {
    if (!r.usage) return null;
    const w = f ? windowFor(r.windows, f) : null;
    if (w && w.utilization !== null && w.utilization >= 100) return null;
    return w ? withWindow(r.usage, w) : r.usage;
  });
  const usable = rows.map((_, i) => i).filter((i) => eff[i] !== null);
  if (!usable.length)
    return { pick: null, why: rows.some((r) => r.usage) ? `every account's ${f} window is spent` : "no account's usage could be read" };
  const busy = (i: number) => busyKeys.has(rows[i]!.key);
  const cap = (i: number) => !!rows[i]!.spent || capped(eff[i]!);
  const tiers: [string, (i: number) => boolean][] = [
    ["free", (i) => !busy(i) && !cap(i)],
    ["in use, has quota", (i) => !cap(i)],
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

/** The later of two ISO times; either may be null. */
export function later(a: string | null, b: string | null): string | null {
  if (a === null || Number.isNaN(Date.parse(a))) return b;
  if (b === null || Number.isNaN(Date.parse(b))) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

// ---- one row per login, as pages see it: no token, no email, no uuid ----

/** An account folder: `key` is its login (accountUuid, else email), read from its `.claude.json`
 * at every look, never kept, so a folder signed in again as another login moves at once. */
export type Folder = { slug: string; dir: string; key: string };

/** A login's identity as its `.claude.json` says it; null when it has none. */
export function loginOf(text: string | null): { email: string; uuid?: string; key: string } | null {
  try {
    const a = (JSON.parse(text ?? "{}") as { oauthAccount?: { emailAddress?: string; accountUuid?: string } }).oauthAccount;
    return a?.emailAddress ? { email: a.emailAddress, uuid: a.accountUuid, key: a.accountUuid ?? `email:${a.emailAddress}` } : null;
  } catch {
    return null;
  }
}

/** What a login's last read said: its windows, or why they are unknown. */
export type Read = { at: number; usage: Usage; windows: ModelWindow[] } | { at: number; error: string };
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
  read: string | null;
  error: string | null;
  agents: number;
};

/** The setup-token `claude setup-token` printed, out of its whole output; null when it printed none. */
export const tokenFrom = (out: string): string | null => /sk-ant-oat01-[A-Za-z0-9_-]{20,}/.exec(out)?.[0] ?? null;

/** A setup-token is good for a year: when one made at `made` (ms) ends. */
export const YEAR_MS = 365 * 86_400_000;
export const tokenEnds = (made: number) => made + YEAR_MS;

/** Whether a token ending at `ends` (ms) is within the 30 days the status bar warns of it. */
export const tokenWarns = (ends: number, now: number) => ends - now < 30 * 86_400_000;

/** When `security find-generic-password` says an item was made (`"cdat"<timedate>=… "20261024013000Z…"`), in ms. */
export function keychainMade(out: string): number | null {
  const m = /"cdat"<timedate>=[^"]*"(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)Z/.exec(out);
  return m ? Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!, +m[6]!) : null;
}

/** A login's row as load's `Account` (resource-budgets): its id the folders' slugs, its 5-hour and
 * weekly windows a share of 1 (null when unknown, never 0), when each resets, and capped on the
 * window that binds. What load shows in Resources and admits turns by. */
export type LoadWindow = { name: "5h" | "week"; used: number | null; tokens: null; resets: number | null; capped: boolean };
export type LoadAccount = { id: string; label: string; folders: string[]; windows: LoadWindow[]; estimate: false; error: string | null };
export function loadAccounts(rows: readonly AccountSeen[]): LoadAccount[] {
  const at = (t: string | null) => (t === null || Number.isNaN(Date.parse(t)) ? null : Date.parse(t));
  const share = (n: number | null) => (n === null ? null : n / 100);
  return rows.map((r) => ({
    id: r.slugs.join(","),
    label: r.slugs[0] ?? "?",
    folders: r.slugs,
    windows: [
      { name: "5h", used: share(r.five), tokens: null, resets: at(r.fiveResets), capped: r.capped && r.binding === "five" },
      { name: "week", used: share(r.seven), tokens: null, resets: at(r.sevenResets), capped: r.capped && r.binding === "seven" },
    ],
    estimate: false,
    error: r.error,
  }));
}

/** A reset time to the minute: abymeds sharing a read answer it a second apart. */
export const minute = (t: string | null): string | null => {
  const at = t ? Date.parse(t) : NaN;
  return Number.isNaN(at) ? t : new Date(Math.round(at / 60_000) * 60_000).toISOString();
};

/** The rows: one per login, in the folders' order (main first, then by name), each with every
 * folder of it. `capped` is a window its read has at 100, until that window resets, and nothing
 * else: a spent mark keeps a login out of picks but is not shown as a cap (main, 5h 1%, showed
 * capped by another login's limit, 2026-10-23). */
export function rowsSeen(folders: Folder[], reads: Map<string, Read>, agentsIn: Map<string, number>): AccountSeen[] {
  const groups = new Map<string, Folder[]>();
  for (const f of folders) groups.set(f.key, [...(groups.get(f.key) ?? []), f]);
  return [...groups].map(([key, members]) => {
    const x = reads.get(key);
    const u = x && "usage" in x ? x : null;
    const bound = u ? binding(u.usage) : null;
    return {
      slugs: members.map((m) => m.slug),
      five: u ? u.usage.five : null,
      seven: u ? u.usage.seven : null,
      fiveResets: minute(u?.usage.fiveResets ?? null),
      sevenResets: minute(u?.usage.sevenResets ?? null),
      windows: (u?.windows ?? []).map((w) => ({ name: w.name, utilization: w.utilization, resetsAt: minute(w.resetsAt) })),
      capped: !!bound,
      binding: bound?.window ?? null,
      back: minute(bound?.resets ?? null),
      read: u ? new Date(u.at).toISOString() : null,
      error: x && "error" in x ? x.error : null,
      agents: members.reduce((n, m) => n + (agentsIn.get(m.dir) ?? 0), 0),
    };
  });
}

// ---- what a harness says each turn (abyme's `usage_limits` on an agent) ----

/** One window as a harness said it: abyme's `UsageLimit` (`@abyme/agents`). */
export type Pushed = { window: string | null; state: "allowed" | "warning" | "rejected"; utilization: number | null; resets_at: string | null; at: string };

/** A login's endpoint read: the newer of this abymed's and the shared file's. */
export type Kept = { at: number; data: Raw };
export const newest = (mine: Kept | undefined, theirs: Kept | undefined): Kept | undefined => (theirs && (!mine || theirs.at > mine.at) ? theirs : mine);

/** Whether a harness's refusal is not believed: the login's own endpoint read (`own`, its past
 * windows zeroed) is newer than the refusal and shows that window under 95. The newer word wins, as
 * in `takePushes`: an older read never hides a refusal. abyme kept an agent's pushes when it moved to
 * another login (2026-10-23), and such a push keeps its old time while a login in use reads every
 * 60 s. */
export function disbelieved(p: Pushed, own: { at: number; usage: Usage } | null): boolean {
  const w = p.window === "seven_day" ? "seven" : p.window === "five_hour" ? "five" : null;
  return p.state === "rejected" && w !== null && own !== null && own.at > Date.parse(p.at) && own.usage[w] < 95;
}

/** A login's read after what its agents' harnesses said: each `five_hour` or `seven_day` entry newer
 * than both the read (`base`, the newest of `newest`) and the last taken overwrites that window,
 * the others and the model windows kept. Answers the read, its new time, and each window said
 * `rejected` with its reset; null when nothing is newer. With no base, no read (`data` null): one
 * window alone would read the other as 0. */
export function takePushes(base: Kept | undefined, pushes: Pushed[], taken: number): { at: number; data: Raw | null; rejected: { window: Window; resets: string | null }[] } | null {
  const since = Math.max(base?.at ?? 0, taken);
  const fresh = pushes.filter((p) => (p.window === "five_hour" || p.window === "seven_day") && Date.parse(p.at) > since).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (!fresh.length) return null;
  const data: Raw | null = base ? { ...base.data } : null;
  const rejected: { window: Window; resets: string | null }[] = [];
  for (const p of fresh) {
    if (p.state === "rejected") rejected.push({ window: p.window === "five_hour" ? "five" : "seven", resets: p.resets_at });
    if (!data) continue;
    const was = obj(data[p.window!]) ?? {};
    // A window said with no number keeps the one read; with neither it stays as it was. A refused
    // window is full, whatever number came with it.
    const said = p.utilization ?? num(was.utilization);
    const utilization = p.state === "rejected" ? Math.max(100, said ?? 0) : said;
    if (utilization !== null) data[p.window!] = { ...was, utilization, resets_at: p.resets_at ?? str(was.resets_at) };
  }
  return { at: Date.parse(fresh[fresh.length - 1]!.at), data, rejected };
}
