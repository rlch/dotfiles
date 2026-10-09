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

/** The usage with the model's window as the binding week, when it is the more used. */
function withWindow(u: Usage, w: ModelWindow): Usage {
  return w.utilization !== null && w.utilization > u.seven ? { ...u, seven: w.utilization, sevenResets: w.resetsAt ?? u.sevenResets } : u;
}

export type Row = { slug: string; key: string; usage: Usage | null; windows: ModelWindow[]; busy: boolean };
export type Outcome = { pick: number; why: string } | { pick: null; why: string };

/** clodcurrent's `best_for`: an account whose window for the model is spent is out, the model's
 * window binds the week, then the tiers (free and not capped; not capped; free; any), the highest
 * score in the first tier that has one. Busy is per identity. */
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
  const cap = (i: number) => capped(eff[i]!);
  const tiers: [string, (i: number) => boolean][] = [
    ["free", (i) => !busy(i) && !cap(i)],
    ["in use, has quota", (i) => !cap(i)],
    ["free, capped", (i) => !busy(i)],
    ["in use, capped", () => true],
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
  return { pick: null, why: "no account" };
}
