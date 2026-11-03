// The operator's own roles and team templates (the teams plugin), beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. `lead@home` is the
// operator's own role, kept open in this folder: its agent starts when work first reaches it.
// iac (MathGaps/iac) and curriculum (MathGaps/curriculum) have no .abyme of their own: their pull-request
// templates live here.
import type { TeamFile } from "@abyme/teams";

export default {
  roles: { lead: "home-lead" },
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
