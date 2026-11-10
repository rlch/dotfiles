// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// See docs/abymed.md, "Your config" and "Several abymeds".
//
// The profile tutero on the Mac, with no window (abyme tutero-headless-read): Tutero's agents,
// teams and triggers run here, moved from coding (design 6), and the hub on linode-8 shows them to
// tutero's members at tutero.abyme.studio. The gateway keeps it up (`abyme profiles add
// ~/.config/abyme-tutero --id tutero --stay`): nothing else would wake it, and the hub's forwards
// need it up. What every profile shares is ../abyme-common.
//
// Rollout (owner-by-name): the hub runs this abyme's build (promote) and is up before this profile
// peers with it, since the hello needs machine and profile. Rollback: `abyme profiles remove
// tutero`, this folder's moved parts back into ../abyme, and the hub's peer key `mac` revoked;
// tutero's records stay on the hub.

import abyme from "@abyme/cell";
import code from "@abyme/code";
import records from "@abyme/records";
import load from "@abyme/load";
import agents from "@abyme/agents";
import { common } from "../abyme-common/index.ts";
import { tuteroRoles } from "../abyme-common/tutero-roles.ts";
import { inTutero } from "../abyme-common/tutero.ts";
import addTriggers from "../abyme-common/tutero-triggers.ts";
import { TUTERO_MOVED } from "../abyme-common/tutero.ts";
import bans from "../abyme/bans";

abyme.server({ port: 4484, stateDir: "~/.local/state/abyme-tutero" });
// The profile as the phone lists it under this Mac: the hub's name, colour and icon.
abyme.server({ name: "Tutero", color: "purple", icon: "briefcase" });
// An owner's peer of the hub, over the tailnet (`tailscale serve` on linode-8's 4443, in front of
// its gateway), allowed there as `mac`.
abyme.server({ peerName: "mac", peers: { hub: "https://richard.tail21822e.ts.net:4443" } });
common();
// Coding fires them until the move is done whole: a lead@schools here would be a second one.
if (TUTERO_MOVED) addTriggers();
// The operator's own bans beside abyme's guard, as coding's (../abyme/bans).
bans.setup();

// The code app: agents, teams, git, land. No window draws it here; the hub's page shows its agents.
code.setup();
// NOT the profile's node: the hub is. It owns tutero's work, teams, members, shares and land queue,
// so a member's write is taken while this Mac sleeps. Two nodes saying `profile` refuse every one of
// those writes until one turns it off, so this line stays (owner-by-name's rollout rule).
records.setup({ profile: false });
// As coding's (operator, 2026-10-26): turns never wait on the machine's cores, an account waits once
// capped. Teams at once: 8 here, each repository 8, on top of coding's 16 on the same Mac (coding's
// budget cut, operator, 2026-11-06: "maybe decrease teams budget"). Health items go to lead@schools,
// tutero's dispatcher.
load.setup({ turns: false, accounts: { slow: 1 }, health: { to: "lead@schools" }, teams: 8, quotas: { "*": { teams: 8 } } });

// Only Tutero's repositories start here, so only Tutero's work logs to the hub (design 5). A
// refused launch releases its worktree. A probe starts nothing: it reads a harness's choices from
// no repository, and refusing it left every preset without its list, so no team or role started
// (2026-11-10).
agents.prepare.add({
  prepare: async (l) => {
    if (!l.probe && !(await inTutero(l.cwd)))
      throw new Error("Only Tutero's repositories (~/dev/tutero) start in tutero: start this in coding");
  },
});

// schools', iac's and curriculum's presets and the schools admission rules: ../abyme-common/tutero-roles.ts, shared with coding.
tuteroRoles();
