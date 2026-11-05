// The operator's own triggers (the triggers plugin's `items`): ones that run on this Mac only. Tutero's
// (schools, iac, curriculum) are the profile tutero's, ../abyme-tutero/triggers.ts. A repository's
// `.abyme/triggers.ts` fires on every machine that checks it out; these never leave here.
// Each is rooted at a repository's main checkout: its source is read and its call run there.

import triggers from "@abyme/triggers";

/** Adds them: init.ts calls it on the Mac alone. */
export default function addTriggers(): void {
  const DOTFILES = "/Users/rjm/dev/dotfiles";

  // iPhone Duo 512GB Star White pickup at an HK Apple Store, every two hours: a script, no model (the process
  // `hk-iphone-duo` of dotfiles' .abyme/processes.ts, scripts/hk-iphone-duo-pickup.mjs). It tells the operator
  // once when a store opens it and buys nothing (operator, 2026-11-04).
  triggers.items.add({
    name: "hk-iphone-duo",
    root: DOTFILES,
    on: { cron: "0 */2 * * *" },
    run: { processes: "start", args: { name: "hk-iphone-duo", dir: DOTFILES } },
  });
}
