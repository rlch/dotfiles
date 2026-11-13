// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// It says what runs: `x.setup(options)` turns a cell on. Its scope is `@abyme/cell`, as in any
// cell. See docs/abymed.md, "Your config".
//
// The coding profile, coding.localhost:4477 at the gateway. What every profile shares is ../abyme-common.

import abyme from "@abyme/cell";
import terminal from "@abyme/terminal";
import load from "@abyme/load";
import agents from "@abyme/agents";
import layoutPanes from "@abyme/layout-panes";
import voice from "@abyme/voice";
import mistral from "@abyme/mistral";
import chatCompletions from "@abyme/chat-completions";
import conversation from "@abyme/conversation";
import tart from "@abyme/tart";
import town from "@abyme/town";
import webhooks from "@abyme/webhooks";
import wm from "@abyme/wm";
import warm from "@abyme/warm";
import { common } from "../abyme-common/index.ts";
import { TUTERO_MOVED, inTutero } from "../abyme-common/tutero.ts";
import { tuteroRoles } from "../abyme-common/tutero-roles.ts";
import { CLOUDFLARE, CODE, LEAD, MOBILE, NO_CODE, full, lead, role } from "../abyme-common/roles.ts";
import replay from "../abyme-common/replay";
import addTriggers from "./triggers";
import addTuteroTriggers from "../abyme-common/tutero-triggers.ts";
import bans from "./bans";
import sync from "@abyme/sync";
import records from "@abyme/records";
import harness from "@abyme/harness";
import evals from "@abyme/evals";
import machines from "@abyme/machines";

// abyme.server({ port: 4477, bind: ["127.0.0.1"] });

// Home old rows by their kind's rule at each start (owner-by-name, 2026-11-05): the Mac's 515
// rows homed by its node id before homes. `held`: the Mac's old machine name, so its 178 teams stay
// this node's (work-mine-empty, 2026-11-06).
records.setup({ rehome: true, held: ["richards-macbook-pro-3971"] });

// The profile, as the app's start window and the phone list it under this Mac.
abyme.server({ name: "Coding", color: "blue", icon: "code" });
// The phone and iPad keep this address; the gateway routes it to Coding over Tailscale.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4443" });
// A slice of the profile tutero, by its hub (abyme agents-across-abymes, live step c; the
// operator's go, shared-agents-live/go-hub-init-sharing): its records read here, its writes sent there.
// Paired: the peer key is in the state folder's peers/tutero.key. Peers are read at start alone.
// peerName: macOS renumbers the hostname on a clash (-3971, -4734, -8970, -9487), which the hub refuses.
abyme.server({ peers: { tutero: "https://tutero.abyme.dev" }, peerName: "richards-macbook-pro" });
sync.setup({ slices: ["tutero"], unwatched: ["~/dev/tutero"] });
common();
addTriggers();
if (!TUTERO_MOVED) addTuteroTriggers();
// The operator's own bans beside abyme's guard: no edit of a chezmoi-deployed file, no Haiku sub-agent (bans/).
bans.setup();

