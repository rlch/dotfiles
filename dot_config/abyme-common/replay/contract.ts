// `import replay from "./replay"` in init.ts, and `@abyme/replay` anywhere: its entry in
// abyme's registry (docs/plugins.md, The registry).
import type { Handle } from "@abyme/plugin";
import type options from "./options.ts";
import type { Replay } from "./api.server.ts";

declare module "@abyme/kernel/registry" {
  interface Services {
    replay: { server: Replay; options: typeof options };
  }
}

declare const replay: Handle<"replay">;
export default replay;
