// What every profile of mine shares (coding in ~/.config/abyme, knowledge in
// ~/.config/abyme-knowledge, bevy in ~/.config/abyme-bevy): each init.ts imports this and calls `common()`. Plain code, imported
// by a relative path; a save here runs each config that imports it again (docs/abymed.md, Several
// abymeds). What one profile alone needs stays in its own init.ts: which built-ins run is each
// profile's (coding the code app, knowledge its own list).

import abyme from "@abyme/cell";
import agents from "@abyme/agents/inventory";
import theme from "@abyme/theme";
import vim from "@abyme/vim";
import status from "@abyme/status";
import spaces from "@abyme/spaces/inventory";
import accounts from "./accounts";
import publish from "./publish";

export function common() {
  // The built client abymed serves: a stable copy, so a build in ~/dev/abyme never changes what an
  // open page is running. `scripts/promote` in ~/dev/abyme copies a finished build here.
  abyme.server({ clientDir: "~/.local/share/abyme/client" });
  // The names abyme answers for besides IP addresses and localhost: the phone's address.
  abyme.server({ hosts: ["richards-macbook-pro-2.tail21822e.ts.net"] });

  // The mono font Ghostty uses here, in the editor, code blocks and terminals.
  theme.setup({ mono: "JetBrainsMono Nerd Font" });
  // Vim on the laptop and the iPad, off on the phone: with a soft keyboard its modes cannot be
  // used, and files open read-only in normal mode. A member of every app, so this line stands
  // in place of the app's and is no second setup. An iPad is a tablet with or without its keyboard.
  vim.setup({}, { when: { device: ["desktop"] } });
  // No "N asks" in the bottom bar (operator, 2026-11-02): asks show in Needs you and the composer's row.
  status.setup({ hidden: ["agent-list.needs"] });
  // Which Claude account an agent abyme launches runs on, by its setup-token (accounts/design.md).
  accounts.setup();
  // Claude Code's auto memory off for every agent abyme launches (operator, 2026-10-25): an agent's
  // lessons go in its item's notes and its role's `.abyme/roles/<role>.md`, not a MEMORY.md every
  // session loads. The variable wins over the setting `autoMemoryEnabled`; a terminal's `claude`
  // keeps its memory. A running agent keeps what it loaded until it is next started or resumed.
  agents.prepare.add({ prepare: (l) => (l.kind === "claude" ? { env: { CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" } } : {}) });
  // "Publish document to the web" and "Unpublish document": a document as a page on artifacts.rjmath.com; agents ask the operator in its chat to run `publish share` themselves (publish/).
  publish.setup();
  // Where agents are listed in Spaces, first answer wins (docs/cells.md, Spaces): after-land's
  // fix agents in "Fixes", and an idle agent whose branch is on main folded away in "Done".
  spaces.rules.add({ id: "fixes", place: (a) => (a.name.startsWith("fix-") ? { group: "Fixes" } : undefined) });
  spaces.rules.add({ id: "done", place: (a) => (a.status === "idle" && a.merged ? { group: "Done", folded: true } : undefined) });
}
