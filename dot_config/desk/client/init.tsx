// Runs in every page, after the plugins, as the plugin `user`: the same `desk` a plugin's
// `setup` gets. Saving a file in client/ runs it again in every page.

import { definePlugin } from "@desk/client";

export default definePlugin({
  id: "user",
  // commands: [{ id: "user.hello", title: "Hello", run: () => alert("hello") }],
  // keys: [{ keys: "leader j", command: "user.hello" }, { keys: "mod+j", title: "Hello", run: () => alert("hello") }],
  setup(desk) {},
});
