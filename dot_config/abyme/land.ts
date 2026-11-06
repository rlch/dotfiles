// How repositories that carry no .abyme of their own land (the land plugin, `abyme call land add`),
// by their origin. A repository's own .abyme/land.ts wins; one named in both is refused. A land.ts
// may import nothing but types, so Tutero's rows are written here and in ../abyme-tutero/land.ts.
import type { LandFiles } from "@abyme/land";

export default {
  // Tutero's (MathGaps repositories carry no .abyme of their own). Every change a squash-merged pull
  // request, merged at once with --admin once its checks pass: the ruleset wants a review the operator
  // cannot give their own agents' work, and Operators bypass it (schools CLAUDE.md, Pull requests). A
  // red check refuses the merge (operator, 2026-10-10). CodeRabbit reports a review, not a result:
  // never waited for.
  "MathGaps/schools": { mode: "pr", pr: { admin: true, ignore: ["CodeRabbit"] } },
  // main takes a pull request (ruleset); CI applies each stack on merge.
  "MathGaps/iac": { mode: "pr" },
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
