// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// See docs/abymed.md, "Your config" and "Several abymeds".
//
// The Bevy profile, on 4480, beside coding (4477) and knowledge (4478): the Bevy app, a studio for
// games made with bevy-ts. Its own state (~/.local/state/abyme-bevy), agents and processes. No
// launchd job: it runs while it is used (`abymed ~/.config/abyme-bevy` until abyme starts profiles
// on demand). What every profile shares is ../abyme-common.

import abyme from "@abyme/plugin";
import bevy from "@abyme/bevy";
import { common } from "../abyme-common";

abyme.server({ port: 4480, stateDir: "~/.local/state/abyme-bevy" });
// The profile, as the app's start window and the phone list it under this Mac.
abyme.server({ name: "Bevy", color: "orange", icon: "sparkles" });
// The address devices reach it at: `tailscale serve` on 4447 in front of the gateway (127.0.0.1:4477),
// which routes it here.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4447" });

common();

// The Bevy app: the platform list, then its own plugins (the studio, JSX edits).
bevy.setup();
