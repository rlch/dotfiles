// `import accounts from "./accounts"` in init.ts, and `@abyme/accounts` anywhere: its entry in
// abyme's registry (docs/plugins.md, The registry).
import type { Handle } from "@abyme/plugin";
import type options from "./options.ts";
import type { AccountSpec, AccountStatus } from "./kind.ts";

declare module "@abyme/kernel/registry" {
  interface Services {
    accounts: { options: typeof options };
  }
}

declare module "@abyme/records" {
  interface RecordKinds {
    Account: { spec: AccountSpec; status: Omit<AccountStatus, "conditions"> };
  }
}

declare const accounts: Handle<"accounts">;
export default accounts;
