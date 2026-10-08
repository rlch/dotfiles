// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// It says what runs: `x.setup(options)` turns a plugin on. See docs/abymed.md, "Your config".

import { abyme } from "@abyme/config";
import standard from "@abyme/standard";
import inbox from "@abyme/inbox";
import agentation from "@abyme/agentation";

// abyme.server({ port: 4477, bind: ["127.0.0.1", "tailscale"] });

// The built client abymed serves: a stable copy, so a build in ~/dev/abyme never changes what an
// open page is running. `scripts/promote` in ~/dev/abyme copies a finished build here.
abyme.server({ clientDir: "~/.local/share/abyme/client" });

// The built-ins most setups run.
standard.setup();
// How an answer to an inbox file reaches the agent that wrote it: through herdfile.
inbox.setup({ deliver: ["herdfile", "tell", "{from}", "{answer}\n(item: {path})"] });
agentation.setup();

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
