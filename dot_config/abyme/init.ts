// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// It says what runs: `x.setup(options)` turns a plugin on. Its scope is `@abyme/plugin`, as in any
// plugin. See docs/abymed.md, "Your config".
//
// The coding profile, on 4477. What every profile shares is ../abyme-common.

import abyme from "@abyme/plugin";
import load from "@abyme/load";
import { common } from "../abyme-common/index.ts";

// abyme.server({ port: 4477, bind: ["127.0.0.1"] });

// The address devices reach abyme at, shown under Add a device.
// `proxy`: where the phone's web views reach the Mac's network through abymed
// (`tailscale serve --tcp 4479 tcp://127.0.0.1:4477`).
abyme.server({
  url: "https://richards-macbook-pro-2.tail21822e.ts.net:4443",
  proxy: "http://richards-macbook-pro-2.tail21822e.ts.net:4479",
});

common({ lead: true });

// Load reads the two heavy slots schools-ts' `pnpm check` takes (scripts/slots.mjs, 127.0.0.1:46900-46901).
load.setup({ slots: 2 });

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
