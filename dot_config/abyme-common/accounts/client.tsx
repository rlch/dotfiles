// accounts, in every page: each account's quota in the status bar, an Account field in New agent,
// and "Run on account…" in an agent's menu, which pins the account that agent's resumes run on;
// `/login` in a Claude agent's composer opens the same picker. "Sign in to Claude account…" makes
// an account's setup-token: its authorize page opens, and once the operator clicks Authorize the
// token goes to the keychain. "Add copied Claude setup-token…" keeps one made elsewhere.
import abyme from "@abyme/plugin";
import accounts from "@abyme/accounts";
import agents from "@abyme/agents";
import chat from "@abyme/chat/inventory";
import { createStore } from "@abyme/client";
import commands from "@abyme/commands/inventory";
import menus from "@abyme/menus/inventory";
import notifications from "@abyme/notifications";
import palette from "@abyme/palette";
import palettes from "@abyme/palette/inventory";
import status from "@abyme/status/inventory";
import markdown from "@abyme/markdown/optional";
import type { AccountSeen } from "./pick.ts";
import { Quota } from "./segment.tsx";

/** The value of "pick by quota", in the field and the picker; the server half's too. */
const BY_QUOTA = "auto";

type View = { accounts: AccountSeen[] };
/** A folder of a login: what a pin, a login and an ignore name. */
type Folder = AccountSeen & { slug: string };
const seen = accounts.server.view();
const view = (): View | undefined => seen.getState() as View | undefined;
/** Every account folder, each with its login's row. */
const folders = (v: View | undefined): Folder[] => (v?.accounts ?? []).flatMap((a) => a.slugs.map((slug) => ({ ...a, slug })));
const pct = (n: number | null) => (n === null ? "–" : `${Math.round(n)}%`);
const label = (a: Folder) => (a.read === null ? a.slug : `${a.slug}  5h ${pct(a.five)}  7d ${pct(a.seven)}`);

const options = createStore<readonly { value: string; name: string; description?: string }[]>([]);
function follow() {
  const v = view();
  if (!v) return;
  options.set(() => (folders(v).length < 2 ? [] : [{ value: BY_QUOTA, name: "By quota" }, ...folders(v).map((a) => ({ value: a.slug, name: a.slug, description: label(a) }))]));
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
    items: [{ id: BY_QUOTA, title: "By quota, as any launch" }, ...folders(v as View).map((a) => ({ id: a.slug, title: label(a), keywords: [a.slug] }))],
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
/** A setup-token for the account: its authorize page opened, the token to the keychain once the
 * operator clicks Authorize there. Off this Mac, Claude shows a code instead, which an agent gives
 * the waiting setup-token (`abyme call accounts code slug=<s> code=<code>`). */
async function signIn(slug: string) {
  try {
    const { url } = (await accounts.server.token({ slug })) as { url: string };
    if (markdown) markdown.open(url);
    notifications.notify({ level: "info", title: `Authorize ${slug}`, body: `Sign in to Claude as ${slug}'s login and click Authorize: the token goes to the keychain.${markdown ? "" : ` ${url}`}` });
  } catch (e) {
    notifications.notify({ level: "error", title: `${slug} not signed in`, body: (e as Error).message });
  }
}

/** Off the rotation, or back on it. */
async function ignore(slug: string, on = true) {
  try {
    await accounts.server.ignore({ slug, on });
    notifications.notify({ level: "success", title: on ? `${slug} ignored` : `${slug} in use again`, body: on ? "Undo with \"Use Claude account again…\"." : undefined });
  } catch (e) {
    notifications.notify({ level: "error", title: `${slug} not changed`, body: (e as Error).message });
  }
}

commands.add({
  id: "accounts.signin",
  title: "Sign in to Claude account…",
  group: "Agents",
  run: async () => {
    // Each account by when its token ends, soonest first: the one to make again.
    const v = (await accounts.server.view()) as View & { tokens?: Record<string, string> };
    const ends = (slug: string) => Date.parse(v.tokens?.[slug] ?? "") || 0;
    palette.pick({
      placeholder: "The account to make a setup-token for",
      items: folders(v)
        .sort((a, b) => ends(a.slug) - ends(b.slug))
        .map((a) => ({ id: a.slug, title: v.tokens?.[a.slug] ? `${a.slug}  token ends ${v.tokens[a.slug]!.slice(0, 10)}` : label(a), keywords: [a.slug] })),
      onPick: (slug) => void signIn(slug),
    });
  },
});

/** A setup-token made elsewhere, copied, kept as account `slug`'s: the page's clipboard, else the
 * Mac's, which the server half reads and empties. */
async function add(slug: string) {
  let token: string | undefined;
  try {
    const t = (await navigator.clipboard.readText()).trim();
    if (/^sk-ant-oat01-/.test(t)) token = t;
  } catch {}
  try {
    const { text } = (await accounts.server.add({ slug, token })) as { text: string };
    notifications.notify({ level: "success", title: `${slug} added`, body: text });
  } catch (e) {
    notifications.notify({ level: "error", title: `${slug} not added`, body: (e as Error).message });
  }
}

palettes.pickers.add({
  id: "accounts.add",
  title: "Add copied Claude setup-token…",
  placeholder: "The account it is: one listed, or a new name",
  empty: (q) => (q.trim() ? "Letters, digits, . _ - only." : "Type the account's name."),
  search(query) {
    const q = query.trim().toLowerCase();
    const have = folders(view()).map((a) => a.slug);
    const rows = have.filter((s) => s.includes(q)).map((slug) => ({ id: slug, title: `${slug}  (replace its token)`, keywords: [slug], run: () => void add(slug) }));
    return q && /^[a-z0-9._-]+$/.test(q) && !have.includes(q) ? [{ id: `new:${q}`, title: `${q}  (new account)`, run: () => void add(q) }, ...rows] : rows;
  },
});

commands.add({
  id: "accounts.ignore",
  title: "Ignore Claude account…",
  group: "Agents",
  run: async () => {
    const v = (await accounts.server.view()) as View;
    palette.pick({
      placeholder: "The account no agent runs on",
      items: folders(v).filter((a) => a.slug !== "main").map((a) => ({ id: a.slug, title: label(a), keywords: [a.slug] })),
      onPick: (slug) => void ignore(slug),
    });
  },
});
commands.add({
  id: "accounts.unignore",
  title: "Use Claude account again…",
  group: "Agents",
  run: async () => {
    const off = (await accounts.server.ignored()) as string[];
    if (!off.length) return void notifications.notify({ level: "info", title: "No account is ignored" });
    palette.pick({ placeholder: "The account to use again", items: off.map((slug) => ({ id: slug, title: slug })), onPick: (slug) => void ignore(slug, false) });
  },
});

status.segments.add({ id: "accounts.quota", side: "right", order: 32, Component: Quota });
