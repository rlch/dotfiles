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
// Every page's errors, faults and failed plugins to Sentry (abyme.sentry.io, project abyme), tagged by plugin and device.
sentry.setup({ dsn: "https://39bd07b80cf1e53066b9da857178643e@o4512167308820480.ingest.us.sentry.io/4512230761758720" });

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