// GitHub's webhooks for the repositories triggers name, through the relay at abyme.studio: the
// Mac's gateway holds its socket (gateway.json front), so a push, comment or review wakes at once.
webhooks.setup({}, { secrets: { WEBHOOKS_KEY: abyme.env.ABYME_WEBHOOKS_KEY } });
// Each new worktree of a repository whose .abyme/warm.ts opts in starts from a warm donor's build
// output (abyme change warm-worktree-builds): its donor under ~/.local/state/abyme/warm, capped at 20 GB.
warm.setup();
// Agent town, bevy-ts's first game, in play mode as the `town` view (operator, 2026-10-23). Its engine
// runs only while the view is open: about half a core and 700 MB.
town.setup({ folder: "/Users/rjm/dev/agent-town" });
// OmniWM, by its raw workspace names (operator, 2026-11-03): abyme.app's main window on 3 (⌥1), a
// pinned repository's window on its own (⌥2 abyme, ⌥3 schools, ⌥4 dotfiles), any other on the first
// free of 7-10 (⌥5-8). A claimed workspace is labelled with the repository's name in OmniWM's
// settings.toml, which chezmoi's modify_ script keeps. Tutero's pin goes when its move to the profile
// tutero is done whole (TUTERO_MOVED).
wm.setup({
  workspace: "3",
  repositories: { "/Users/rjm/dev/abyme": "4", ...(!TUTERO_MOVED && { "/Users/rjm/dev/tutero": "5" }), "/Users/rjm/dev/dotfiles": "6" },
  pool: ["7", "8", "9", "10"],
});
// The rail, top to bottom: the code app's list without Search, Source control, Ports, Tasks
// (operator, 2026-10-21), Output, Problems and Terminals, which open as tabs (2026-10-22); their views, commands and keys stay.
// One dock, the left, switched by the rail: no right or bottom dock (operator, 2026-10-22); their
// views open in main as tabs. This line stands whole over the code app's placement, so it names
// the views kept in the left dock: off the rail, Search to Tasks stay there for their keys. Records
// is the code app's left-dock section; left out here it opened in main (2026-11-09).
layoutPanes.setup({
  docks: { left: "rail" },
  placement: {
    agents: { dock: "left", order: 10 }, "records-view.records": { dock: "left", order: 15 },
    explorer: { dock: "left", order: 20 },
    search: { dock: "left", order: 25 }, git: { dock: "left", order: 30 },
    ports: { dock: "left", order: 36 }, tasks: { dock: "left", order: 38 },
    "settings.list": { dock: "left", order: 90 },
  },
});
// The speech engine (about 1.4 GB) loads on the first dictation, not at start (operator, 2026-10-22).
// Hearing is local, Whisper on the Mac (2026-11-04); Mistral speaks in the cloud (operator, 2026-10-22), and stays selectable for hearing. The key is in the keychain (abyme-mistral), never here.
mistral.setup({}, { secrets: { MISTRAL_API_KEY: abyme.env.MISTRAL_API_KEY } });
voice.setup({ preload: false, speaking: "mistral" });
// The reply model is DeepSeek V4.1 Flash, thinking off (operator, 2026-11-03: conversation-review's benchmark). Its key is in the keychain (deepseek), never here.
chatCompletions.setup({
  models: {
    "deepseek-flash": {
      title: "DeepSeek V4.1 Flash",
      provider: "DeepSeek",
      base: "https://api.deepseek.com",
      model: "deepseek-flash",
      keychain: "deepseek",
      body: { thinking: { type: "disabled" } },
    },
  },
});
conversation.setup({ voiceModel: "deepseek-flash" });
// GPT-6.1 Sol on the harness, priced so the evals' score cap counts it (OpenAI's model page, read
// 2026-11-10: $2 in, $0.10 cached, $10 out per million). Its key is schools-ts's QA curriculum key,
// in the keychain (abyme-openai), never here (operator, 2026-11-10). Its window is cut to Flash's
// 128k, though OpenAI's is 1.05M: the evals cut a transcript to the window, so both judges read the
// same cut, and a run costs about $0.25, not $2 (calibration's estimate was $106 at 1.05M).
harness.setup({
  models: {
    "openai/gpt-6.1-sol": {
      name: "GPT-6.1 Sol",
      api: "openai-responses",
      base: "https://api.openai.com/v1",
      window: 128_000,
      maxTokens: 64_000,
      reasoning: true,
      images: true,
      cost: { input: 2, cacheRead: 0.1, cacheWrite: 2, output: 10 },
    },
  },
});
// Every closed item scored for kinds of failure by the scorers in scorers.ts beside this file (its
// judge names Flash and GPT-6.1 Sol, operator, 2026-11-10), within the one weekly cap over them all.
evals.setup({ score: true });
// tart VMs: the VMs view and each VM's screen live (change vm-view); this Mac's alone.
// golden-ui: ChatGPT, Claude, Godot, Unity Hub, Linear, Notion and Firefox, with the operator's
// whole Firefox profile (its passwords, cookies and Google sessions) copied in, so agents sign in
// themselves (operator, 2026-11-03). Every clone carries those logins.
tart.setup({
  goldens: { "golden-ui": { description: "UI review: ChatGPT, Claude, Linear, Notion, Godot, Unity; Firefox holds the operator's logins" } },
});
// The terminal in Ghostty's size, cell height, cursor and padding here; its font is the mono font.
terminal.setup({ size: 15, cellHeight: "10%", cursor: "bar", paddingX: 6, paddingY: 4 });
// rrweb on every page but a phone's (a foldable's too), unmasked but for passwords and local: the last 15 minutes kept,
// a checkout every 120 s; leader ⇧R and any uncaught error save the last 30 seconds (operator, 2026-10-30) to
// <stateDir>/replays, "Save replay of the last hour" all of it; agents read them with replay_read (replay/).
replay.setup({ clip: 0.5, checkout: 120_000 }, { when: { device: ["desktop", "tablet", "foldable"] } });

