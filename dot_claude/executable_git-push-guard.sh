#!/usr/bin/env bash
# PreToolUse guard (matcher: Bash) for every `git push` Claude issues:
#
#   1. DENY pushes whose repo is a Claude worktree (*/.claude/worktrees/*).
#      Worktree sessions must land work via the parent checkout — a worktree
#      push moved origin/main past local main on 2026-06-12 and the two lines
#      silently diverged (50 vs 15 commits, duplicate WORLDGEN bumps).
#   2. ASK for every other push: defaultMode=auto would otherwise run plain
#      `git push` with no prompt (the deny list only covers force-pushes to
#      main/master). Every push needs an explicit per-instance approval.
#
# Exits silently (no opinion) for every non-push command, with a cheap bash
# prefilter so the python JSON parse only runs when "push" appears at all.

set -euo pipefail

input=$(cat)
case "$input" in
*push*) ;;
*) exit 0 ;;
esac

printf '%s' "$input" | python3 -c "
import json, re, subprocess, sys

data = json.load(sys.stdin)
cmd = (data.get('tool_input') or {}).get('command', '')
cwd = data.get('cwd') or '.'

# A push is a git invocation with a push subcommand in the same command
# segment (pipes/&&/; start a new segment). Matches rtk-rewritten forms too.
# \s+ before push so hyphenated tokens (this script's own filename,
# git-push-guard.sh) don't false-positive.
if not re.search(r'\bgit\b[^|;&]*\s+push\b', cmd):
    sys.exit(0)

def decide(decision, reason):
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse',
        'permissionDecision': decision,
        'permissionDecisionReason': reason}}))
    sys.exit(0)

# Repo the push runs in: an explicit \`git -C <path>\` overrides the session cwd.
m = re.search(r'\bgit\b\s+-C\s+(\"[^\"]+\"|\x27[^\x27]+\x27|\S+)', cmd)
repo = m.group(1).strip('\"\x27') if m else cwd
try:
    top = subprocess.run(['git', '-C', repo, 'rev-parse', '--show-toplevel'],
                         capture_output=True, text=True, timeout=5).stdout.strip()
except Exception:
    top = repo

if '/.claude/worktrees/' in top or '/.claude/worktrees/' in cmd:
    decide('deny',
           'git push from a Claude worktree is forbidden - land via the parent '
           'checkout (repo: ' + (top or repo) + '). See CLAUDE.md, Git workflow.')

decide('ask', 'git push always requires explicit user approval.')
"
