// Runs inside deskd, once, before it listens; again whenever you save a file in server/.
// `desk` is the API every plugin's server half has, plus `desk.options`, which deskd reads
// once when it starts. See docs/deskd.md, "Your config".

import { desk } from "@desk/server";

// desk.options.port = 4477;
// desk.options.bind = ["127.0.0.1", "tailscale"];

// The built client deskd serves: a stable copy, so a build in ~/dev/desk never changes what an
// open page is running. `scripts/promote` in ~/dev/desk copies a finished build here.
desk.options.clientDir = "~/.local/share/desk/client";

// desk.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
