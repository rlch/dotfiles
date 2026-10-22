// The operator's own roles and team templates (the teams plugin), beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. `lead@home` is the
// operator's own role, kept open in this folder: its agent starts when work first reaches it.
import type { TeamFile } from "@abyme/teams";

export default {
  roles: { lead: "home-lead" },
  templates: {},
} satisfies TeamFile;