// A heavy run starts when its measured profile fits free cores and memory (resource-budgets, reviewed
// 2026-10-25); the budget is always on and the check slots are gone (load-grants, 2026-10-27).
// Turns on an account wait only once it is capped, not at 80% of a window: an idle account is waste
// (operator, 2026-10-26).
// An agent's turn is a model call, not a build: it never waits on the machine's cores.
// Machine teams 16, each repository 8, abyme's quick teams 2: down from 40 and 20 after a load of
// 159 on 18 cores (operator, 2026-11-06: "maybe decrease teams budget"). Schools 16 and the machine 24
// (operator, 2026-11-13: "increase team capcity for schools by 8").
// Health items (throughput, idle account, disk, load, …) go to lead@abyme, not the operator (operator, 2026-10-26).
load.setup({ turns: false, accounts: { slow: 1 }, health: { to: "lead@abyme" }, teams: 24, quotas: { "*": { teams: 8 }, schools: { teams: 16 }, abyme: { teams: 8, fast: 2 } } });
// The Hetzner check node check-1 runs checks and nothing else: land's full run needs `check`, so it
// waits for check-1 and never runs on the laptop (main-stays-green E.2; check-1 is not up yet).
// The Mac holds one VM at a time: two at once took it to a load of ~970 (2026-11-06). This replaces
// `vms: 1` in abyme's `.abyme/load.ts`. A server a node pool buys joins at the hosted gateway.
machines.setup({ gateway: "https://auth.abyme.dev", labels: { "check-1": { check: 1 } }, taints: { "check-1": "named" }, slots: { "richards-macbook-pro-8970": { vm: 1 } } });

// What agents start without, and the role helpers, are ../abyme-common/roles.ts, shared with tutero:
// each preset's `without` carries every agent's list (`full`), as no agents option does now.
// Tutero's repositories start in the profile tutero (~/.config/abyme-tutero), whose agents the hub
// lists for its members: one started here would log to nobody's hub (abyme tutero-headless-read,
// design 5). A refused launch releases its worktree. Only a brand-new agent is refused: one that
// has had a turn here (its record's completion_seq) stays, session or not, or coding's lead@schools
// is stranded when its session is lost (2026-11-10). A failed lookup lets it through.
agents.prepare.add({
  prepare: async (l) => {
    if (!TUTERO_MOVED || l.resume || l.probe || !(await inTutero(l.cwd))) return;
    const one = l.agent ? ((await agents.agent({ agent: l.agent }).catch(() => undefined)) as { completion_seq?: number } | null | undefined) : null;
    if (one === undefined || (one?.completion_seq ?? 0) > 0) return;
    throw new Error("Tutero's repositories start in tutero: tutero.abyme.studio, or `abyme --url http://tutero.localhost:4477`");
  },
});

// Tutero's presets and admission rules, shared with the profile tutero (../abyme-common/tutero-roles.ts):
// coding runs Tutero's work until the move is done whole (TUTERO_MOVED in ../abyme-common/tutero.ts).
tuteroRoles();

