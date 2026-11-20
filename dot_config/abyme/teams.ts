// The operator's own roles and team templates (the teams plugin), beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. `lead@home` is the
// operator's own role, kept open in this folder: its agent starts when work first reaches it.
// iac's and curriculum's pull-request templates are the node tutero-agents' (its teams.ts in
// nodes/tutero-agents), where Tutero's triggers run. This file imports nothing: abyme runs it from its text alone.
import type { TeamFile } from "@abyme/teams";

export default {
  roles: { lead: "home-lead" },
  // One agent of a preset in init.ts, started through New team in any repository: Fix, Infra and
  // Mobile, once New agent lists models only (operator, 2026-11-20: "Fix, Infra, Mobile: make them
  // team roles"). One role, no lead and no stages: it takes the team's first work itself.
  templates: {
    fix: { title: "Fix", icon: "wrench", groups: [{ title: "Fix", roles: { fix: "fix" } }] },
    infra: { title: "Infra", icon: "cloud", groups: [{ title: "Infra", roles: { infra: "infra" } }] },
    mobile: { title: "Mobile", icon: "smartphone", groups: [{ title: "Mobile", roles: { mobile: "mobile" } }] },
  },
} satisfies TeamFile;
