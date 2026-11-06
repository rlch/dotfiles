// Tutero's team templates (the teams plugin), the profile tutero's, beside each repository's
// .abyme/teams.ts: a repository's template wins over one here of its name. The templates are
// ../abyme-common/tutero-roles.ts, shared with coding.
import type { TeamFile } from "@abyme/teams";
import { TUTERO_TEMPLATES } from "../abyme-common/tutero-roles.ts";

export default { templates: { ...TUTERO_TEMPLATES } } satisfies TeamFile;
