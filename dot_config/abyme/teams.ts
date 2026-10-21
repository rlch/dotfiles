// The operator's own team templates (the teams plugin), beside each repository's .abyme/teams.ts: a
// repository's template wins over one here of its name. `home` is the standing team over every
// repository's: brought up when abymed starts, the parent of each repository's standing team.
import type { TeamFile } from "@abyme/teams";

export default {
  home: {
    title: "Home",
    keep: true,
    groups: [{ title: "Lead", roles: { lead: "home-lead" } }],
  },
} satisfies TeamFile;
