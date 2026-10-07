# Writing

Be blunt and short. Jargon and bloat are the failure mode, not terseness.

- Answer first, in plain words. No preamble, no recapping my question back to
  me, no summary of what you just said.
- Say the thing directly. Cut "the sharp question is", "worth sitting with",
  "the real tension is", and every other phrase that announces a thought
  instead of having one.
- One quote from a doc, only if the quote decides something. Stacking citations
  to sound grounded is bloat.
- Bold, headers and tables are for structure I need, not for emphasis by
  default. Most answers need none of them.
- Recommendation is one line. I'll ask if I want the reasoning.
- Never write a paragraph where a sentence works, or a sentence where a word
  works.

# Working with me

- **Act on your own recommendation.** If you would recommend a step and it can
  be undone, do it and tell me afterwards. Never end a turn on "shall I?" for
  something you already think is right.
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
  mode: `git stash`, `--no-verify`, force-pushing `main`/`master`, herdr focus,
  `playwright-cli close-all`/`kill-all`, editing a chezmoi-deployed file, and a
  Haiku subagent. Do not look for a way round it; say what you needed.

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
  own branch with the `land` skill (it knows each repo's mode from
  `~/.config/land/config.toml`); it does not park the branch and wait for
  "merge". The ask-first list above is the exception.
- Use isolated worktrees for parallel edit agents. Never let one agent's
  cleanup revert or overwrite another agent's work.

# Session Handoffs

"Spin off" and "hand off" mean launching the corresponding session-spawning
skill in herdr, never dispatching an inline subagent. A spinoff keeps this
session alive; a handoff replaces it after the new session is verified.

# Herdr

**Herdr is always the place to put work, and that work always runs in the
background.** Both halves hold unless the user states otherwise in the current
request.

- **Change the screen through `herdfile`, not by creating tabs and panes
  yourself.** Each workspace has a file saying what is on screen; herdfile makes
  herdr match it, and what leaves the file is closed.
  - `herdfile show`: what is in this workspace. Look before you add.
  - `herdfile place <name> --tab services`: put a long-running server, watcher,
    build, test run or log tail on screen, so the user can inspect and control
    it. `<name>` is a command the repo names in `.herdr/services.toml`
    (`[dev]` / `cmd = "pnpm dev"`); add the entry if it is missing. Placing one
    that is already there starts nothing new. `herdfile remove <name>` when you
    are done with it. Use the shell tool only for short-lived foreground commands.
  - `herdfile ws add <name> --dir <path> [--branch B] --purpose "..." --brief
    <file> --model opus`: another agent in its own workspace (a herdr worktree
    with `--branch`), started through `cl` and told to read the brief. The name
    is lowercase letters, digits, `-` and `_`, and unique.
  - `herdfile tree`: every workspace, who started it, and its agent's status.
    `herdfile tell <name|parent> "..."` messages one (`--wait` for its reply).
    `herdfile ask "..."` puts a question on the user's list.
  - `herdfile ws remove <name>` closes a workspace once its agent is idle and its
    branch merged. Never remove your own while the user has yet to read your report.
- A pane or workspace opened with `herdr` directly still works, but it is
  recorded `unmanaged` and nothing ever closes it. When you must, target your own
  workspace (`--workspace "$HERDR_WORKSPACE_ID"`) and pass `--no-focus`
  (hook-enforced on `tab create`, `pane split`, `workspace create`, `worktree
  create`).
- Never steal focus (hook-enforced). `--focus`, `workspace focus`, `tab focus`,
  `pane focus`, and `agent focus` are for one case only: the user asked to be
  taken somewhere in this request, and then the command carries the prefix
  `HERDR_FOCUS=asked`. Prior approval does not carry over to the next run.
  Wanting the user to see the result is not a reason — report the workspace or
  tab by name and let them jump there.
- This holds even when the calling skill closes its own tab afterwards. Create
  in the background regardless; if the self-close moves focus somewhere
  unhelpful, that is the accepted trade, not a bug to patch with `--focus`.
- Inspect what you spawned with `herdr pane read <pane> --source visible` and
  `herdr pane process-info --pane <pane>` — never by focusing it.
- The sidebar shows each agent's frontend dev-server port next to its name, so
  the user can open it. That is automatic when the server runs in your pane, or
  in a pane of your tab or workspace where you are the only agent. Otherwise,
  once you start one, claim it from your own shell: `herdr-port <port>`
  (`--clear` drops it). Only frontends show: a port that serves HTML at `/`.

# Browser

- The `browser` skill is the only way to a browser (`playwright-cli`; no browser
  MCP server, no Claude in Chrome, no Chromium launched by hand). Load it before
  touching one: it holds the headless default, the lease on the shared headed
  browser, and the launch flag that stops app copies filling the disk.
- **ImmiAccount (`immi.homeaffairs.gov.au`) is never headless**; use the headed
  lease. Never type or fetch a password, and never bring the browser forward.
