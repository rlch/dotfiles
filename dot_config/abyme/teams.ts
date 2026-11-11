// The operator's own roles and team templates (the teams plugin), beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. `lead@home` is the
// operator's own role, kept open in this folder: its agent starts when work first reaches it.
// iac's and curriculum's pull-request templates are the profile tutero's (../abyme-tutero/teams.ts),
// where Tutero's triggers run. This file imports nothing: abyme runs it from its text alone.
import type { TeamFile } from "@abyme/teams";

export default {
  roles: { lead: "home-lead" },
} satisfies TeamFile;
