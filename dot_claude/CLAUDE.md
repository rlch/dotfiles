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

# Chrome / DevTools MCP

- The `chrome-devtools-mcp` server (and any tool that talks to `127.0.0.1:9222`) attaches to **ungoogled-Chromium** — generic Chromium icon, app name "Chromium" — launched by the `chrome-debug` fish function. Same Blink/V8/CDP as Google Chrome, but with Google sign-in/sync/telemetry stripped out. The visual + process-tree separation from stable Google Chrome is deliberate: the agent-controlled browser is never confused with manually-opened stable-Chrome windows in the Dock or ⌘-Tab.
- Stable Google Chrome (blue icon) is for manual web/Flutter dev. **Never** the MCP target.
- If MCP tools fail to find a real page (e.g. `list_pages` only shows `about:blank`, or the server can't connect), tell the user to run `chrome-debug`. Do not try to launch stable Chrome on `--remote-debugging-port=9222` yourself — that breaks the visual-separation invariant.
