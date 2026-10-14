// `import publish from "./publish"` in init.ts, and `@abyme/publish` anywhere: its entry in
// abyme's registry (docs/plugins.md, The registry).
import type { Handle } from "@abyme/plugin";
import type options from "./options.ts";
import type { Publish } from "./api.ts";

declare module "@abyme/kernel/registry" {
  interface Services {
    publish: { server: Publish; options: typeof options };
  }
}

declare const publish: Handle<"publish">;
export default publish;