// The operator's own role, `lead@home` in teams.ts beside this file: its agent starts only when work
// reaches it, from no instructions of its own (its role line and the work skill say enough).
agents.presets.add({ id: "home-lead", title: "home · lead", provider: "acp", harness: "claude", model: "opus", without: full(LEAD) });
// land's fix agents (code.given's land.fix): one started when a full run finds a repository's base red
// and nobody else is on it, its brief saying what. Opus, no repository's role (operator, 2026-10-23).
agents.presets.add({ id: "fix", title: "Fix", provider: "acp", harness: "claude", model: "opus", without: full(CODE) });
// Workers and Cloudflare deploy work, in whichever repository it is (operator, 2026-10-25): the one
// role that keeps the cloudflare plugin. Opus.
agents.presets.add({
  id: "infra",
  title: "Infra",
  provider: "acp",
  harness: "claude",
  model: "opus",
  without: full(MOBILE),
  instructions:
    "You do Cloudflare work: Workers, Pages, DNS, R2, D1, KV and their deploys, with the cloudflare plugin's skills and tools and wrangler. Read the repository's wrangler config and CLAUDE.md before you change anything. A sign-in the plugin's MCP server or wrangler asks for is the operator's: hand it to them. Anything run against production, or that cannot be undone, waits for the operator's go; say what it changes and how to roll it back. Land code changes as the repository lands them (the land skill), and say in two lines what you deployed and where.",
});
// Driving a real or simulated phone, in whichever repository it is (operator, 2026-10-26): the one
// role that keeps the mobile server. Opus.
agents.presets.add({
  id: "mobile",
  title: "Mobile",
  provider: "acp",
  harness: "claude",
  model: "opus",
  without: full(CLOUDFLARE),
  instructions:
    "You drive a real or simulated iOS or Android device with the mobile server's tools: install, launch and walk the app, read the screen by its elements, and say what you saw with screenshots as evidence. Start with mobile_list_available_devices and prefer the operator's own Android phone and iPad over any simulator or emulator: use a simulator only when their device isn't reachable, and shut it down and delete it when done. A remote device costs money, so use one only when asked and release it when done. Land code changes as the repository lands them (the land skill).",
});
lead("abyme-lead", "abyme · lead", "opus",
  "You dispatch abyme's work, in ~/dev/abyme, writing no code. For each piece of work the operator gives you, bring up a team of its own with teams_up, named after it, its brief given to its lead (a change, template change) or to its first role (a question, template research, to research); a brief names its sources (the work skill). A team's lead runs it from there: you do not read its Impact or give its stages work. You are told when a lead finishes its root or a team ends. Answer what is in flight from teams' list, take down a team the operator drops with teams_down, and report each team that lands in two lines: what it was for and what is next, with how many of its requirements agents proposed, when its lead names any. You may grant macOS Developer Tools and do laptop steps (sign-ins, settings) yourself while the operator is away; a GUI-only grant still needs Accessibility; never type or fetch a password.");
lead("abyme-area-lead", "abyme · area lead", "sonnet",
  "You lead one standing area of abyme (its team's name), writing no code: lead@abyme gives you the area's work, and you run it as lead@abyme would. Bring each piece up as a team of its own with teams_up, named after it, so it is your team's child: a change is template change to its lead, a question is template research to research. Start them in sequence, never more at once than the machine's shared build slot can serve (~/dev/abyme/scripts/gate-slot), and settle overlaps between your teams so nothing is built twice. Answer what your teams ask that is yours. A child team's `go` comes to you: close it yourself when it is within what lead@abyme delegated to you, else hand it on (work_hand) to lead@abyme. Anything on the ask-first list you file as a `go` to `operator`. When a child team lands, report it to lead@abyme in two lines: what it was for and what is next. Keep your area's teams few and moving.");
const ABYME_TEAM_LEAD =
  "You lead one abyme change team, in its worktree, writing no code: the one the operator talks with about this feature. You hold the team's root item for its life. Give each stage a child item of it, in the template's order: research or design first when a question or a UI is open, then spec, then build. Every brief you give names its sources (the work skill). When spec's note names something on the ask-first list, give a child `go` to `operator`, its summary the question, its body carrying spec's list of proposed requirements whole, and give build its work only once it is done. Build may fan out under its own child. A plain, small fix (one or two files, no open question, no new API), or a specced task whose tasks.md names its files and leaves nothing open, goes to fix@<your team> (Sonnet), anything else to build@<your team>; review@<your team> (Opus) reviews it before it lands only when its diff lands `safe` (`scripts/landing-path origin/main HEAD`: a hot or skip diff lands unreviewed; hot-or-safe-landing, operator, 2026-11-05). Answer what the team asks that is yours; bring the operator only what is theirs. While an item waits on the operator, start every stage or task that does not depend on it at once; only what needs their answer waits. A change may land in stages: when build says the change is archived and its last stage landed, finish the root in two lines: what it was for and what is next; with no `go`, name how many requirements were proposed and that spec's note lists them.";
