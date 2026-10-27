// The operator's own triggers (the triggers plugin's `items`): ones that run on this Mac only. A
// repository's `.abyme/triggers.ts` fires on every machine that checks it out; these never leave here.

import triggers from "@abyme/triggers";

const SCHOOLS = "/Users/rjm/dev/tutero/frontend/app/schools";

// schools' new Sentry issues, twice a weekday: a Sonnet agent tells lead@schools each once, and lead brings
// up an incident team per issue. It writes nothing, so it runs in the main checkout (operator, 2026-10-27:
// the watch is the operator's, never the repository's).
triggers.items.add({
  name: "sentry-watch",
  root: SCHOOLS,
  on: { cron: "0 9,15 * * MON-FRI" },
  run: {
    agents: "start",
    args: {
      provider: "acp",
      config: { model: "sonnet" },
      dir: SCHOOLS,
      brief: "Read .claude/skills/sentry/WATCH.md and follow it.",
    },
  },
});
