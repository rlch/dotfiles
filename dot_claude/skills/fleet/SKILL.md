---
name: fleet
description: Manage the standing "fleet" of long-lived cmux surfaces — servers, dev/watchers, REPLs, daemons, task browsers — as named, claimable tabs that persist across agent sessions and are visible to every Claude instance. Use whenever you start or need to oversee something that OUTLIVES one turn and is the SUBJECT of work (a dev server, `cargo watch`, a database, the moomoo OpenD / nats / ollama daemons, a REPL you'll reuse, a browser pointed at the app) — instead of leaking it into an ephemeral background Bash that no other instance can see or reattach to. Also use to discover what's already running across instances (`fleet ls`), read another agent's surface, claim a surface before driving it, or hand one off. NOT for sub-turn one-shots (ls, git status, a quick build) — those stay in the normal Bash tool.
---

# fleet — cmux estate manager

`fleet` (at `~/.local/bin/fleet`, a thin wrapper over the `cmux` CLI) gives
every Claude instance a shared, persistent view of long-lived processes. cmux
is the daemon that actually holds the surfaces, so visibility and handoff work
across sessions and across instances for free.

## The litmus test — what goes in the fleet

Promote a process to a named fleet tab when **lifetime > one turn AND** it's
the *subject* of work (run/watched), not a *tool* used to produce an answer
and discarded. Concretely:

- **Yes:** dev servers, `cargo watch` / `tsc --watch` / test watchers, local
  DBs, the trading daemons (nats / moomoo OpenD / ollama), a warm REPL you'll
  reuse, a browser pointed at the app under dev, a long build/deploy you'll
  glance back at.
- **No (keep in normal Bash):** `ls`, `git status`, a one-shot build whose
  output you read once, anything no other instance ever needs to see.

## Where things live

- **Default — a named tab in the current workspace.** `fleet spawn` opens the
  process right where you're working. No relocation required.
- **`--ops` — the shared `ops` workspace.** Reserved for always-on,
  cross-project daemons (nats / OpenD / ollama).
- Membership is by **name**: a surface is in the fleet iff its tab title is
  role-prefixed — `srv:` `db:` `watch:` `repl:` `web:` `mon:` `job:` `svc:`.
  `fleet spawn` names tabs that way; `fleet name <target> <role:name>` adopts
  an existing surface.

## Read-all, claim-to-write

- `fleet ls` / `fleet read` work on **any** surface, no claim needed.
- `fleet send` / `fleet key` **require you to hold a claim** on the target.
  Claims are per-instance, keyed by surface UUID, and shown as a lock badge on
  the tab. Stale claims (owner gone, or > 30 min old) auto-free.
- To drive a surface another agent started: `fleet claim <target>` (or
  `--steal` if it's actively held and you must take over), act, then
  `fleet release <target>`.

## Verbs

```sh
fleet ls [--all] [--all-surfaces] [--ws REF]   # inventory (name·proc·claim·ws)
fleet read <target> [-n N] [--scrollback]      # dump a surface's screen
fleet spawn srv:vite --ws REF -- pnpm dev      # named tab running a command
fleet spawn db:pg --ops -- postgres -D ...      # a daemon in the ops workspace
fleet browser http://localhost:5173            # a browser surface (also drivable via `cmux browser ...`)
fleet claim <target> [--steal]                 # take write access
fleet send <target> <text> [--claim]           # run a command (claim required)
fleet key  <target> <key>  [--claim]           # send a key/chord (e.g. ctrl-c)
fleet release <target> [--force]               # drop your claim
fleet name <target> <role:name>                # adopt/rename into the fleet
fleet ops                                       # ensure + print the ops workspace
```

`<target>` is a surface ref (`surface:40`), a UUID, or the tab name
(`srv:vite`, matched exactly then by prefix).

## Notes

- After `spawn`, the spawner automatically holds the claim — you can `send`
  immediately; `release` it when handing off.
- `fleet ls` defaults to the current + `ops` workspaces; `--all` spans every
  workspace, `--all-surfaces` also lists unnamed (non-fleet) tabs so you can
  adopt one.
- Showing the user an image, auto-opening a browser when a server's URL
  appears, and an event-driven daemon are planned (Phase 2/3) — not wired yet.