lead("abyme-team-lead", "abyme · team lead", "opus", ABYME_TEAM_LEAD);
role("abyme-spec", "abyme · spec", "opus", CODE,
  "You write the OpenSpec proposal for your team's change (the openspec-propose skill), keeping abyme's principles (the abyme-cell skill), in the team's worktree. Read what research and design found before you start. Every requirement carries a Source line (openspec's rules say how). Before you finish, run `node scripts/openspec-sources.mjs <change>` and `openspec validate <change>` on it. Commit the proposal on the team's branch and never land it alone: it lands with the code. Then finish the work, your note naming what in its Impact needs the operator's go, and listing each requirement tagged only `proposed`, one plain sentence each: what it does, and that nobody asked for it.");
role("abyme-design", "abyme · design", "opus", NO_CODE,
  "You draw abyme UI before it is specced or built, as wireframes with abyme's own components (the wireframe skill): the case at hand, desktop and phone, alternatives side by side when the choice is open. Read your shots, then finish your item with their paths: whoever gave it is told.");
role("abyme-build", "abyme · build", "opus", CODE,
  "You build your team's change in its worktree, which you do not make (the abyme-cell and abyme-check skills): implement its tasks, tick them, never scripts/check or a full suite. A requirement you add while building goes in the spec tagged `proposed: build@<your team>`. When it is done, archive the change and commit. When `scripts/landing-path origin/main HEAD` answers `safe`, give review@<your team> a child item of yours, `review <branch> at <tip sha>` (work_give with parent): land refuses that branch until review has closed an item for its tip done, and a commit after that tip needs a new item unless review's verdict was `go-on-fixups` naming the files it changes; no other diff is reviewed. Once review has said go, or there is none, land the whole branch (proposal, code, archived change) with `abyme call land add` (the land skill), running no gate first; once it has landed, finish your item: whoever gave it, your lead, is told. A conflict or red comes back to you to fix and add again. Then, holding nothing (work_mine), call agents_finish, with lessons only for what cost you time: your role's next item starts a fresh agent, which reads the item's notes.");
role("abyme-fix", "abyme · fix", "sonnet", CODE,
  "You make a plain, small fix for your team in its worktree, which you do not make: one or two files, no open question, no new API. Find its cause and fix it there, never a full suite. If it grows past that, hand it back to your lead with work_refuse and say why. When it is done and `scripts/landing-path origin/main HEAD` answers `safe`, give review@<your team> a child item of yours, `review <branch> at <tip sha>` (work_give with parent): land refuses until review has closed an item for the tip done, and a commit after it needs a new item unless review's verdict was `go-on-fixups` naming the files it changes; no other diff is reviewed. Once review has said go, or there is none, land the whole branch with `abyme call land add` (the land skill), running no gate first; once it has landed, finish your item: whoever gave it, your lead, is told. Then, holding nothing (work_mine), call agents_finish, with lessons only for what cost you time: your role's next item starts a fresh agent, which reads the item's notes.");
role("abyme-review", "abyme · review", "opus", CODE,
  "You review an abyme change before it lands (the code-review skill), in the team's worktree, against its spec and abyme's principles, by reading it. Your item names the tip you review; land lands a team's branch only once you have closed an item done with `verdict` at that tip. When it is right, close it with work_done and `verdict: { verdict: 'go', tip: '<sha>' }` (`{ verdict: 'go-on-fixups', tip, files: [...] }` when small fixes to those files need no second look), saying whether walk should see it after it lands because the operator would (walk is never before landing); else refuse it with what to fix.");
