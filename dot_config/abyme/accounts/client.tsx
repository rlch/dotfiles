// accounts, in every page: each account's quota in the status bar, an Account field in New agent,
// the account in each agent's row and chat header, and "Run on account…" in an agent's menu, which
// pins the account that agent's resumes run on.
import abyme from "@abyme/plugin";
import accounts from "@abyme/accounts";
import agents from "@abyme/agents";
import { createStore, type AgentBadge } from "@abyme/client";
import commands from "@abyme/commands/inventory";
import menus from "@abyme/menus/inventory";
import notifications from "@abyme/notifications";
import palette from "@abyme/palette";
import status from "@abyme/status/inventory";
import { Quota } from "./segment.tsx";

/** The value of "pick by quota", in the field and the picker; the server half's too. */
const BY_QUOTA = "auto";

type View = { accounts: { slug: string; five: number | null; seven: number | null; capped: boolean; error: string | null }[]; agents: { agent: string; slug: string; pinned: boolean }[] };
const seen = accounts.server.view();
const view = (): View | undefined => seen.getState() as View | undefined;
const label = (a: View["accounts"][number]) => (a.five === null ? a.slug : `${a.slug}  5h ${Math.round(a.five)}%  7d ${Math.round(a.seven ?? 0)}%`);

const options = createStore<readonly { value: string; name: string; description?: string }[]>([]);
const badges = createStore<ReadonlyMap<string, AgentBadge>>(new Map());
function follow() {
  const v = view();
  if (!v) return;
  options.set(() => (v.accounts.length < 2 ? [] : [{ value: BY_QUOTA, name: "By quota" }, ...v.accounts.map((a) => ({ value: a.slug, name: a.slug, description: label(a) }))]));
  badges.set(() => new Map(v.agents.map((x) => [x.agent, { text: x.slug, tooltip: x.pinned ? `On ${x.slug}, pinned` : `On ${x.slug}, by quota` }])));
}
abyme.effect(() => seen.on("change", follow));
follow();

agents.fields.add({ id: "accounts.account", title: "Account", options, default: BY_QUOTA });
agents.badges.add({ id: "accounts.account", store: badges });

/** The agent a menu was opened on, if abyme knows it. */
const agentOf = (target?: { all: Record<string, unknown> }): string | null => {
  const id = String(target?.all.agent ?? "");
  return agents.store.getState().agents[id] ? id : null;
};

async function choose(agent: string) {
  const [v, pins] = await Promise.all([accounts.server.view(), accounts.server.pins()]);
  palette.pick({
    placeholder: "The account this agent's resumes run on",
    items: [{ id: BY_QUOTA, title: "By quota, as any launch" }, ...(v as View).accounts.map((a) => ({ id: a.slug, title: label(a), keywords: [a.slug] }))],
    active: (pins as Record<string, string>)[agent] ?? BY_QUOTA,
    onPick: (id) =>
      void accounts.server.pin({ agent, slug: id === BY_QUOTA ? null : id }).catch((e: Error) => notifications.notify({ level: "error", title: "Not pinned", body: e.message })),
  });
}

commands.add({
  id: "accounts.pin",
  title: "Run on account…",
  group: "Agents",
  targeted: true,
  run: (_event, target) => {
    const agent = agentOf(target);
    if (agent) void choose(agent);
  },
});
menus.add({ kind: "agent", command: "accounts.pin", group: "agent", order: 40, when: (t) => agentOf(t) !== null && (agents.store.getState().agents[agentOf(t)!]?.kind ?? "claude") === "claude" });
status.segments.add({ id: "accounts.quota", side: "right", order: 30, Component: Quota });
