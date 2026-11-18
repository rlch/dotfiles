// dotfiles' long-running commands (the abyme `processes` service): `abyme call processes start name=<name>`.
import type { ProcessFile } from "@abyme/processes";

export default {
  // Asks the node tutero-agents' gateway for a device key for lead@dotfiles (abyme calls on the node from
  // this Mac), asking again each time an ask ends unanswered (the gateway keeps one 10 minutes, ASK_FOR in
  // abyme crates/gateway/src/devices.rs), until an operator device allows one named lead-dotfiles-mac;
  // undo: `abyme devices revoke lead-dotfiles-mac` there. Everything goes to a private file, never the
  // process log: its last line, once allowed, is the key, printed once.
  "tutero-agents-device": {
    cmd: "sh -c 'umask 077; f=$HOME/.local/state/lead-dotfiles/tutero-agents-device.out; until abyme --url https://tutero-agents.tail21822e.ts.net:4443 devices add lead-dotfiles-mac > $f 2>&1; do grep -q \"no answer came in time\" $f || exit 1; done'",
    limit: 86400,
  },
} satisfies ProcessFile;
