// What every profile of mine shares (coding in ~/.config/abyme, knowledge in
// ~/.config/abyme-knowledge, bevy in ~/.config/abyme-bevy): each init.ts imports this and calls `common({ lead })`. Plain code, imported
// by a relative path; a save here runs each config that imports it again (docs/abymed.md, Several
// abymeds). What one profile alone needs stays in its own init.ts: which built-ins run is each
// profile's (coding the code app, knowledge its own list).

import abyme from "@abyme/plugin";
import theme from "@abyme/theme";
import vim from "@abyme/vim";
// import sentry from "@abyme/sentry";
import spaces from "@abyme/spaces/inventory";
import accounts from "./accounts";
import publish from "./publish";

/** `lead`: the profile that renews the accounts' tokens (coding, always running). Two renewing one
 * refresh token race, and the loser holds a dead one. */
export function common({ lead }: { lead: boolean }) {
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
  // The composer starts in normal mode on both (operator, 2026-10-22): one setup stands per plugin.
  vim.setup({ composer: true, start: "normal" }, { when: { keyboard: true } });
  // Which Claude account an agent abyme launches runs on, as clodcurrent picks for `cl` (accounts/design.md).
  accounts.setup({ renew: lead });
  // "Publish document to the web" and "Unpublish document": a document as a page on artifacts.rjmath.com, asked first (publish/).
  publish.setup();
  // Sentry is off (operator, 2026-10-22): 25 issues filed, none fixed from it. Uncomment to turn it back on.
  // Every page's errors, faults and failed plugins to Sentry (abyme.sentry.io, project abyme), tagged by plugin and device.
  // sentry.setup({ dsn: "https://39bd07b80cf1e53066b9da857178643e@o4512167308820480.ingest.us.sentry.io/4512230761758720" });
  // Where agents are listed in Spaces, first answer wins (docs/plugins.md, Spaces): after-land's
  // fix agents in "Fixes", and an idle agent whose branch is on main folded away in "Done".
  spaces.rules.add({ id: "fixes", place: (a) => (a.name.startsWith("fix-") ? { group: "Fixes" } : undefined) });
  spaces.rules.add({ id: "done", place: (a) => (a.status === "idle" && a.merged ? { group: "Done", folded: true } : undefined) });
}
