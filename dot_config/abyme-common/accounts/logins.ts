// Claude's accounts as Settings → Accounts reads them: one login per account, its state from its
// `Ready` (failing while refused, expired while its setup-token has ended, else working: a limit is
// not a broken login). Pure: test.ts checks it; client.tsx adds its buttons.
import type { AccountSeen } from "./pick.ts";
import type { ReadyShown } from "./kind.ts";

/** What the logins view reads of accounts' view. */
export type LoginsView = { accounts: AccountSeen[]; tokens?: Record<string, string>; orgs?: Record<string, string>; ready?: Record<string, ReadyShown | null> };
/** A login as Accounts draws it, less its buttons; `slug` the one its fix signs in. */
export type ClaudeLogin = { id: string; slug: string; name: string; detail: string; state: "working" | "expired" | "failing"; why?: string;
  /** Its organization's uuid, once read: what Accounts joins the terminal's sign-in on (logins.marks). */
  org?: string };

/** Its week, or the limit it is out of, and when its setup-token ends. */
function detailOf(a: AccountSeen, tokens: Record<string, string>): string {
  const limit = a.spent && !a.spent.why ? `${a.spent.window === "five" ? "5-hour" : "weekly"} limit used up until ${a.spent.until.slice(0, 16).replace("T", " ")}` : null;
  const week = limit ?? (a.capped && !a.spent?.why ? `capped${a.back ? ` until ${a.back.slice(0, 16).replace("T", " ")}` : ""}` : a.seven === null ? "week not read yet" : `week ${Math.round(a.seven)}% used`);
  const ends = a.slugs.map((s) => tokens[s]).filter((t): t is string => !!t).sort()[0];
  return ends ? `${week} · token ends ${ends.slice(0, 10)}` : week;
}

/** Each account of `v` as a login. */
export function claudeLogins(v: LoginsView): ClaudeLogin[] {
  return v.accounts.map((a) => {
    const id = a.slugs[0] ?? "";
    const r = v.ready?.[id];
    const state = r?.status === "False" && r.reason === "Unauthorized" ? "failing" : r?.status === "False" && r.reason === "Expired" ? "expired" : "working";
    const org = a.slugs.map((s) => v.orgs?.[s]).find(Boolean);
    return { id, slug: id, name: a.slugs.join(", "), detail: detailOf(a, v.tokens ?? {}), state, ...(state !== "working" && r?.message ? { why: r.message } : {}), ...(org ? { org } : {}) };
  });
}
