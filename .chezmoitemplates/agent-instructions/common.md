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
- Every `git push` requires explicit per-instance approval. Never treat prior
  approval as standing approval.
- Never use `git stash` on `main`; the user may be editing it concurrently.
  Revert only specific unauthorized paths, or preserve worthwhile work on a
  side branch.
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

- Put long-running servers, watchers, builds, test runs, and log tails in a
  herdr tab or pane in your workspace so the user can inspect and control them.
  Use the shell tool only for short-lived foreground commands.
- Create tabs, panes, workspaces, and worktrees in your own workspace, not
  whichever workspace happens to be focused. Target
  `--workspace "$HERDR_WORKSPACE_ID"`.
- **Pass `--no-focus` explicitly on every `tab create`, `pane split`,
  `workspace create`, and `worktree create`.** The socket API already defaults
  `focus` to `false`, so this only makes the intent unmissable to the next
  reader — but never rely on the default by omitting the flag, and never pass
  `--focus`.
- Never steal focus. `--focus`, `workspace focus`, `tab focus`, `pane focus`,
  and `agent focus` are for one case only: the user asked to be taken somewhere
  in this request. Prior approval does not carry over to the next run. Wanting
  the user to see the result is not a reason — report the workspace or tab by
  name and let them jump there.
- This holds even when the calling skill closes its own tab afterwards. Create
  in the background regardless; if the self-close moves focus somewhere
  unhelpful, that is the accepted trade, not a bug to patch with `--focus`.
- Inspect what you spawned with `herdr pane read <pane> --source visible` and
  `herdr pane process-info --pane <pane>` — never by focusing it.

# Browser

- Browser automation attaches to ungoogled Chromium on `127.0.0.1:9222`,
  launched by `chrome-debug`. Stable Google Chrome is never the automation
  target.
- If no real automation page is available, tell the user to run `chrome-debug`;
  do not launch stable Chrome with a debugging port.
- Keep one browser tab per task and capture a screenshot or accessibility
  snapshot after meaningful navigation or state changes.
- The agent browser belongs in the dedicated aerospace `agent` workspace. Do
  not move it or steal focus.
