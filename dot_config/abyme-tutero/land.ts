// How Tutero's repositories that carry no .abyme of their own land (the land plugin, `abyme call land
// add`), by their origin: the profile tutero's. The rows are ../abyme-common/tutero-roles.ts, shared with
// coding. A repository's own .abyme/land.ts wins; one named in both is refused.
import type { LandFiles } from "@abyme/land";
import { TUTERO_LAND } from "../abyme-common/tutero-roles.ts";

export default { ...TUTERO_LAND } satisfies LandFiles;
