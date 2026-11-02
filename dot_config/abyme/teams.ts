// The operator's own roles and team templates (the teams plugin), beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. `lead@home` is the
// operator's own role, kept open in this folder: its agent starts when work first reaches it.
// iac (MathGaps/iac) has no .abyme of its own: its pull-request template lives here.
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
  },
} satisfies TeamFile;
