#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash): rtk's rewrite, except for git inside an
# isolated agent worktree (*/.claude/worktrees/*).
#
# Claude Code's worktree isolation guard accepts plain `git …` there but
# refuses the rewritten `rtk git …`, so every isolated fix agent lost
# `git add`/`commit`/`status` and worked around it by hand (three agents on
# 2026-09-29). Passing git through unchanged in a worktree costs only rtk's
# output compression for those few commands.

input=$(cat)
case "$input" in
*/.claude/worktrees/*)
  cmd=$(printf '%s' "$input" | python3 -c 'import json,sys; print((json.load(sys.stdin).get("tool_input") or {}).get("command",""))' 2>/dev/null)
  case "$cmd" in
  git\ * | git) exit 0 ;;
  esac
  ;;
esac
printf '%s' "$input" | exec rtk hook claude
