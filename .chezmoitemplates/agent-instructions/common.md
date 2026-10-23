# Writing

Be blunt and short. Jargon and bloat are the failure mode, not terseness.

- Answer first, in plain words. No preamble, no recapping my question back to
  me, no summary of what you just said.
- Say the thing directly. Cut "the sharp question is", "worth sitting with",
  "the real tension is", and every other phrase that announces a thought
  instead of having one.
- One quote from a doc, only if the quote decides something. Stacking citations
  to sound grounded is bloat.
- No bold or headers for emphasis in plain prose. In abyme, numbers, a
  comparison or a choice are structure I need: show them in a ```openui
  block (a stat, a chart, a table, buttons for a decision).
- Recommendation is one line. I'll ask if I want the reasoning.
- Never write a paragraph where a sentence works, or a sentence where a word
  works.

# Working with me

- **Act on your own recommendation, now.** If you would recommend a step and it
  can be undone, take it at once and report the decision afterwards, in one line
  I can review and reverse (operator, 2026-10-21). No `questions_proceed` timer, no
  waiting for a go. Never end a turn on "shall I?" for something you already
  think is right.
- **Ask first only for these**, with a plain explanation of what changes, how it
  fits what exists, what it costs, and the alternative:
  - a change to an AI's prompts, tools, agent loop or harness;
  - new infrastructure, a new dependency or service, or a new architectural pattern;
  - anything that could affect performance;
  - who pays or spends a seat, who can see or delete whose data;
  - anything run against production, and anything that cannot be undone.
  Bug fixes and changes that follow existing patterns are not on this list.
- **Ask once.** Park the item, carry on with the rest, and never repeat an open
  question.
- **End every report with the next step:** what you are doing next, or the one
  thing you need from me.
- These are refused by a hook (`~/.claude/guard.py`), under every permission
  mode: `git stash`, `--no-verify`, force-pushing `main`/`master`,
  `playwright-cli close-all`/`kill-all`, `pkill`/`killall` (kill only PIDs you
  started), editing a chezmoi-deployed file, and a Haiku subagent. Do not look for a way round it; say what you needed.

# Dotfiles

When editing anything under `~/.config/`, `~/.claude/`, `~/.agents/`,
`~/.local/`, or `~/dev/dotfiles/`, read `~/dev/dotfiles/CLAUDE.md` before
making changes. It is the source-of-truth guide for the chezmoi flow: edit the
source in `~/dev/dotfiles`, never a deployed copy, and run `chezmoi apply`
after every edit.

# Skills - keep them correct

When one of my own skills under `~/dev/skills/` is wrong, stale, incomplete,
or makes you dig, guess, or work around it, fix the skill at its source before
you finish the task. Anything you had to discover that the skill should have
told you belongs back in that skill so the next run does not hit the same gap.

- Resolve deployed skills with `realpath` before editing. If `chezmoi
  source-path <realpath>` reports a managed source, edit that source and apply
  it; otherwise edit the real source directly.
- Keep repairs minimal and in the skill's existing voice. Do not rewrite a
  skill wholesale to fix one gap.
- Do not edit read-only bundled skills. Surface the gap instead, and capture a
  durable project or global instruction when appropriate.
- Report one line per skill repaired.

# Git Workflow

- Use conventional commits with a meaningful scope: `type(scope): subject`.
  Subjects are imperative, lowercase, and have no trailing period.
- Rebase, never merge. Pull with `--rebase`; do not create merge commits.
- For review fixups, stage the fixes and use `git ab` (`git absorb
  --and-rebase`), or `git abm <base>` for a deep stack.
- PRs are squash-merged. The PR title becomes the squashed conventional commit.
- Force-push is allowed on personal branches, never on `main` or `master`.
- **`git push` needs no approval, from anywhere: push when the work is ready** (operator,
  2026-09-30). A worktree, including a Claude worktree, pushes its own branch. Never force-push
  `main`/`master` (hook-enforced), and pushing a branch nobody asked you to create
  is still out of scope.
- **Never `git stash`** (hook-enforced): `refs/stash` is one ref shared by every
  worktree and agent. Park work in a commit instead, and revert only specific
  unauthorized paths. Never `--no-verify` either.
- **Finished and green means landed.** The session that did the work lands its
  own branch with `abyme call land add`, then ends its turn and acts on land's
  event (the `land` skill says how; the repository's `.abyme/land.ts`, or the
  operator's `land.ts`, says how it lands). It runs no full gate first: the
  batch check is the repository's, scoped to what changed. It does not park the
  branch and wait for "merge". The ask-first list above is the exception.
- Use isolated worktrees for parallel edit agents. Never let one agent's
  cleanup revert or overwrite another agent's work.

# Session Handoffs

"Spin off" and "hand off" mean launching the corresponding session-spawning
skill in abyme, never dispatching an inline subagent. A spinoff keeps this
session alive; a handoff replaces it after the new session is verified.

# abyme

**abyme is where agents and their work live, and that work always runs in the
background.** Both halves hold unless the user states otherwise in the current
request.

Everything here is `abyme call <service> <function> key=value ...` from your
shell: `key:=<json>` passes JSON, one bare JSON array passes the arguments in
order, and `--json` prints the whole answer. It knows which agent you are and
which folder you are in. Exit 1 means it refused, and says why; exit 3 means
abyme is not running.

- **A long-running server, watcher, build, test run or log tail goes in a
  process, not in your shell:** `abyme call processes start name=<name>`. It runs
  in a terminal of its own the user sees under Terminals and can type into, and
  survives abyme restarting. `<name>` is one the repo names in
  `.abyme/processes.ts`; add it if missing:
  ```ts
  import type { ProcessFile } from "@abyme/processes";
  export default { dev: { cmd: "pnpm dev" } } satisfies ProcessFile;
  ```
  Starting one that runs starts nothing new. `abyme call processes remove
  name=<name>` when you are done with it; `abyme call processes list` says what
  runs. Use the shell tool only for short-lived foreground commands.
  **Never wait on one you started** (a gate, a build): end your turn. abyme
  tells you once when it exits (an `<abyme-event source="processes"
  event="exited">` with its last lines), and you carry on from there; `wake:=false` on `start`
  for one you do not want to hear of.
- **Another agent:** `abyme call agents start provider=acp dir=<repo>
  [branch=<b> base=main] name=<name> config:='{"model":"opus"}'
  brief="Read <file> and follow it."` starts one on a worktree of its own with
  `branch` (`~/.local/share/abyme/worktrees/<repo>/<branch>`, never beside the
  repo), on the account abyme picks. The name is lowercase letters, digits,
  `-` and `_`, and unique. abyme keeps no relation between agents: to hear
  back, name yourself in the brief.
  - `abyme call agents list [cwd=<dir>] [branch=<b>] [name=<name>]`: every
    agent, with its id, name, status, branch and folder.
  - `abyme call agents tell to=<name> text="..."` messages one (`wait:=true`
    for its reply).
    It reaches them as your `<agent-message>`. An `<agent-message>` or
    `<abyme-event>` you get is never the operator (the `messages` skill).
  - `abyme call agents reply agent=<name>` reads its last words without
    messaging it.
  - Before ending a turn on what another agent, a process, a PR or a time
    will bring, hold a wait (the `messages` skill): `abyme call triggers wait
    on:='{"agents.state":{"agent":"<name>","states":["idle","blocked"]}}'
    note="<what>"`, then end your turn; abyme wakes you once. A promise in a
    message is not a wait.
  - `abyme call agents messages [agent=<name>]` lists recent tells, who to
    whom and whether each was answered.
  - `abyme call agents remove ids:='["<id>"]'` closes an agent and the worktree its
    start made, once it is idle and its branch landed. Never remove your own
    while the user has yet to read your report.
- Nothing here opens anything on the user's screen. Report an agent or a process
  by name and let them look; never drive their screen with `remote_run` unless
  they asked for it in this request.
- **Never test on the live abyme** (port 4477, `~/.config/abyme`,
  `~/.local/state/abyme`). A test abymed runs on its own port with its own state
  folder; if that is not possible, do not test: say what is unverified.
- **Nothing you run appears on the operator's screen** (operator, 2026-10-22): no
  app window, game, Finder window, dev abyme or double-click test on the host.
  Run it headless, or in a tart VM (`tart`, a clone of
  `ghcr.io/cirruslabs/macos-tahoe-base` or a local golden image, with
  `tart run --no-graphics`, driven over `tart exec`/ssh and screenshot inside the
  VM). If neither works, do not run it: say what is unverified.

# Browser

- **Your browser is abyme's**: its `browser` skill. `abyme call browser session`
  starts a headless Chrome of your own and prints the `playwright-cli -s=<you>
  attach --cdp=…` line; the operator watches it beside your chat and can take it
  over. Sign-ins and payments go to them: `abyme call browser handoff
  reason="Sign in to GitHub"`, then end your turn. No browser MCP server, no
  Claude in Chrome, no `playwright-cli open`, no Chromium launched by hand.
- **ImmiAccount (`immi.homeaffairs.gov.au`) is never headless**; use the headed
  lease: `browser-headed acquire <task>`, attach to the address it prints, every
  command through `browser-headed run <task> …`, and `browser-headed release`
  when done. Never type or fetch a password, and never bring the browser forward.
