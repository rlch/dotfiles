// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// See docs/abymed.md, "Your config" and "Several abymeds".
//
// The knowledge profile, on 4478, beside coding (~/.config/abyme, 4477): notes and learning. Its
// own state (~/.local/state/abyme-knowledge), agents and processes; launchd job
// com.rjm.abymed.knowledge. What every profile shares is ../abyme-common.

import abyme from "@abyme/plugin";
import learn from "@abyme/learn";
import { common } from "../abyme-common/index.ts";

abyme.server({ port: 4478, stateDir: "~/.local/state/abyme-knowledge" });
// The profile, as the app's start window and the phone list it under this Mac.
abyme.server({ name: "Knowledge", color: "green", icon: "book" });
// The address devices reach it at: `tailscale serve` on 4446 in front of 127.0.0.1:4478.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4446" });

common({ lead: false });

// Learning from documents (`.md`, the standard set's `documents`): the vault's documents are things
// to learn, its log (.learn/log.jsonl) the truth FSRS is computed from (docs/learning.md). Beside
// the Obsidian vault in ~/Knowledge/vault, not inside it.
learn.setup({ vault: "~/Knowledge/learn" });
