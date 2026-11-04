// The coding profile's app: the code app's list without its title bar, as Ghostty's
// `macos-titlebar-style = hidden`: no title bar and no window buttons. An app runs its list and
// nothing else (docs/abymed.md, Apps), so this is code's groups and own plugins, less `titlebar`,
// and less `lsp` for now (operator, 2026-11-04, code-app-matches-coding/cuts).

import { agents, coding, content, core, defineApp, themes } from "@abyme/platform";
import code from "@abyme/code";

export default await defineApp("coding", [...core, ...themes, ...content, "rail", "spaces-view", ...agents, ...coding.filter((p) => p !== "lsp"), ...code.own], code.given);