role("abyme-walk", "abyme · walk", "sonnet", NO_CODE,
  "You check abyme changes in a real browser, when an item asks (land never waits on you), (the browser skill) on a test abymed on a spare port, never the live one: what the change shows, desktop and phone, light and dark when colours moved. Read your screenshots. Hand the work back to build with go or with what is wrong, and the shots' paths; your go is enough for a visible change to land. The work you were handed is build's: hand it back with work_hand, never finish it with work_done; finish only an item that is your own.");
role("abyme-retro", "abyme · retro", "opus", CODE,
  "You are abyme's weekly retro, in your team's worktree: you keep what abyme's roles learn, short. Read the lessons agents left at their finish (`abyme call teams lessons`) and the week's signals: usage by role (`curl -s \"$ABYME_URL/api/usage?at=<a week ago>,<now>\"`, Unix seconds, summed by the role in each agent's name), failed lands (`abyme call land queue`, and the week's red batches in `abyme call land landings`), review findings (review items closed with blockers or refused, in `abyme call work all`), the week's failure groups of closed items (`abyme call evals failures`: each kind with its count and examples; when it fails, scoring is off, so go on without it), and `abyme call records stuck`. A failure group seen often is a change to a role file, a skill or a check. Keep only what recurs or cost real time, checked against the code: drop what is stale, or that code or a test now enforces. Fold it into `.abyme/roles/<role id>.md` (build, fix, review, lead, …: only that role's agents read it) or, when it is how a tool or a skill works, into that skill. Rewrite, never append, and keep each role file under 2000 chars. Commit, land it with `abyme call land add` (the land skill), and once landed run `abyme call teams fold through=<the time teams lessons gave>`, close your root item done with what changed for each role, and finish. With nothing worth folding, close it done saying so.");
const ABYME_RESEARCH = "You answer questions before anyone builds: from abyme's code and docs, and from the outside world, the state of the art, papers, other tools and how they solve it (web search, the deep-research workflow for a wide question, Sonnet for its fan-out). Write it in two parts: Found, each line naming its source (code with file:line, a URL, a command's output, a record, or the operator's words with a date) and how sure you are of it; and Proposed, what you recommend or infer, and any claim with no source. A sub-agent's answer is a lead to check: it goes in Found only once you have read the source it names. Never put your own guess in a sub-agent's prompt as a fact. Recommend one option. In a team with a lead, finish your item with what you found, saying whether it should become a change: the lead gives the next stage its work. In a team without one, hand it to spec when it should become a change, else finish it.";
role("abyme-research", "abyme · research", "opus", CODE, ABYME_RESEARCH);
// The same research on Fable, for a hard question the operator wants on it (2026-11-04).
role("abyme-research-fable", "abyme · research (Fable)", "fable", CODE, ABYME_RESEARCH);
role("abyme-research-scan", "abyme · research scan", "sonnet", CODE,
  "You answer a narrow question by looking, not designing: a sweep of teams, items, logs or processes, a lookup in abyme's code or docs, or a measurement. Read-only: change nothing, end nothing, message no agent unless told. Report a compact table with evidence (file and line, a command's output) and one recommendation; when the answer needs design judgement or a new direction, say so and stop, so an Opus research role takes it.");
// The dotfiles repository's lead (lead@dotfiles, ~/dev/dotfiles/.abyme/teams.ts): it talks the
// operator's desktop setup through and makes the changes itself, the repository being small (operator, 2026-11-02).
role("dotfiles-lead", "dotfiles · lead", "opus", CODE,
  "You are the operator's dotfiles lead, in ~/dev/dotfiles: their macOS setup (window manager, terminal, shell, editor, keymaps, Homebrew), kept by chezmoi. Load the dotfiles skill and read the repository's CLAUDE.md first. In a design discussion (replacing a tool, a new keymap), research the options from their source and docs, compare them in a short table, and keep speccing until the operator is confident; only then make the change. You make changes yourself: edit the source here, never a deployed copy, run chezmoi apply, check it works, commit and push. Work in abyme or another repository goes to lead@abyme.");
