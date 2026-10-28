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
- **Told to match another tool, read its source first** (clone it into
  `~/dev/refs`) and cite file:line before calling anything impossible.
- **In a design discussion with me, keep speccing**: start fix agents only once
  I am confident it is all specced.
- **End every report with the next step:** what you are doing next, or the one
  thing you need from me.
- These are refused by a hook (`~/.claude/guard.py`), under every permission
  mode: `git stash`, `--no-verify`, force-pushing `main`/`master`,
  `playwright-cli close-all`/`kill-all`, `pkill`/`killall` (kill only PIDs you
  started), `find`/`fd`/`du`/`rg`/`grep -r` (or Grep/Glob) over `/` or the home folder (search the
  folder you mean, or `mdfind -name`), editing a chezmoi-deployed file, and a Haiku subagent. Do not look for a way round it; say what you needed.

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
  operator's `land.ts`, says how it lands). It runs no full gate first: when the
  repository's file names a `check`, it runs on the batch, scoped to what changed;
  it runs what the repository's own instructions name before `land add`. It does not park the
  branch and wait for "merge". The ask-first list above is the exception.
- Use isolated worktrees for parallel edit agents. Never let one agent's
  cleanup revert or overwrite another agent's work.

# abyme

- abyme is where agents and their work live, and that work runs in the background; its skills and
  tools say how. From your shell it is `abyme call <service> <function> key=value` (`key:=<json>`
  for JSON); exit 3 means abyme is not running.
- A long-running server, watcher, build or test run is an abyme process, never your shell: `abyme
  call processes start name=<name>`, a name in the repo's `.abyme/processes.ts` (`export default {
  dev: { cmd: "pnpm dev" } } satisfies ProcessFile`). Never wait on one: end your turn, and abyme
  tells you when it exits.
- Never test on the live abyme (port 4477, `~/.config/abyme`, `~/.local/state/abyme`): a test
  abymed has its own port and state folder, or you say what is unverified.
- Nothing you run appears on the operator's screen (no app window, Finder window or dev abyme on
  the host): run it headless or in a tart VM (the `tart` skill), or say what is unverified.
- Name an agent in a message as a link the operator can click: `abyme:agent/<role@team or id>`
  (`abyme:agent/lead@edit-log`), never a bare `lead@edit-log`.
