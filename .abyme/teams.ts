// dotfiles' own roles (the teams plugin): lead@dotfiles, kept open in this checkout, starts when work
// first reaches it. Its preset (init.ts, dotfiles-lead) makes changes itself; no team templates yet.
import type { TeamFile } from "@abyme/teams";

export default {
  roles: { lead: "dotfiles-lead" },
  templates: {},
} satisfies TeamFile;
