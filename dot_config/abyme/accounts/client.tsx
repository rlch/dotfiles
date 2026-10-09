// accounts, in every page: each account's quota in the status bar, and "Run on account…" in an
// agent's menu, which pins the account that agent's resumes run on.
import accounts from "@abyme/accounts";
import agents from "@abyme/agents";
import commands from "@abyme/commands";
import menus from "@abyme/menus";
import notifications from "@abyme/notifications";
import palette from "@abyme/palette";
import status from "@abyme/status";
import { Quota } from "./segment.tsx";

const BY_QUOTA = "accounts.none";

/** The session of the agent a menu was opened on. */
const sessionOf = (target?: { all: Record<string, unknown> }): string | null =>
  (agents.store.getState().agents[String(target?.all.agent)]?.session_id as string | null | undefined) ?? null;

async function choose(session: string) {
  const [seen, pins] = await Promise.all([accounts.server.view(), accounts.server.pins()]);
  const now = (pins as Record<string, string>)[session];
  palette.pick({
    placeholder: "The account this agent's resumes run on",
    items: [
      { id: BY_QUOTA, title: "By quota, as any launch" },
      ...(seen as { accounts: { slug: string; five: number | null; seven: number | null }[] }).accounts.map((a) => ({
        id: a.slug,
        title: a.five === null ? a.slug : `${a.slug}  5h ${Math.round(a.five)}%  7d ${Math.round(a.seven ?? 0)}%`,
        keywords: [a.slug],
      })),
    ],
    active: now ?? BY_QUOTA,
    onPick: (id) =>
      void accounts.server.pin({ session, slug: id === BY_QUOTA ? null : id }).catch((e: Error) => notifications.notify({ level: "error", title: "Not pinned", body: e.message })),
  });
}

commands.register({
  id: "accounts.pin",
  title: "Run on account…",
  group: "Agents",
  targeted: true,
  run: (_event, target) => {
    const session = sessionOf(target);
    if (session) void choose(session);
  },
});
menus.register({ kind: "agent", command: "accounts.pin", group: "agent", order: 40, when: (t) => sessionOf(t) !== null && (agents.store.getState().agents[String(t.all.agent)]?.kind ?? "claude") === "claude" });
status.segments.register({ id: "accounts.quota", side: "right", order: 30, Component: Quota });
