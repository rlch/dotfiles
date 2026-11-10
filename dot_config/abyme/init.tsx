// Runs in every page, after the plugins, as the plugin `user`: top-level code, and a service is
// an import, as in any plugin. Saving it, or a file it imports, runs it again in every page.

import keys from "@abyme/keys/inventory";
// import commands from "@abyme/commands/inventory";

// ⌃F maximizes the column, or gives its width back: ⌥F went to OmniWM with the other ⌥ letters
// (operator, 2026-11-09: "just keep ctrl instead"), beside ⌃H/J/K/L. Not while typing, so a text
// field keeps ⌃F (forward a character); a terminal owns its keys.
keys?.add({ keys: "ctrl+f", command: "layout.column.maximize", typing: false });

// commands.add({ id: "user.hello", title: "Hello", run: () => alert("hello") });
// keys.add({ keys: "leader j", command: "user.hello" });
