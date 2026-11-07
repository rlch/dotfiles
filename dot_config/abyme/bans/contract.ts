// `import bans from "./bans"` in init.ts: its entry in abyme's registry (docs/plugins.md, The
// registry). Types alone; it has no service.
import type { Handle } from "@abyme/plugin";
import type options from "./options.ts";

declare module "@abyme/kernel/registry" {
  interface Services {
    bans: { options: typeof options; service: false };
  }
}

declare const bans: Handle<"bans">;
export default bans;
