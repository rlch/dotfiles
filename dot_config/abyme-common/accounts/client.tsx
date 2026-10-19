// accounts, in every page: each account's quota in the status bar, an Account field in New agent,
// and "Run on account…" in an agent's menu, which pins the account that agent's resumes run on;
// `/login` in a Claude agent's composer opens the same picker. "Sign in to Claude account…" runs
// an account's browser login in a terminal, and an account found signed out says so with a button.
import abyme from "@abyme/plugin";
import accounts from "@abyme/accounts";
import agents from "@abyme/agents";
import chat from "@abyme/chat/inventory";
import { createStore } from "@abyme/client";
import commands from "@abyme/commands/inventory";
import menus from "@abyme/menus/inventory";
import notifications from "@abyme/notifications";
import palette from "@abyme/palette";
import status from "@abyme/status/inventory";
import terminal from "@abyme/terminal";
import { Quota } from "./segment.tsx";

/** The value of "pick by quota", in the field and the picker; the server half's too. */
const BY_QUOTA = "auto";

type View = { accounts: { slug: string; five: number | null; seven: number | null; capped: boolean; error: string | null }[]; agents: { agent: string; slug: string; pinned: boolean }[] };
const seen = accounts.server.view();
const view = (): View | undefined => seen.getState() as View | undefined;
const label = (a: View["accounts"][number]) => (a.five === null ? a.slug : `${a.slug}  5h ${Math.round(a.five)}%  7d ${Math.round(a.seven ?? 0)}%`);

const options = createStore<readonly { value: string; name: string; description?: string }[]>([]);
function follow() {
  const v = view();
  if (!v) return;
  options.set(() => (v.accounts.length < 2 ? [] : [{ value: BY_QUOTA, name: "By quota" }, ...v.accounts.map((a) => ({ value: a.slug, name: a.slug, description: label(a) }))]));
}
abyme.effect(() => seen.on("change", follow));
follow();

agents.fields.add({ id: "accounts.account", title: "Account", options, default: BY_QUOTA });

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
chat.slash.add({ name: "login", harness: "claude", description: "Choose the account this agent runs on", action: ({ agent }) => (agent ? void choose(agent) : "pass") });
menus.add({ kind: "agent", command: "accounts.pin", group: "agent", order: 40, when: (t) => agentOf(t) !== null && (agents.store.getState().agents[agentOf(t)!]?.kind ?? "claude") === "claude" });
/** Its browser login, in a terminal of its own, in front. */
async function signIn(slug: string) {
  try {
    const { shell } = (await accounts.server.login({ slug })) as { shell: string };
    terminal.open("shell", shell, { kind: "go", focus: true, event: { keep: true } });
  } catch (e) {
    notifications.notify({ level: "error", title: `${slug} not signed in`, body: (e as Error).message });
  }
}

const OUT = new Set(["signed out", "no credentials", "unauthorized"]);
commands.add({
  id: "accounts.signin",
  title: "Sign in to Claude account…",
  group: "Agents",
  run: async () => {
    const v = (await accounts.server.view()) as View;
    const first = [...v.accounts].sort((a, b) => Number(OUT.has(b.error ?? "")) - Number(OUT.has(a.error ?? "")));
    palette.pick({
      placeholder: "The account to sign in to again",
      items: first.map((a) => ({ id: a.slug, title: a.error ? `${a.slug}  ${a.error}` : label(a), keywords: [a.slug] })),
      onPick: (slug) => void signIn(slug),
    });
  },
});

/** Each account found signed out or with no login, a notice that stays until it is back. */
const told = new Map<string, { dispose(): void }>();
function tell() {
  for (const a of view()?.accounts ?? []) {
    const had = told.get(a.slug);
    if (!OUT.has(a.error ?? "")) {
      had?.dispose();
      told.delete(a.slug);
      continue;
    }
    if (had) continue;
    told.set(
      a.slug,
      notifications.notify({
        level: "warning",
        key: `accounts.signedout.${a.slug}`,
        title: `${a.slug} is signed out`,
        body: "Its login has ended; no agent is started on it until you sign in again.",
        sticky: true,
        resolved: `${a.slug} is signed in`,
        action: { label: "Sign in", run: () => void signIn(a.slug) },
      }),
    );
  }
}
abyme.effect(() => seen.on("change", tell));
tell();

status.segments.add({ id: "accounts.quota", side: "right", order: 32, Component: Quota });
