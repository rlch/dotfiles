// The node tutero-agents' config: its ~/.config/abyme-tutero, the one profile tutero, which runs
// nowhere else since the Mac's was removed (tutero-agents-node 6.1, 2026-11-17).
//
// The profile tutero on tutero-agents, a Hetzner CCX33 (abyme change tutero-agents-node): Tutero's
// agents, teams and triggers, off the Mac, on Codex over the operator's Codex account (operator,
// 2026-11-17: "use my codex account instead of claude for the eu server"). It is the one abymed there,
// tutero's alone, so nothing of coding: an owner's peer of the hub (tutero-hub) as the Mac's tutero was,
// the hub showing its agents to tutero's members. The user `tutero`, home /home/tutero.
//
// Not chezmoi's: this host is not chezmoi-managed. ../render.sh writes this folder (init.ts, teams.ts,
// land.ts) and the parts of ../../../dot_config/abyme-common it imports into one folder, copied to the
// node's ~/.config by abyme call.

import abyme from "@abyme/cell";
import code from "@abyme/code";
import records from "@abyme/records";
import load from "@abyme/load";
import warm from "@abyme/warm";
import triggers from "@abyme/triggers";
import { CODEX, type On } from "../abyme-common/roles.ts";
import { tuteroRoles } from "../abyme-common/tutero-roles.ts";
import addTriggers from "../abyme-common/tutero-triggers.ts";
// The operator's rules, written beside this file by ../render.sh (it is not in this folder's source).
import { RULES } from "./rules.ts";

// Tutero's repositories, cloned with the fine-grained MathGaps token (design, Credentials).
const TUTERO_DIR = "/home/tutero/dev/tutero";

// Installed as the hub is (abyme scripts/tutero-hub/README.md): binaries in ~/.local/share/abyme-peer/bin.
abyme.server({ port: 4484, stateDir: "~/.local/state/abyme-tutero", clientDir: "~/.local/share/abyme-peer/client" });
// The profile as the phone lists it: the hub's name, colour and icon.
abyme.server({ name: "Tutero", color: "purple", icon: "briefcase" });
// Its address on the tailnet (`tailscale serve --https=4443` in front of its gateway), and an owner's
// peer of the hub, allowed there as `tutero-agents` once the Mac's peer is revoked (design, Order).
abyme.server({ url: "https://tutero-agents.tail21822e.ts.net:4443" });
abyme.server({ peerName: "tutero-agents", peers: { hub: "https://tutero-hub.tail21822e.ts.net:4443" } });

// The code app: agents, teams, git, land. No window draws it; the hub's page shows its agents.
code.setup();
// Each new worktree of a repository whose .abyme/warm.ts opts in (schools, #2062) starts from a warm
// donor's build output, as coding's: its donor under ~/.local/state/abyme-tutero/warm, capped at 20 GB.
warm.setup();
// NOT the profile's node: the hub is, as for the Mac's tutero. Two nodes saying `profile` refuse
// every write of tutero's work until one turns it off.
records.setup({ profile: false });
// Turns never wait on the machine's cores, an account waits once capped. 4 teams at once on 8 cores
// (design). Health items go to lead@schools, tutero's dispatcher.
load.setup({ turns: false, accounts: { slow: 1 }, health: { to: "lead@schools" }, teams: 4, quotas: { "*": { teams: 4 } } });

// Codex runs in full access, as the Mac's Claude agents run unprompted: its default, read-only, writes
// nothing, and its asking presets would park every git push and gh call on an approval nobody gives
// on a headless node. The node is Tutero's alone (design).
const ON = { ...CODEX, config: { mode: "full-access" } } satisfies On;

// schools', iac's and curriculum's presets on Codex, on its 6.2 models (operator, 2026-11-18, relayed by
// lead@abyme: "we shoudl use 6.2 sol, whatever equiv to opus is"): the Opus roles on gpt-6.2-astra ("Our most
// capable model for complex coding and professional work"), the Sonnet roles on gpt-6.2-sol ("Fast, go-to model
// for coding and everyday work"), as Codex's model list described them on 2026-11-18.
const LARGE = "gpt-6.2-astra";
const SMALL = "gpt-6.2-sol";
const MODELS: Record<string, string> = {
  "schools-lead": LARGE,
  "schools-team-lead": SMALL,
  "schools-research": LARGE,
  "schools-research-scan": SMALL,
  "schools-spec": LARGE,
  "schools-build": LARGE,
  "schools-fix": SMALL,
  "schools-eval": LARGE,
  "schools-review": LARGE,
  "schools-walk": SMALL,
  "iac-review": LARGE,
  "curriculum-review": LARGE,
};
// Every preset carries the operator's rules: no CLAUDE.md or AGENTS.md of theirs on this host.
tuteroRoles(ON, MODELS, TUTERO_DIR, RULES);

// Tutero's triggers, off until the move: this tutero is up before it (Codex sign-in, agents.models,
// clones) while the Mac's tutero still fires them, and two profiles firing them bring up two teams per
// pull request. The move (tutero-agents-node 4.1) flips this in the same step the Mac's stops.
const NODE_TRIGGERS = true;
if (NODE_TRIGGERS) addTriggers(TUTERO_DIR, { ...ON, config: { ...ON.config, model: SMALL } });

// Only Tutero's repositories' triggers and teams files are read here (abyme triggers-owned-repos): an
// agent of the profile in ~/dev/abyme on the Mac made the Mac's tutero run abyme's own triggers. A
// root is a main checkout, so a prefix says it; inTutero is the Mac's ~/dev/tutero, never this node's.
// `?.`: an abymed before triggers.owns has none, and the line must not break this init.
const ours = (root: string) => root === TUTERO_DIR || root.startsWith(`${TUTERO_DIR}/`);
triggers.owns?.add({ id: "tutero", owns: ({ root }) => ours(root) });
