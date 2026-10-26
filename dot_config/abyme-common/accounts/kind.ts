// accounts' kind, `Account`, for kinds' describe and stuck: a login as a record, and its `Ready`.
// Pure: test.ts checks it.
import type { Condition, KindRecord } from "@abyme/kinds";
import type { AccountSeen } from "./pick.ts";

/** A login's `Ready`, as accounts observes it: False while it is capped (reason `Capped`) or a
 * turn's limit keeps it out of picks (reason `Spent`), each with when it is back; True otherwise. */
export function accountReady(a: AccountSeen): Omit<Condition, "since"> {
  const no = (reason: string, message: string) => ({ type: "Ready", status: "False" as const, reason, message, observedBy: "accounts" });
  if (a.spent) return no("Spent", `spent until ${a.spent.until}`);
  if (a.capped) return no("Capped", a.back ? `capped until ${a.back}` : "capped");
  return { type: "Ready", status: "True", reason: "Ready", observedBy: "accounts" };
}

/** A login as kinds reads it, `Account`: its slugs its spec, its windows and agents its status. */
export const accountRecord = (a: AccountSeen, conditions: readonly Condition[]): KindRecord => ({
  kind: "Account",
  id: a.slugs[0] ?? "",
  name: a.slugs.join(", "),
  owners: [],
  deadline: null,
  spec: { slugs: a.slugs },
  status: { phase: a.spent ? "spent" : a.capped ? "capped" : "open", five: a.five, seven: a.seven, agents: a.agents, stale: a.stale, conditions: [...conditions] },
});
