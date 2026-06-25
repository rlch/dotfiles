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
- **Pushing**: every `git push` needs my explicit per-instance approval — never auto-push, never treat an earlier approval as standing (enforced by a `permissions.ask` rule + the `~/.claude/git-push-guard.sh` PreToolUse hook). **Never push from a Claude worktree** (any tree under `.claude/worktrees/`): worktree work lands via the parent checkout's `main`. A worktree push is how `origin/main` silently diverged 50-vs-15 commits from local `main` (2026-06-12, drift) — the guard hook hard-denies it.
- **No `git stash` on `main`**: I work on `main` concurrently with you in another editor / window, so `git stash` (even with `-- <pathspec>`) silently captures whatever else I happened to be editing at that moment. When you need to set aside agent scope-creep or unauthorized changes, prefer one of these instead:
  - `git checkout -- <specific paths>` to revert only the files outside the agent's brief. Discards the bad changes without touching anything else in the working tree. Use this by default.
  - Commit to a side branch (`git switch -c agent-overreach/<topic>; git add <paths>; git commit; git switch main`) when the agent work is worth keeping for review.
  - For parallel agents: keep using `isolation: "worktree"` so each agent's working tree is structurally separate from mine.
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
- **Worktree path-resolution leak (the dangerous one — agents silently edit the *parent* checkout):** Claude Code resolves a repo's root via `git rev-parse --git-common-dir`, which for a *linked worktree* points at the **main** repo's `.git`. So the **Edit / Read / Write tools reroot relative and project-rooted paths to the main checkout** even when Bash's `pwd` is correctly the worktree — a worktree agent's edits land in the parent tree, and a follow-up `git add`/`commit` can even land on parent `main`. Open upstream as of CC 2.1.153: [#36182](https://github.com/anthropics/claude-code/issues/36182), [#29083](https://github.com/anthropics/claude-code/issues/29083), [#31546](https://github.com/anthropics/claude-code/issues/31546), [#57847](https://github.com/anthropics/claude-code/issues/57847) (+ cwd-drift siblings [#42282](https://github.com/anthropics/claude-code/issues/42282), [#28017](https://github.com/anthropics/claude-code/issues/28017)). It bit *both* agents in the 2026-06-09 perspective-camera dispatch — they self-recovered, but one had already committed to parent `main` before noticing. There is **no settings fix and a hook can't reliably catch it** (the same `--git-common-dir` mis-resolution that causes the bug also defeats a hook's attempt to tell worktree from main); mitigate procedurally:
  1. **Agent-side — absolute worktree paths (the actual workaround):** your *first* action is `WT="$(git rev-parse --show-toplevel)"`; confirm `$WT` contains `/.claude/worktrees/` (you're really in the worktree) and is **not** the parent path the dispatch named — if it equals the parent, isolation silently failed ([#39886](https://github.com/anthropics/claude-code/issues/39886)): STOP and report. Then pass an **absolute path under `$WT`** to *every* `Read`/`Edit`/`Write` — never a bare relative path, never a `<parent-repo>/…` absolute path. Relative / project-rooted paths get rerouted to the parent; explicit `$WT/…` paths are honored. Run git/cargo via `git -C "$WT"` / `cd "$WT"`, and before committing confirm every staged path is under `$WT`.
  2. **Agent-side — prove you didn't leak before finishing:** `git -C <parent-repo-abs-path> status --porcelain <your files>` is empty and `git -C <parent-repo-abs-path> log --oneline -1` is unchanged; your commit sits on the worktree branch.
  3. **Orchestrator-side (mandatory — never skip before trusting or merging):** an agent reporting "done" does *not* mean its edits are in the worktree. After every isolated dispatch, verify: the result carries a `worktreePath`; parent `HEAD` is unchanged and `git -C <parent> reflog` shows no stray agent commit; the parent working tree has no stray edits to the agent's files; the work is actually on the worktree branch (`git diff --stat <base> <branch>`). Only then `git merge --ff-only` / cherry-pick onto main, and build the *combined* branches in a clean worktree (not the parent tree, whose own WIP can mask or fake failures).
- **Net for parallel worktrees:** treat `isolation: "worktree"` *edit*-agents as unreliable until the above issues close — dispatch only with the absolute-path discipline and **always** post-verify. For small or tightly-coupled work (e.g. several capabilities that all rewrite one hot file), prefer sequential edits in the main tree: split parallel agents by *disjoint file ownership*, not by logical capability, or the merge/verify overhead outweighs the parallelism.

# Chrome / DevTools MCP

- The `chrome-devtools-mcp` server (and any tool that talks to `127.0.0.1:9222`) attaches to **ungoogled-Chromium** — generic Chromium icon, app name "Chromium" — launched by the `chrome-debug` fish function. Same Blink/V8/CDP as Google Chrome, but with Google sign-in/sync/telemetry stripped out. The visual + process-tree separation from stable Google Chrome is deliberate: the agent-controlled browser is never confused with manually-opened stable-Chrome windows in the Dock or ⌘-Tab.
- Stable Google Chrome (blue icon) is for manual web/Flutter dev. **Never** the MCP target.
- If MCP tools fail to find a real page (e.g. `list_pages` only shows `about:blank`, or the server can't connect), tell the user to run `chrome-debug`. Do not try to launch stable Chrome on `--remote-debugging-port=9222` yourself — that breaks the visual-separation invariant.
