// Runs inside abymed, once, before it listens; again whenever you save a file in server/.
// `abyme` is the API every plugin's server half has, plus `abyme.options`, which abymed reads
// once when it starts. See docs/abymed.md, "Your config".

import { abyme } from "@abyme/server";

// abyme.options.port = 4477;
// abyme.options.bind = ["127.0.0.1", "tailscale"];

// The built client abymed serves: a stable copy, so a build in ~/dev/abyme never changes what an
// open page is running. `scripts/promote` in ~/dev/abyme copies a finished build here.
abyme.options.clientDir = "~/.local/share/abyme/client";

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
