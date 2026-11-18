// accounts, in every page: each account's quota in the status bar, an Account field in New agent,
// and "Run on account…" in an agent's menu, which pins the account that agent's resumes run on;
// `/login` in a Claude agent's composer opens the same picker. "Sign in to Claude account…" makes
// an account's setup-token: its authorize page opens, and once the operator clicks Authorize the
// token goes to the keychain. "Add copied Claude setup-token…" keeps one made elsewhere. On the
// owner's page, Claude's block of Settings → Accounts: one login per account, a broken one's fix its
// sign-in again.
import abyme from "@abyme/cell";
import cells from "@abyme/cells";
import accounts from "@abyme/accounts";
import agents from "@abyme/agents/optional";
import chat from "@abyme/chat/inventory";
import { createStore, derive, during } from "@abyme/client";
import commands from "@abyme/commands/inventory";
import menus from "@abyme/menus/inventory";
import notifications from "@abyme/notifications";
import palette from "@abyme/palette";
import palettes from "@abyme/palette/inventory";
import status from "@abyme/status/inventory";
import markdown from "@abyme/markdown/optional";
import logins from "@abyme/logins/optional";
import type { Login, LoginsService } from "@abyme/logins/page";
import { claudeLogins, type LoginsView } from "./logins.ts";
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

// A profile without agents (bevy) has no New agent to add a field to, and no agent to pin.
agents?.fields.add({ id: "accounts.account", title: "Account", options, default: BY_QUOTA });

/** The agent a menu was opened on, if abyme knows it. */
const agentOf = (target?: { all: Record<string, unknown> }): string | null => {
  const id = String(target?.all.agent ?? "");
  return agents?.records.get(id) ? id : null;
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
menus.add({ kind: "agent", command: "accounts.pin", group: "agent", order: 40, when: (t) => agentOf(t) !== null && (agents?.records.get(agentOf(t)!)?.kind ?? "claude") === "claude" });
/** A setup-token for the account: its authorize page opened, the token to the keychain once the
 * operator clicks Authorize there. Off this Mac, Claude shows a code instead, which an agent gives
 * the waiting setup-token (`abyme call accounts code slug=<s> code=<code>`). */
async function signIn(slug: string) {
  try {
    const { url } = (await accounts.server.token({ slug })) as { url: string };
    if (markdown) markdown.open(url);
    notifications.notify({ level: "info", toast: true, title: `Authorize ${slug}`, body: `Sign in to Claude as ${slug}'s login and click Authorize: the token goes to the keychain.${markdown ? "" : ` ${url}`}` });
  } catch (e) {
    notifications.notify({ level: "error", title: `${slug} not signed in`, body: (e as Error).message });
  }
}

/** Off the rotation, or back on it. */
async function ignore(slug: string, on = true) {
  try {
    await accounts.server.ignore({ slug, on });
    notifications.notify({ level: "success", toast: true, title: on ? `${slug} ignored` : `${slug} in use again`, body: on ? "Undo with \"Use Claude account again…\"." : undefined });
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

/** A setup-token made elsewhere, copied, kept as account `slug`'s: the page's clipboard, emptied
 * once kept, else the Mac's, which the server half reads and empties. */
async function add(slug: string) {
  let token: string | undefined;
  try {
    const t = (await navigator.clipboard.readText()).trim();
    if (/^sk-ant-oat01-/.test(t)) token = t;
  } catch {}
  try {
    let { text } = (await accounts.server.add({ slug, token })) as { text: string };
    if (token) text += (await navigator.clipboard.writeText("").then(() => true, () => false)) ? ". Clipboard emptied." : ". Empty the clipboard: it still holds the token.";
    notifications.notify({ level: "success", toast: true, title: `${slug} added`, body: text });
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
    if (!off.length) return void notifications.notify({ level: "info", toast: true, title: "No account is ignored" });
    palette.pick({ placeholder: "The account to use again", items: off.map((slug) => ({ id: slug, title: slug })), onPick: (slug) => void ignore(slug, false) });
  },
});

status.segments.add({ id: "accounts.quota", side: "right", order: 32, Component: Quota });

/** Claude's mark, Lucide's `sparkles` (ISC): a user cell cannot import lucide-react. */
function ClaudeIcon({ className = "size-4 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

/** The same list while the view is the same: Accounts follows the store by identity. */
let last: { v: unknown; out: readonly Login[] | undefined } | null = null;
function loginsOf(v: unknown): readonly Login[] | undefined {
  if (last && last.v === v) return last.out;
  const out = v ? claudeLogins(v as LoginsView).map(({ slug, ...l }): Login => (l.state === "working" ? l : { ...l, fix: { label: "Sign in again", run: () => void signIn(slug) } })) : undefined;
  last = { v, out };
  return out;
}

// `page` (settings-accounts 5): its block's title opens Claude's page of pins. Spread in, so an abyme
// whose LoginsService has no `page` yet still checks.
const withPage = { page: { kind: "claude" } } as unknown as Partial<LoginsService>;
const claude: LoginsService = {
  ...withPage,
  id: "claude",
  title: "Claude",
  icon: ClaudeIcon,
  about: "Claude agents, and `cl` in a terminal, run on these accounts, the one with most room first.",
  order: 10,
  logins: derive(seen, loginsOf),
  empty: "No Claude account has a setup-token yet: add one copied from `claude setup-token`.",
  add: { label: "Add copied setup-token…", run: () => palette.open({ picker: "accounts.add" }) },
};
// The owner's alone (accounts' functions are theirs); no role is an abymed with no members.
if (logins) abyme.effect(() => during(derive(cells.role, (r) => (r ?? "owner") === "owner"), () => logins!.services.add(claude)));
