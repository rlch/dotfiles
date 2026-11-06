// How Tutero's repositories that carry no .abyme of their own land (the land plugin, `abyme call land
// add`), by their origin: the profile tutero's. A repository's own .abyme/land.ts wins; one named in
// both is refused.
import type { LandFiles } from "@abyme/land";

export default {
  // Tutero's (MathGaps), the same rows as ../abyme/land.ts: keep the two in step. land.ts may
  // import nothing but types, so they cannot be shared. Every change a squash-merged pull request,
  // merged at once with --admin once its checks pass: the ruleset wants a review the operator cannot
  // give their own agents' work, and Operators bypass it (schools CLAUDE.md, Pull requests). A red
  // check refuses the merge (operator, 2026-10-10). CodeRabbit reports a review, not a result.
  "MathGaps/schools": { mode: "pr", pr: { admin: true, ignore: ["CodeRabbit"] } },
  // main takes a pull request (ruleset); CI applies each stack on merge.
  "MathGaps/iac": { mode: "pr" },
} satisfies LandFiles;
