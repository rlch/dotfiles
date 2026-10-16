// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// It says what runs: `x.setup(options)` turns a plugin on. Its scope is `@abyme/plugin`, as in any
// plugin. See docs/abymed.md, "Your config".
//
// The coding profile, on 4477. What every profile shares is ../abyme-common.

import abyme from "@abyme/plugin";
import load from "@abyme/load";
import { common } from "../abyme-common/index.ts";

// abyme.server({ port: 4477, bind: ["127.0.0.1"] });

// The name the app's menu and the phone list this server by.
abyme.server({ name: "coding" });
// The address devices reach abyme at, shown under Add a device.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4443" });

common();

// Load reads the two heavy slots schools-ts' `pnpm check` takes (scripts/slots.mjs, 127.0.0.1:46900-46901).
load.setup({ slots: 2 });

// abyme.http.route("GET", "/api/user/hello", () => ({ hello: "world" }));
