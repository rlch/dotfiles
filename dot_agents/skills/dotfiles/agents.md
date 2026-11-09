# Agent instructions and skills

A shared core plus Claude's wrapper.

- Global policy lives in `.chezmoitemplates/agent-instructions/common.md`; `dot_claude/CLAUDE.md.tmpl`
  adds only Claude-specific rules.
- Shared skills point at one source under `~/dev/skills/plugins/rjm/skills`.
- `~/.claude/skills/abyme` links to the plugin abymed writes (`~/.local/state/abyme/claude`); it
  dangles, harmlessly, where abymed has not run.
- A local Claude Code plugin is a `dot_claude/skills/symlink_<name>.tmpl` (as `rjm`), never a
  `--plugin-dir` in `cl`. An MCP server is registered by `claude mcp add -s user` in a
  chezmoiscript (as langfuse's), never in settings.json's `mcpServers`.
- `dot_claude/` holds settings.json and hooks. `pretool.sh` is the one PreToolUse hook: a Bash call
  nothing bans passes at once, the rest go to `guard.py`, which enforces the global bans (rtk
  removed 2026-11-04). Run `guard.py --selftest` after editing either. Every hook command starts
  `[ -n "$ABYME_AGENT" ] ||`: inside abyme, its guard and the bans plugin enforce the bans.
- abyme's config: `dot_config/abyme/init.ts` (parse-check it with `npx -y esbuild` before every
  apply, then check `curl -s http://coding.localhost:4477/api/config` (a profile by name: `knowledge.`, `tutero.`, `bevy.`) for problems and `threw`).
