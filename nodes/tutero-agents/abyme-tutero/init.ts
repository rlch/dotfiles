// The profile tutero on tutero-agents, a Hetzner CCX33 (abyme change tutero-agents-node): Tutero's
// agents, teams and triggers, off the Mac, on Codex over the operator's Codex account (operator,
// 2026-11-17: "use my codex account instead of claude for the eu server"). It is the one abymed there,
// tutero's alone, so nothing of coding: an owner's peer of the hub (tutero-hub) as the Mac's tutero was,
// the hub showing its agents to tutero's members. The user `tutero`, home /home/tutero.
//
// Not chezmoi's: this host is not chezmoi-managed. ../render.sh writes this folder and the parts of
// ../../../dot_config/abyme-common it imports into one folder, copied to the node's ~/.config by abyme
// call. The Mac's tutero (../../../dot_config/abyme-tutero) runs Tutero's triggers until it ends; the
// two never run at once (tutero-agents-node 4.1, Order).

import abyme from "@abyme/cell";
import code from "@abyme/code";
import records from "@abyme/records";
import load from "@abyme/load";
import { CODEX } from "../abyme-common/roles.ts";
import { tuteroRoles } from "../abyme-common/tutero-roles.ts";
import addTriggers from "../abyme-common/tutero-triggers.ts";

// Tutero's repositories, cloned with the fine-grained MathGaps token (design, Credentials).
const TUTERO_DIR = "/home/tutero/dev/tutero";

abyme.server({ port: 4484, stateDir: "~/.local/state/abyme-tutero", clientDir: "~/.local/share/abyme/client" });
// The profile as the phone lists it: the hub's name, colour and icon.
abyme.server({ name: "Tutero", color: "purple", icon: "briefcase" });
// Its address on the tailnet (`tailscale serve --https=4443` in front of its gateway), and an owner's
// peer of the hub, allowed there as `tutero-agents` once the Mac's peer is revoked (design, Order).
abyme.server({ url: "https://tutero-agents.tail21822e.ts.net:4443" });
abyme.server({ peerName: "tutero-agents", peers: { hub: "https://tutero-hub.tail21822e.ts.net:4443" } });

// The code app: agents, teams, git, land. No window draws it; the hub's page shows its agents.
code.setup();
// NOT the profile's node: the hub is, as for the Mac's tutero. Two nodes saying `profile` refuse
// every write of tutero's work until one turns it off.
records.setup({ profile: false });
// Turns never wait on the machine's cores, an account waits once capped. 4 teams at once on 8 cores
// (design). Health items go to lead@schools, tutero's dispatcher.
load.setup({ turns: false, accounts: { slow: 1 }, health: { to: "lead@schools" }, teams: 4, quotas: { "*": { teams: 4 } } });

// Tutero's triggers, here whenever this config runs: the Mac's tutero has ended first (design, Order).
addTriggers(TUTERO_DIR);

// schools', iac's and curriculum's presets on Codex. The model ids are placeholders until they are read
// on the node with `agents.models` (tutero-agents-node 2.4): a start on one is refused until then.
const CODEX_MODEL = "codex-model-tbd";
const CODEX_MODEL_SMALL = "codex-model-small-tbd";
const MODELS: Record<string, string> = {
  "schools-lead": CODEX_MODEL,
  "schools-team-lead": CODEX_MODEL_SMALL,
  "schools-research": CODEX_MODEL,
  "schools-research-scan": CODEX_MODEL_SMALL,
  "schools-spec": CODEX_MODEL,
  "schools-build": CODEX_MODEL,
  "schools-fix": CODEX_MODEL_SMALL,
  "schools-eval": CODEX_MODEL,
  "schools-review": CODEX_MODEL,
  "schools-walk": CODEX_MODEL_SMALL,
  "iac-review": CODEX_MODEL,
  "curriculum-review": CODEX_MODEL,
};
tuteroRoles(CODEX, MODELS, TUTERO_DIR);
