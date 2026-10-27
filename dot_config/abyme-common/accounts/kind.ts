// accounts' kind, `Account`, kept in kinds' store: a login as a record, and its `Ready`.
// Pure: test.ts checks it.
import type { Condition } from "@abyme/kinds";
import type { Written } from "@abyme/kinds/stored";
import type { AccountSeen } from "./pick.ts";

/** A login's `Ready`, as accounts observes it: False while it is capped (reason `Capped`) or a
 * turn's limit keeps it out of picks (reason `Spent`), each with when it is back; True otherwise. */
export function accountReady(a: AccountSeen): Omit<Condition, "since"> {
  const no = (reason: string, message: string) => ({ type: "Ready", status: "False" as const, reason, message, observedBy: "accounts" });
  if (a.spent) return no("Spent", `spent until ${a.spent.until}`);
  if (a.capped) return no("Capped", a.back ? `capped until ${a.back}` : "capped");
  return { type: "Ready", status: "True", reason: "Ready", observedBy: "accounts" };
}

/** An `Account`'s spec: the login's slugs. */
export type AccountSpec = { slugs: string[] };
/** An `Account`'s status: its phase, windows and agents, and its `Ready`. */
export type AccountStatus = { phase: "open" | "capped" | "spent"; five: number | null; seven: number | null; agents: number; stale: boolean; conditions: Condition[] };

/** A login's id in kinds' store: its first slug. */
export const accountId = (a: AccountSeen) => a.slugs[0] ?? "";

/** A login as accounts writes it to kinds' store, `Account`: its slugs its spec, its windows and
 * agents its status. No owner: a login is no one's work. */
export const accountStored = (a: AccountSeen, conditions: readonly Condition[]): Written<AccountSpec, AccountStatus> => ({
  name: a.slugs.join(", "),
  owners: [],
  trace: null,
  spec: { slugs: a.slugs },
  status: { phase: a.spent ? "spent" : a.capped ? "capped" : "open", five: a.five, seven: a.seven, agents: a.agents, stale: a.stale, conditions: [...conditions] },
});

/** What a reader acts on at once: its phase and `Ready`. Its windows, agents and staleness move each
 * turn, and wait. */
export const accountUrgent = ({ phase, conditions }: AccountStatus) => JSON.stringify([phase, conditions]);
