// The coding profile's app: the code app's list without its title bar, as Ghostty's
// `macos-titlebar-style = hidden`: no title bar and no window buttons. An app runs its list and
// nothing else (docs/abymed.md, Apps), so this is code's groups and own plugins, less `titlebar`.

import { agents, coding, content, core, defineApp, themes } from "@abyme/platform";
import code from "@abyme/code";
import abyme from "@abyme/plugin";

// On linode-8's peer (ABYME_PEER_HERE, init.ts) Coding runs no team and lands nothing.
const peer = abyme.env.ABYME_PEER_HERE === "linode-8-peer";
const off = peer ? ["teams", "land"] : [];

export default await defineApp("coding", [...core, ...themes, ...content, "rail", "spaces-view", ...agents, ...coding, ...code.own].filter((m) => !off.includes(m)), code.given);
