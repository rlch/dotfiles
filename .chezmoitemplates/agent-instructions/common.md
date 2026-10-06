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
  2026-09-30, replacing the 2026-08-27 rule and its worktree ban; the push guard hook is
  gone). A worktree, including a Claude worktree, pushes its own branch. Never force-push
  `main`/`master` (settings still deny it), and pushing a branch nobody asked you to create
  is still out of scope.
- **Never `git stash`, anywhere, for any reason.** `refs/stash` is one shared ref
  in the common git dir, so every worktree and agent pops the same stack; a
  conflicting pop leaves markers and unmerged entries that block `merge
  --ff-only` (left `main` unmergeable mid-landing, 2026-07-29). Park work in a
  commit instead, and revert only specific unauthorized paths.
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
- The sidebar shows each agent's frontend dev-server port next to its name, so
  the user can open it. That is automatic when the server runs in your pane, or
  in a pane of your tab or workspace where you are the only agent. Otherwise,
  once you start one, claim it from your own shell: `herdr-port <port>`
  (`--clear` drops it). Only frontends show: a port that serves HTML at `/`.

# Browser

- The `browser` skill is the only way to a browser: `playwright-cli`, run on
  demand. No browser MCP server, no Claude in Chrome, no stable Google Chrome,
  and no Chromium launched by hand. Repos carry no browser setup of their own;
  this file and that skill own it for every account.
- Headless is the default: a browser of your own per task,
  `playwright-cli -s=<unique name> open --idle-timeout=600000`, closed when
  done. Never `close-all` or `kill-all`; they end other agents' browsers.
- Headed is the shared ungoogled Chromium on `127.0.0.1:9222` (persistent
  profile: logins, 1Password), one agent at a time: `browser-headed acquire
  <name>` before attaching, every command through `browser-headed run <name>`
  (it puts the user's focus back), `browser-headed release` after. A second
  client on a shared browser can wedge everyone's new tabs blank (2026-10-05),
  so never attach without the lease and never leave a client attached.
- **ImmiAccount (`immi.homeaffairs.gov.au`) is never headless.** Akamai blocks
  it with a 403. Use the headed lease.
- The headed browser runs as a service in the herdr `browser` workspace
  (`browser-headed up`, or the human alias `chrome-debug`). Never start it, or
  any long-lived browser, from your own shell.
- Never type or fetch a password. The user signs in by hand or through the
  1Password extension in the headed profile.
- **Never bring the browser forward.** No `Page.bringToFront`, no driving the
  user's tabs; open your own tab and close it. It lives in the aerospace
  `agent` workspace; never move it.
- Any Chromium launch outside `playwright-cli` passes
  `--disable-features=MacAppCodeSignClone`. Without it a killed launch leaves a
  full app copy under `$TMPDIR/../X` (730 copies, 267 GB, filled the disk on
  2026-09-25).
