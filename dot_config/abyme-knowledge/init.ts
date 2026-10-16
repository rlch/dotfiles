// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// See docs/abymed.md, "Your config" and "Several abymeds".
//
// The knowledge profile, on 4478, beside coding (~/.config/abyme, 4477): notes and learning. Its
// own state (~/.local/state/abyme-knowledge), agents and processes; launchd job
// com.rjm.abymed.knowledge. What every profile shares is ../abyme-common.

import abyme from "@abyme/plugin";
import mdx from "@abyme/mdx";
import learn from "@abyme/learn";
import { common } from "../abyme-common/index.ts";

abyme.server({ port: 4478, stateDir: "~/.local/state/abyme-knowledge" });
// The name the app's menu and the phone list this server by.
abyme.server({ name: "knowledge" });
// The address devices reach it at: `tailscale serve` on 4446 in front of 127.0.0.1:4478.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4446" });

common();

// MDX documents, and learning from them: the vault's documents are things to learn, its log
// (.learn/log.jsonl) the truth FSRS is computed from (docs/learning.md). Beside the Obsidian vault
// in ~/Knowledge/vault, not inside it.
mdx.setup();
learn.setup({ vault: "~/Knowledge/learn" });
