// dotfiles' long-running commands (the abyme `processes` service): `abyme call processes start name=<name>`.
import type { ProcessFile } from "@abyme/processes";

export default {
  // iPhone Duo 512GB Star White pickup in Hong Kong, told once when a store opens it (scripts/hk-iphone-duo-pickup.mjs);
  // the hk-iphone-duo trigger starts it. No model, and it buys nothing.
  "hk-iphone-duo": { cmd: "node scripts/hk-iphone-duo-pickup.mjs" },
} satisfies ProcessFile;
