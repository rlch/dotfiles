// dotfiles' long-running commands (the abyme `processes` service): `abyme call processes start name=<name>`.
import type { ProcessFile } from "@abyme/processes";

export default {
  // Asks the node tutero-agents' gateway for a device key for lead@dotfiles (abyme calls on the node from
  // this Mac), waiting until an operator device allows it; undo: `abyme devices revoke lead-dotfiles-mac`
  // there. Everything goes to a private file, never the process log: its last line is the key, printed once.
  "tutero-agents-device": {
    cmd: "sh -c 'umask 077; abyme --url https://tutero-agents.tail21822e.ts.net:4443 devices add lead-dotfiles-mac > $HOME/.local/state/lead-dotfiles/tutero-agents-device.out 2>&1'",
    limit: 86400,
  },
} satisfies ProcessFile;
