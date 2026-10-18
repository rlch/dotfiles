// What every profile of mine shares (coding in ~/.config/abyme, knowledge in
// ~/.config/abyme-knowledge): each init.ts imports this and calls `common({ lead })`. Plain code, imported
// by a relative path; a save here runs each config that imports it again (docs/abymed.md, Several
// abymeds). What one profile alone needs stays in its own init.ts.

import abyme from "@abyme/plugin";
import standard from "@abyme/standard";
import agentation from "@abyme/agentation";
import vim from "@abyme/vim";
import terminal from "@abyme/terminal";
import sentry from "@abyme/sentry";
import agents from "@abyme/agents/inventory";
import accounts from "./accounts";
import publish from "./publish";
import replay from "./replay";

/** `lead`: the profile that renews the accounts' tokens (coding, always running). Two renewing one
 * refresh token race, and the loser holds a dead one. */
export function common({ lead }: { lead: boolean }) {
  // The built client abymed serves: a stable copy, so a build in ~/dev/abyme never changes what an
  // open page is running. `scripts/promote` in ~/dev/abyme copies a finished build here.
  abyme.server({ clientDir: "~/.local/share/abyme/client" });
  // The names abyme answers for besides IP addresses and localhost: the phone's address.
  abyme.server({ hosts: ["richards-macbook-pro-2.tail21822e.ts.net"] });
  // One list of devices for the Mac: a device paired once reaches every profile. Coding's own file,
  // where the phone is already allowed.
  abyme.server({ devicesFile: "~/.local/state/abyme/devices.json" });

  // The built-ins most setups run, with the mono font Ghostty uses here in the editor, code blocks
  // and terminals. A member's own line below stands in place of the set's setup of it, before or
  // after this line.
  standard.setup({ mono: { font: "JetBrainsMono Nerd Font" } });
  agentation.setup();
  // The terminal in Ghostty's size, cell height, cursor and padding here; its font is the mono font above.
  terminal.setup({ size: 15, cellHeight: "10%", cursor: "bar", paddingX: 6, paddingY: 4 });
  // Vim on the laptop and the iPad, off on the phone: with a soft keyboard its modes cannot be
  // used, and files open read-only in normal mode. A member of the standard set, so this line stands
  // in place of the set's and is no second setup. An iPad is a tablet with or without its keyboard.
  vim.setup({ composer: true }, { when: { device: ["desktop", "tablet"] } });
  // Which Claude account an agent abyme launches runs on, as clodcurrent picks for `cl` (accounts/design.md).
  accounts.setup({ renew: lead });
  // "Publish document to the web" and "Unpublish document": a document as a page on artifacts.rjmath.com, asked first (publish/).
  publish.setup();
  // rrweb on every page but a phone's, unmasked but for passwords and local: the last hour on disk,
  // a checkout every 2 minutes; leader ⇧R and any uncaught error save the last 10 minutes to
  // <stateDir>/replays, "Save replay of the last hour" all of it; agents read them with replay_read (replay/).
  replay.setup({}, { when: { device: ["desktop", "tablet"] } });
  // My assistant on pi and DeepSeek V4.1 Flash, in place of abyme's Claude one (same id, same instructions): a
  // fast, cheap model for talk; it delegates real work to agents. pi reads its key from the keychain
  // (~/.pi/agent/auth.json).
  agents.presets.add({
    id: "assistant",
    title: "Assistant",
    provider: "acp",
    harness: "pi",
    model: "deepseek/deepseek-flash",
    name: "assistant",
    instructions:
      "You are the operator's assistant in abyme. They may be speaking to you; keep answers to one to three short sentences, no markdown unless asked. You do not write code yourself: start agents for work and tell them how to report back to you by name; read and tell agents; drive abyme with remote_run (read the layout before changing it). Call agents_skill before work a skill covers. Say what you did, then stop.",
    dock: "right",
  });
  // Every page's errors, faults and failed plugins to Sentry (abyme.sentry.io, project abyme), tagged by plugin and device.
  sentry.setup({ dsn: "https://39bd07b80cf1e53066b9da857178643e@o4512167308820480.ingest.us.sentry.io/4512230761758720" });
}
