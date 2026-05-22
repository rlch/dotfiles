@RTK.md

# Dotfiles

When editing anything under `~/.config/`, `~/.claude/`, `~/.local/`, or `~/dev/dotfiles/` — read `~/dev/dotfiles/CLAUDE.md` before making changes. It's the source-of-truth guide for the chezmoi flow (edit source in `~/dev/dotfiles/`, never the deployed files; `chezmoi apply` after every edit).

# Git workflow (global)

- **Commit messages**: conventional commits with scope — `type(scope): subject`.
  - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `build`, `ci`, `style`, `revert`.
  - Scope is the affected component (e.g. `fish`, `brew`, `engine`, `api`). Optional only if there's no meaningful component.
  - Subject is imperative, lowercase, no trailing period. Example: `fix(fisher): bootstrap reliably under fish 4.x`.
- **Branching**: rebase, never merge. Pull with `--rebase`. Resolve in-place; do not create merge commits.
- **PRs**: squash-merge only. The PR title is the squashed commit subject — make it conform to the commit format above.
- **Force-push**: allowed on personal branches; never on `main` / `master`.
- **Worktrees**: Claude Code's worktree isolation (`EnterWorktree`, the `--worktree` flag, and the Agent tool's `isolation: "worktree"` parameter) bases new trees on **`origin/HEAD` by default** — *not* the parent session's local `HEAD`. This means: any commit you made in the parent session that hasn't been pushed yet won't be in the worktree's base. Mitigation lives in two places.
  1. **Settings**: `worktree.baseRef: "head"` in `~/.claude/settings.json` (Claude Code v2.1.133+) flips the default so worktrees branch from the parent session's actual `HEAD`. Already set globally in this dotfiles bundle; verify with `grep worktree ~/.claude/settings.json`.
  2. **Agent-side verification (belt + braces — covers the silent-reuse bug [#51596](https://github.com/anthropics/claude-code/issues/51596))**: If you were dispatched into an isolated worktree, your first action — before any code change — is to confirm your base matches the parent's `HEAD`. The dispatch prompt MUST give you the parent repo's absolute path; if it didn't, ask. Then run:
     ```sh
     WT_HEAD=$(git rev-parse HEAD)
     PARENT_HEAD=$(git -C <parent-repo-abs-path> rev-parse HEAD)
     [ "$WT_HEAD" = "$PARENT_HEAD" ] || {
         git fetch <parent-repo-abs-path> HEAD
         git rebase FETCH_HEAD
     }
     ```
     If the rebase has conflicts, stop and report — don't guess. Catching this at minute 0 is cheap; catching it after phase 1 means redoing cascading test failures (e.g. the 2026-05-23 grift session where one of two parallel agents missed an entire `openspec/changes/<name>/` dir that was committed but not pushed).
  3. **Orchestrator-side**: when dispatching agents on a fast-moving branch, prefer to `git push` (or otherwise stabilize) the parent's `HEAD` before dispatch, and always include the parent repo's absolute path in the dispatch prompt.

# Chrome / DevTools MCP

- The `chrome-devtools-mcp` server (and any tool that talks to `127.0.0.1:9222`) attaches to **ungoogled-Chromium** — generic Chromium icon, app name "Chromium" — launched by the `chrome-debug` fish function. Same Blink/V8/CDP as Google Chrome, but with Google sign-in/sync/telemetry stripped out. The visual + process-tree separation from stable Google Chrome is deliberate: the agent-controlled browser is never confused with manually-opened stable-Chrome windows in the Dock or ⌘-Tab.
- Stable Google Chrome (blue icon) is for manual web/Flutter dev. **Never** the MCP target.
- If MCP tools fail to find a real page (e.g. `list_pages` only shows `about:blank`, or the server can't connect), tell the user to run `chrome-debug`. Do not try to launch stable Chrome on `--remote-debugging-port=9222` yourself — that breaks the visual-separation invariant.
