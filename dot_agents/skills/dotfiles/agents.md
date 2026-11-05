# Agent instructions and skills

Shared cores plus native client adapters.

- Global policy lives in `.chezmoitemplates/agent-instructions/common.md`; `dot_claude/CLAUDE.md.tmpl`
  and `dot_config/opencode/AGENTS.md.tmpl` add only client-specific rules. Put a rule in the shared
  core unless it depends on one client.
- OpenCode consumes only `~/.config/opencode/skills`; fish disables its `.claude` and `.agents`
  compatibility scans to prevent duplicate skill names selecting the wrong implementation. Shared
  skills point at one source under `~/dev/skills/plugins/rjm/skills`. `opencode.json` is
  installer-owned and not managed by chezmoi.
- `~/.claude/skills/abyme` links to the plugin abymed writes (`~/.local/state/abyme/claude`); it
  dangles, harmlessly, where abymed has not run.
- A local Claude Code plugin is a `dot_claude/skills/symlink_<name>.tmpl` (as `rjm`), never a
  `--plugin-dir` in `cl`. An MCP server is registered by `claude mcp add -s user` in a
  chezmoiscript (as langfuse's), never in settings.json's `mcpServers`.
- `dot_claude/` holds settings.json and hooks. `pretool.sh` is the one PreToolUse hook: a Bash call
  nothing bans passes at once, the rest go to `guard.py`, which enforces the global bans (rtk
  removed 2026-11-04). Run `guard.py --selftest` after editing either. herdr's state hook is wired
  on SessionStart alone, the only event it acts on; a herdr update that re-adds it everywhere shows
  as settings.json drift: drop it.
- abyme's config: `dot_config/abyme/init.ts` (parse-check it with `npx -y esbuild` before every
  apply, then check `curl -s localhost:4477/api/config` for problems and `threw`).
