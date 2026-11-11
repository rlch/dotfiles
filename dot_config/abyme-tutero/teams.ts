// Tutero's team templates (the teams plugin), the profile tutero's, beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. iac (MathGaps/iac) and
// curriculum (MathGaps/curriculum) have no .abyme of their own: their pull-request templates live here.
// Written out, not imported: abyme runs this file from its text alone, so an import of
// ../abyme-common left it unread and both templates gone (11-05 to 11-11).
import type { TeamFile } from "@abyme/teams";

export default {
  templates: {
    // An engineer's MathGaps/iac pull request, on its branch: review posts on it as @rlch (the iac-review
    // preset), ending when it merges or closes. Named for iac: a template here serves every repository
    // without one of its name. No walk: Terraform has nothing for a teacher to see.
    "iac-pr": {
      title: "Pull requests",
      instructions: "One team is one pull request, on its branch; you end with it.",
      ends: { "github.pr": { number: "{number}", states: ["merged", "closed"] } },
      groups: [{ title: "Review", roles: { review: "iac-review" } }],
    },
    // An engineer's MathGaps/curriculum pull request, as iac-pr: review (the curriculum-review preset) posts as
    // @rlch, fixes and merges it, ending when it merges or closes. No walk: a GraphQL subgraph shows a teacher nothing.
    "curriculum-pr": {
      title: "Pull requests",
      instructions: "One team is one pull request, on its branch; you end with it.",
      ends: { "github.pr": { number: "{number}", states: ["merged", "closed"] } },
      groups: [{ title: "Review", roles: { review: "curriculum-review" } }],
    },
  },
} satisfies TeamFile;
