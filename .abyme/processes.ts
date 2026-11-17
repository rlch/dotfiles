// dotfiles' long-running commands (the abyme `processes` service): `abyme call processes start name=<name>`.
import type { ProcessFile } from "@abyme/processes";

export default {
  // iPhone Duo 512GB Star White pickup in Melbourne, told once when a store opens it (scripts/mel-iphone-duo-pickup.mjs);
  // the mel-iphone-duo trigger starts it. No model, and it buys nothing.
  "mel-iphone-duo": { cmd: "node scripts/mel-iphone-duo-pickup.mjs" },
} satisfies ProcessFile;
