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

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
