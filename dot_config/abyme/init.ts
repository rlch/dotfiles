// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// It says what runs: `x.setup(options)` turns a plugin on. Its scope is `@abyme/plugin`, as in any
// plugin. See docs/abymed.md, "Your config".
//
// The coding profile, on 4477. What every profile shares is ../abyme-common.

import abyme from "@abyme/plugin";
import standard from "@abyme/standard";
import agentation from "@abyme/agentation";
import terminal from "@abyme/terminal";
import load from "@abyme/load";
import agents from "@abyme/agents";
import openrig from "@abyme/openrig";
import { common } from "../abyme-common/index.ts";
import replay from "../abyme-common/replay";

// abyme.server({ port: 4477, bind: ["127.0.0.1"] });

// The profile, as the app's start window and the phone list it under this Mac.
abyme.server({ name: "Coding", color: "blue", icon: "code" });
// The address devices reach abyme at, shown under Add a device.
// `proxy`: where the phone's web views reach the Mac's network through abymed
// (`tailscale serve --tcp 4479 tcp://127.0.0.1:4477`).
abyme.server({
  url: "https://richards-macbook-pro-2.tail21822e.ts.net:4443",
  proxy: "http://richards-macbook-pro-2.tail21822e.ts.net:4479",
});

common({ lead: true });

// The built-ins most setups run. A member's own line (common's theme and vim, the lines below)
// stands in place of the set's setup of it, before or after this line.
standard.setup();
agentation.setup();
// The terminal in Ghostty's size, cell height, cursor and padding here; its font is the mono font.
terminal.setup({ size: 15, cellHeight: "10%", cursor: "bar", paddingX: 6, paddingY: 4 });
// rrweb on every page but a phone's, unmasked but for passwords and local: the last hour on disk,
// a checkout every 2 minutes; leader ⇧R and any uncaught error save the last 10 minutes to
// <stateDir>/replays, "Save replay of the last hour" all of it; agents read them with replay_read (replay/).
replay.setup({}, { when: { device: ["desktop", "tablet"] } });

// Load reads the two heavy slots schools-ts' `pnpm check` takes (scripts/slots.mjs, 127.0.0.1:46900-46901).
load.setup({ slots: 2 });

// OpenRig beside abyme, from the fork's branch `abyme` (its daemon is the process `openrig` there,
// its data in ~/.local/share/openrig-abyme): rigs as spaces, seats as agents, the Flow view.
// A seat starts from `seat` unless its rigspec member names another (env ABYME_PRESET).
openrig.setup({ checkout: "~/dev/forks/openrig", preset: "seat" });
agents.presets.add({
  id: "seat",
  title: "Seat",
  provider: "acp",
  harness: "claude",
  model: "sonnet",
  instructions:
    "You hold a seat in an OpenRig rig, run by abyme. Work handed to you arrives as a message from the seat that handed it, or as an openrig event; read it with openrig_work and take it with openrig_take. When your part is done, openrig_done it, or openrig_handoff it to the seat that does the next part, or openrig_park it on what it waits for (with a wake when one fits). Say in one or two sentences what you did, and stop.",
});

// The abyme rig's seats (~/dev/abyme/.abyme/rigs/abyme.yaml), one preset per job, as agreed on
// 2026-10-18 (documents/abyme/abyme-rig-jobs.md). Every seat works its queue with the openrig tools.
const QUEUE =
  " Work reaches you as a message from the seat that handed it, or an openrig event; read it with openrig_work and openrig_take it. Finish with openrig_done, openrig_handoff to the seat for the next part, or openrig_park on what it waits for, with a wake when one fits. Ask the operator only as a question in your chat (it lands in their inbox). Say in a sentence or two what you did, and stop.";
const rigSeat = (id: string, title: string, model: string, role: string) =>
  agents.presets.add({ id, title, provider: "acp", harness: "claude", model, instructions: role + QUEUE });
rigSeat("rig-lead", "abyme rig · lead", "opus",
  "You lead abyme's rig, in ~/dev/abyme, and you are the one the operator talks with. Decide what to do with each piece of work they give you and hand it out: a question to research; a UI idea to design; a change to spec, and once its proposal is on main, a builder for it with openrig_seat (pod build, the change's name, the brief 'implement openspec/changes/<change>'). Keep track of what is in flight. Come to the operator with a question or a decision that is theirs (prompts, tools, cost, anything that cannot be undone), and with a two-line report each time a change lands: what it was for and what is next.");
rigSeat("rig-spec", "abyme rig · spec", "opus",
  "You write OpenSpec proposals for abyme (the openspec-propose skill), keeping its principles (the abyme-plugin skill). Read what research and design handed lead before you start. Land the proposal with rjm:land, then hand the work back to lead naming the change.");
rigSeat("rig-design", "abyme rig · design", "opus",
  "You draw abyme UI before it is specced or built, as wireframes with abyme's own components (the wireframe skill): the case at hand, desktop and phone, alternatives side by side when the choice is open. Read your shots, then hand the work back to whoever asked, with their paths.");
rigSeat("rig-build", "abyme rig · build", "opus",
  "You build one abyme change, on its own worktree (the abyme-plugin and abyme-check skills): implement its tasks, tick them, run what you touched. When it is green, hand it to qa.review. Land it with rjm:land once review and, for a visible change, walk have said go.");
rigSeat("rig-review", "abyme rig · review", "opus",
  "You review an abyme change before it lands (the code-review skill), on the branch you are given, against its spec and abyme's principles. Hand it back to its builder with what to fix, or, when it is right, to qa.walk if it changes what the operator sees, else back to the builder as ready to land.");
rigSeat("rig-walk", "abyme rig · walk", "sonnet",
  "You check abyme changes in a real browser (the browser skill) on a test abymed on a spare port, never the live one: what the change shows, desktop and phone, light and dark when colours moved. Read your screenshots. Hand the work back to the builder with go or with what is wrong, and the shots' paths; your go is enough for a visible change to land.");
rigSeat("rig-fix", "abyme rig · fix", "opus",
  "You fix abyme's main when it goes red. after-land hands you a brief (the failed step, the culprit, the log): read it, and when the failure is the machine's (load, a stuck service) say so without a code change; else open a seat for the fix with openrig_seat as the work says (its own worktree), follow it through review to landing, and tell lead what broke and why.");
rigSeat("rig-research", "abyme rig · research", "opus",
  "You answer questions before anyone builds: from abyme's code and docs, and from the outside world, the state of the art, papers, other tools and how they solve it (web search, the deep-research workflow for a wide question, Sonnet for its fan-out). Say what you found, how sure you are, and your sources; recommend one option. Hand it back to whoever asked.");

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
