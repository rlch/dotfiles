// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// It says what runs: `x.setup(options)` turns a plugin on. Its scope is `@abyme/plugin`, as in any
// plugin. See docs/abymed.md, "Your config".

import abyme from "@abyme/plugin";
import standard from "@abyme/standard";
import agentation from "@abyme/agentation";
import vim from "@abyme/vim";
import terminal from "@abyme/terminal";
import sentry from "@abyme/sentry";
import accounts from "./accounts";
import agents from "@abyme/agents/inventory";
import publish from "./publish";
import replay from "./replay";

// abyme.server({ port: 4477, bind: ["127.0.0.1"] });

// The built client abymed serves: a stable copy, so a build in ~/dev/abyme never changes what an
// open page is running. `scripts/promote` in ~/dev/abyme copies a finished build here.
abyme.server({ clientDir: "~/.local/share/abyme/client" });

// The names abyme answers for besides IP addresses and localhost: the phone's address.
abyme.server({ hosts: ["richards-macbook-pro-2.tail21822e.ts.net"] });
// The address devices reach abyme at, shown under Add a device.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4443" });

// The built-ins most setups run, but herdr (its panes are not abyme's agents), with the mono font
// Ghostty uses here in the editor, code blocks and terminals. A member's own line below stands in
// place of the set's setup of it, before or after this line.
standard.setup({ herdr: false, mono: { font: "JetBrainsMono Nerd Font" } });
agentation.setup();
// The terminal in Ghostty's size, cell height, cursor and padding here; its font is the mono font above.
terminal.setup({ size: 15, cellHeight: "10%", cursor: "bar", paddingX: 6, paddingY: 4 });
// Vim on the laptop and the iPad, off on the phone: with a soft keyboard its modes cannot be
// used, and files open read-only in normal mode. A member of the standard set, so this line stands
// in place of the set's and is no second setup. An iPad is a tablet with or without its keyboard.
vim.setup({}, { when: { device: ["desktop", "tablet"] } });
// Which Claude account an agent abyme launches runs on, as clodcurrent picks for `cl` (accounts/design.md).
accounts.setup();
// "Publish canvas to the web" and "Unpublish canvas": a canvas as a page on artifacts.rjmath.com, asked first (publish/).
publish.setup();
// rrweb on every page, unmasked and local: abymed keeps the last 2-3 minutes; leader ⇧R and any
// uncaught error save them to <stateDir>/replays, agents read them with replay_read (replay/).
replay.setup();
// My assistant on pi and DeepSeek V4.1 Flash, in place of abyme's Claude one (same id, same brief): a
// fast, cheap model for talk; it delegates real work to agents. pi reads its key from the keychain
// (~/.pi/agent/auth.json).
agents.presets.add({
  id: "assistant",
  title: "Assistant",
  provider: "acp",
  harness: "pi",
  model: "deepseek/deepseek-flash",
  name: "assistant",
  brief:
    "You are the operator's assistant in abyme. They may be speaking to you; keep answers to one to three short sentences, no markdown unless asked. You do not write code yourself: start agents for work and tell them how to report back to you by name; read and tell agents; read the inbox; drive abyme with remote_run (read the layout before changing it). Call agents_skill before work a skill covers. Say what you did, then stop.",
  dock: "right",
});
// Every page's errors, faults and failed plugins to Sentry (abyme.sentry.io, project abyme), tagged by plugin and device.
sentry.setup({ dsn: "https://39bd07b80cf1e53066b9da857178643e@o4512167308820480.ingest.us.sentry.io/4512230761758720" });

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