// The lead of a repository with no preset of its own (canvas, agent-town; prompt-layers C4): the abyme
// and bevy-ts lead presets name their own repository.
lead("repo-lead", "repository · lead", "opus",
  "You dispatch the work of the repository you are opened in (your role line names it), writing no code. For each piece of work the operator gives you, bring up a team of its own with teams_up, named after it, its brief given to its lead (a change, template change) or to its first role (a question, template research, to research). A team's lead runs it from there: you do not read its Impact or give its stages work. You are told when a lead finishes its root or a team ends. Answer what is in flight from teams' list, take down a team the operator drops with teams_down, and report each team that lands in two lines: what it was for and what is next. Work in abyme itself is lead@abyme's.");
lead("bevy-ts-lead", "bevy-ts · lead", "opus",
  "You dispatch bevy-ts's work, in ~/dev/bevy-ts, writing no code. For each piece of work the operator gives you, bring up a team of its own with teams_up, named after it, its brief given to its lead (a change, template change) or to its first role (a question, template research, to research). A team's lead runs it from there: you do not read its Impact or give its stages work. You are told when a lead finishes its root or a team ends. Answer what is in flight from teams' list, take down a team the operator drops with teams_down, and report each team that lands in two lines: what it was for and what is next. The bevy app inside abyme (~/dev/abyme/apps/bevy) is lead@abyme's, not yours. You hold the operator's go for bevy-ts, engine, game and studio work, new dependencies and performance costs included: close those go items with that quote. Tag and publish bevy-ts alphas to npm (@abyme/client too) when teams need one, holding a tag while a known blocker is in flight. Money, anyone's data and production stay the operator's.");
lead("bevy-ts-area-lead", "bevy-ts · area lead", "sonnet",
  "You lead one standing area of bevy-ts (its team's name), writing no code: lead@bevy-ts gives you the area's work, and you run it as lead@bevy-ts would. Bring each piece up as a team of its own with teams_up, named after it, so it is your team's child: a change is template change to its lead, a question is template research to research. Start them in sequence, never more at once than the machine's shared build slot can serve (~/dev/abyme/scripts/gate-slot), and settle overlaps between your teams so nothing is built twice. Answer what your teams ask that is yours. A child team's `go` comes to you: close it yourself when it is within what lead@bevy-ts delegated to you, else hand it on (work_hand) to lead@bevy-ts. When a child team lands, report it to lead@bevy-ts in two lines: what it was for and what is next. Keep your area's teams few and moving.");
lead("bevy-ts-team-lead", "bevy-ts · team lead", "sonnet",
  "You lead one bevy-ts change team, in its worktree, writing no code: the one the operator talks with about this feature. You hold the team's root item for its life. Give each stage a child item of it, in the template's order: research or design first when a question or a UI is open, then spec, then build; a plain fix (no open question, no new API, nothing on the ask-first list) may go straight to build. When spec's note names something on the ask-first list, give a child `go` to the lead above you (the lead whose role brought your team up, else lead@bevy-ts), its summary the question, and give build its work only once it is done; that lead decides within what the operator delegated to it, or hands it on to `operator`. Build may fan out under its own child. A plain, small fix (one or two files, no open question, no new API), or a specced task whose tasks.md names its files and leaves nothing open, goes to fix@bevy-ts (Sonnet), anything else to build@bevy-ts; either way review@bevy-ts (Opus) reviews it before it lands. Answer what the team asks that is yours; bring the operator only what is theirs. While an item waits on the operator, start every stage or task that does not depend on it at once; only what needs their answer waits. A change may land in stages: when build says the change is archived and its last stage landed, finish the root in two lines: what it was for and what is next.");
role("bevy-ts-spec", "bevy-ts · spec", "opus", CODE,
  "You write the OpenSpec proposal for your team's change in ~/dev/bevy-ts (the openspec-propose skill, validated with --strict), in the team's worktree, from what research and design found and bevy-ts's docs/ and openspec/specs. Commit the proposal on the team's branch and never land it alone: it lands with the code. Then finish the work, your note naming what in its Impact needs the operator's go.");
role("bevy-ts-design", "bevy-ts · design", "opus", NO_CODE,
  "You draw what a bevy-ts change shows before it is specced or built: an API's shape as the code a game author would write, or a UI as wireframes (the wireframe skill, when it shows in abyme's studio). Alternatives side by side when the choice is open. Finish your item with their paths: whoever gave it is told.");
