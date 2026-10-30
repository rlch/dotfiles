// accounts' kind, `Account`, kept in records' store: a login as a record, and its `Ready`.
// Pure: test.ts checks it.
import type { Condition } from "@abyme/records/condition";
import type { Written } from "@abyme/records/stored";
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

/** A login's id in records' store: its first slug. */
export const accountId = (a: AccountSeen) => a.slugs[0] ?? "";

/** A login as accounts writes it to records' store, `Account`: its slugs its spec, its windows and
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

/** What a write calls of the `Account` handle (`records.define`). */
export type AccountRecords = {
  get(id: string): { node: string; lease?: { node: string } | null; status: { conditions: Condition[] } } | null;
  apply(id: string, spec: AccountSpec, o: { name: string; owners: []; trace: null }): Promise<unknown>;
  conditions(id: string, set: Condition[], o: { drop: string[] }): Promise<unknown>;
  status(id: string, patch: Omit<AccountStatus, "conditions">): Promise<unknown>;
  delete(id: string): Promise<unknown>;
};

/** Writes login `id`'s record as `r`, on node `node`: deleted once the keychain lists none. One
 * another node writes (homed there, its lease not this node's) is that node's accounts' to write.
 * Its status is not waited on: one whose phase is as it was waits up to its coalesce, and the next
 * write's change merges into it. */
export async function writeAccount(h: AccountRecords, node: string, id: string, r: Written<AccountSpec, AccountStatus> | null, warn: (...args: unknown[]) => void): Promise<void> {
  const was = h.get(id);
  if (was && was.node !== node && was.lease?.node !== node) return;
  if (!r) {
    if (was) await h.delete(id);
    return;
  }
  await h.apply(id, r.spec, { name: r.name, owners: [], trace: null });
  const { conditions, ...status } = r.status;
  const drop = (was?.status.conditions ?? []).map((c) => c.type).filter((type) => !conditions.some((c) => c.type === type));
  await h.conditions(id, conditions, { drop });
  h.status(id, status).catch((e: unknown) => warn(`accounts: writing ${id}'s status:`, e));
}
