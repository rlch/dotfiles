// The operator's own roles and team templates (the teams plugin), beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. `lead@home` is the
// operator's own role, kept open in this folder: its agent starts when work first reaches it.
// iac's and curriculum's pull-request templates are ../abyme-common/tutero-roles.ts, shared with the profile tutero.
import type { TeamFile } from "@abyme/teams";
import { TUTERO_TEMPLATES } from "../abyme-common/tutero-roles.ts";

export default {
  roles: { lead: "home-lead" },
  templates: { ...TUTERO_TEMPLATES },
} satisfies TeamFile;