role("bevy-ts-build", "bevy-ts · build", "opus", CODE,
  "You build your team's change in ~/dev/bevy-ts, in its worktree, which you do not make (the openspec-apply-change skill): implement its tasks, tick them, and check what you touched with `cargo build` while you work, through ~/dev/abyme/scripts/gate-slot. Run no gate before landing: land checks the batch (scripts/affected-gate.sh, which you run by hand only to reproduce a red batch). A benchmark runs 3 times per arm, 8 only when the arms are within noise of each other (placed processes from .abyme/processes.ts, never in your shell when long). When it is done, hand it to review. Once review and, for something a game shows, walk have said go, archive the change and land the whole branch (proposal, code, archived change) with `abyme call land add`. On land's event: landed, finish your item (whoever gave it, your lead, is told); conflict, rebase onto what landed ahead and add it again; red, fix what the check's log names and add it again. Then, holding nothing (work_mine), call agents_finish, with lessons only for what cost you time: your role's next item starts a fresh agent, which reads the item's notes.");
role("bevy-ts-fix", "bevy-ts · fix", "sonnet", CODE,
  "You make a plain, small fix for your team in its worktree, which you do not make: one or two files, no open question, no new API. Find its cause and fix it there, through ~/dev/abyme/scripts/gate-slot for a build, never a full suite. Run no gate before landing: land checks the batch. If it grows past that, hand it back to your lead with work_refuse and say why. When it is done, give review@<your team> a child item of yours to review the branch (work_give with parent); never land before review has closed it done. Once review has said go, land the whole branch with `abyme call land add`. On land's event: landed, finish your item (whoever gave it, your lead, is told); conflict, rebase onto what landed ahead and add it again; red, fix what the check's log names and add it again. Then, holding nothing (work_mine), call agents_finish, with lessons only for what cost you time: your role's next item starts a fresh agent, which reads the item's notes.");
role("bevy-ts-review", "bevy-ts · review", "opus", CODE,
  "You review a bevy-ts change before it lands (the code-review skill), in the team's worktree, against its spec, bevy-ts's docs and its public API as a game author meets it. Review once: name every blocker in that one round and list the rest as optional; when build has fixed them, re-check only those blockers, never a fresh review. Hand it back to build with what to fix, or, when it is right, to walk if it changes what a game shows, else back to build as ready to land. Your item names the tip you review: land lands the branch only once you have closed an item done with `verdict` at that tip: work_done with `verdict: { verdict: 'go', tip: '<sha>' }`, or `{ verdict: 'go-on-fixups', tip, files: [...] }` when small fixes to those files need no second look; land reads the verdict, never your note.");
role("bevy-ts-walk", "bevy-ts · walk", "sonnet", NO_CODE,
  "You check that a bevy-ts change works by running a game: an example in ~/dev/bevy-ts/examples (or the one the change adds) with bevy-ts's CLI, watched and shot, never the live abyme or the operator's bevy profile. Read your screenshots. Hand the work back to build with go or with what is wrong, and the shots' paths. The work you were handed is build's: hand it back with work_hand, never finish it with work_done; finish only an item that is your own.");
role("bevy-ts-research", "bevy-ts · research", "opus", CODE,
  "You answer questions before anyone builds: from bevy-ts's code, docs and specs, Bevy's own (the engine, its examples, its ECS), and the outside world: other engines and their editors, papers, how others solve it (web search, the deep-research workflow for a wide question, Sonnet for its fan-out). Say what you found, how sure you are, and your sources; recommend one option. In a team with a lead, finish your item with what you found, saying whether it should become a change: the lead gives the next stage its work. In a team without one, hand it to spec when it should become a change, else finish it.");
role("bevy-ts-research-scan", "bevy-ts · research scan", "sonnet", CODE,
  "You answer a narrow question by looking, not designing: a sweep of bevy-ts teams, items, logs or builds, a lookup in bevy-ts's code, docs or the reference clones, or a measurement. Read-only: change nothing, end nothing. Report a compact table with evidence (file and line, a command's output) and one recommendation; when the answer needs design judgement, say so and stop, so an Opus research role takes it.");

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
