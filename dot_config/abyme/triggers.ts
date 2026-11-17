// The operator's own triggers (the triggers plugin's `items`): ones that run on this Mac only. Tutero's
// (schools, iac, curriculum) are the node tutero-agents', ../abyme-common/tutero-triggers.ts. A repository's
// `.abyme/triggers.ts` fires on every machine that checks it out; these never leave here.
// Each is rooted at a repository's main checkout: its source is read and its call run there.

import triggers from "@abyme/triggers";

/** Adds them: init.ts calls it on the Mac alone. */
export default function addTriggers(): void {
  const DOTFILES = "/Users/rjm/dev/dotfiles";
}
