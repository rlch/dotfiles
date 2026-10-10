// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// It says what runs: `x.setup(options)` turns a plugin on. Its scope is `@abyme/plugin`, as in any
// plugin. See docs/abymed.md, "Your config".

import abyme from "@abyme/plugin";
import standard from "@abyme/standard";
import inbox from "@abyme/inbox";
import agentation from "@abyme/agentation";
import vim from "@abyme/vim";
import sentry from "@abyme/sentry";
import accounts from "./accounts";

// abyme.server({ port: 4477, bind: ["127.0.0.1", "tailscale"] });

// The built client abymed serves: a stable copy, so a build in ~/dev/abyme never changes what an
// open page is running. `scripts/promote` in ~/dev/abyme copies a finished build here.
abyme.server({ clientDir: "~/.local/share/abyme/client" });

// The built-ins most setups run.
standard.setup();
// How an answer to an inbox file reaches the agent that wrote it: through herdfile.
inbox.setup({ deliver: ["herdfile", "tell", "{from}", "{answer}\n(item: {path})"] });
agentation.setup();
// Vim on the laptop and the iPad, off on the phone: with a soft keyboard its modes cannot be
// used, and files open read-only in normal mode. A member of the standard set, so this line gives
// it its `when` and is no second setup. An iPad is a tablet with or without its keyboard.
vim.setup({}, { when: { device: ["desktop", "tablet"] } });
// Which Claude account an agent abyme launches runs on, as clodcurrent picks for `cl` (accounts/design.md).
accounts.setup();
// Every page's errors, faults and failed plugins to Sentry (tutero-au/abyme), tagged by plugin and device.
sentry.setup({ dsn: "https://0b7e44beb81a2f7938540ddb8a7f67e4@o534067.ingest.us.sentry.io/4512230726041600" });

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
