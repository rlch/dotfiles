// dotfiles' long-running commands (the abyme `processes` service): `abyme call processes start name=<name>`.
import type { ProcessFile } from "@abyme/processes";

export default {
  // The trigger sccache-watch's check (dot_config/abyme/triggers.ts): stops a stalled sccache server.
  "sccache-watch": { cmd: "scripts/sccache-watch", limit: 60 },
} satisfies ProcessFile;
