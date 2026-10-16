// `import accounts from "./accounts"` in init.ts, and `@abyme/accounts` anywhere: its entry in
// abyme's registry (docs/plugins.md, The registry).
import type { Handle } from "@abyme/plugin";
import type options from "./options.ts";

declare module "@abyme/kernel/registry" {
  interface Services {
    accounts: { options: typeof options };
  }
}

declare const accounts: Handle<"accounts">;
export default accounts;
