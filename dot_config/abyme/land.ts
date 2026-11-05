// How repositories that carry no .abyme of their own land (the land plugin, `abyme call land add`),
// by their origin. A repository's own .abyme/land.ts wins; one named in both is refused. MathGaps'
// are the profile tutero's, ../abyme-tutero/land.ts.
import type { LandFiles } from "@abyme/land";

export default {
  // A push to main is an apply (its CLAUDE.md, CI applies): squash-merged pull requests, applied
  // and planned to no changes from a laptop first (operator, 2026-11-04).
  "abyme-studio/iac": { mode: "pr" },
  // Straight to main, unchecked: tests are opt-in (operator, 2026-11-05). A push to main deploys
  // the cloud (its deploy.yml). ~/dev/parley is a second clone of it.
  "rlch/unspoke": {},
  // The operator's own repos with no .abyme: rebased onto main and pushed, no check. Tests are
  // opt-in (operator, 2026-11-05): nothing runs them before landing.
  "rlch/trading": {},
  "rlch/cockpit": {},
  "rlch/artifacts": {},
  "rlch/sonzai": {},
  "rlch/sonzai-streaming": {},
} satisfies LandFiles;
