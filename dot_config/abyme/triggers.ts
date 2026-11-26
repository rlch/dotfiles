// The operator's own triggers (the triggers plugin's `items`): ones that run on this Mac only. Tutero's
// (schools, iac, curriculum) are the node tutero-agents', ../abyme-common/tutero-triggers.ts. A repository's
// `.abyme/triggers.ts` fires on every machine that checks it out; these never leave here.
// Each is rooted at a repository's main checkout: its source is read and its call run there.

import triggers from "@abyme/triggers";

/** Adds them: init.ts calls it on the Mac alone. */
export default function addTriggers(): void {
  const DOTFILES = "/Users/rjm/dev/dotfiles";

  // The Mac's shared sccache server, every 2 minutes: stopped (`sccache --stop-server`, never a kill) once a
  // client has waited 5 minutes while it has had no rustc child for 5, and lead@abyme given a health item. Its
  // jobserver pool runs dry when a rustc it started is SIGKILLed, and every cargo build hangs (13 h on
  // 2026-11-20; mozilla/sccache#2874, abyme:document/abyme/sccache-stall). Drop it, with scripts/sccache-watch
  // and its process, once an sccache release ships the fix, PR #3047.
  triggers.items.add({
    name: "sccache-watch",
    root: DOTFILES,
    on: { cron: "*/2 * * * *" },
    run: { processes: "start", args: { name: "sccache-watch", dir: DOTFILES } },
  });
}
