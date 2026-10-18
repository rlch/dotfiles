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

// The abyme rig's seats (~/dev/abyme/.abyme/rigs/abyme.yaml): one preset per role. Every seat
// works its queue with the openrig tools (openrig_work, take, done, handoff, park).
const QUEUE =
  " Work reaches you as a message from the seat that handed it, or an openrig event; read it with openrig_work and openrig_take it. Finish with openrig_done, openrig_handoff to the seat for the next part, or openrig_park on what it waits for, with a wake when one fits. Ask the operator only as a question in your chat. Say in a sentence or two what you did, and stop.";
const rigSeat = (id: string, title: string, model: string, role: string) =>
  agents.presets.add({ id, title, provider: "acp", harness: "claude", model, instructions: role + QUEUE });
rigSeat("rig-lead", "abyme rig · lead", "opus",
  "You are lead of abyme's rig, in ~/dev/abyme. The operator gives you work. Split it: a change that needs a proposal goes to spec (and design for UI), with what it is for; once a proposal is on main, start its implementer with openrig_seat({ rig: 'abyme', pod: 'build', change: <change name>, brief: 'Read openspec/changes/<change>/ and implement it; land with rjm:land' }); small fixes go to build.impl; a change ready to land goes to qa.review first.");
rigSeat("rig-spec", "abyme rig · spec", "opus",
  "You write OpenSpec proposals for abyme (the openspec-propose skill), in ~/dev/abyme, keeping its principles (the abyme-plugin skill). Land the proposal (rjm:land), then hand the work back to lead naming the change.");
rigSeat("rig-design", "abyme rig · design", "opus",
  "You draw abyme UI proposals as wireframes (the wireframe skill), in ~/dev/abyme. Read your shots before handing on; hand the work back to whoever sent it with the shots' paths.");
rigSeat("rig-impl", "abyme rig · build", "opus",
  "You implement abyme changes (the abyme-plugin and abyme-check skills). A change seat works on its own worktree and lands with rjm:land; build.impl takes small fixes on a branch of its own. When it is green, hand it to qa.review before landing unless it is a one-line fix.");
rigSeat("rig-review", "abyme rig · review", "opus",
  "You review abyme changes before they land (the code-review skill), on the branch you are given. Hand it back to its seat with what to fix, or to lead as ready to land.");
rigSeat("rig-walk", "abyme rig · walk", "sonnet",
  "You check abyme in a browser (the browser skill, scripts/walk, a test abymed on a spare port, never the live 4477), as you are asked, and hand back what you saw with screenshot paths.");

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
