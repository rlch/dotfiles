#!/bin/bash
# The one PreToolUse hook (2026-11-04). Every Bash call spawned guard.py,
# rtk's hook and a multiplexer's state hook in parallel, ~11 processes and ~1.5 s of wall
# under load (waste-hunt); python's start alone is 1-1.6 s at load 200-400.
#
# A Bash call that cannot trip guard.py passes at once, with no python. Anything
# else (a word guard.py bans, a broad path, a non-Bash tool, input not shaped as
# expected) goes to guard.py, which refuses or passes. rtk's rewrite was dropped
# (2026-11-04): a spawn per call, a 1 GB history every agent wrote to, and
# trimmed output. The filter is a superset of
# guard.py's checks: keep the two in step (guard.py --selftest checks every
# blocked case routes to it; PRETOOL_ROUTE=1 prints the route instead).
#
# /bin/bash 3.2 on purpose: its start is a fifth of Homebrew bash's under load.

IFS= read -r -d '' input
risky='stash|verify|push|commit|kill|playwright'
broad='(^|[[:space:]"'\''=\\])(/|/\*|~|\$HOME|\$\{HOME\}|/Users|'"$HOME"'|/Volumes|/System|/Library|/private|/private/var|/private/tmp/\.\.|~/Library|\$HOME/Library|'"$HOME"'/Library)/?([[:space:]"'\'';|&)\\]|$)'
if [[ $input =~ \"tool_name\":[[:space:]]*\"Bash\" ]] && ! [[ $input =~ $risky ]] && ! [[ $input =~ $broad ]]; then
  [ -n "$PRETOOL_ROUTE" ] && { echo pass; exit 0; }
  exit 0
fi
# Grep and Glob: guard.py refuses only a broad path (the hook's matcher left them
# out until 2026-11-04, so that ban never fired).
if [[ $input =~ \"tool_name\":[[:space:]]*\"(Grep|Glob)\" ]] && ! [[ $input =~ $broad ]]; then
  [ -n "$PRETOOL_ROUTE" ] && { echo pass; exit 0; }
  exit 0
fi
[ -n "$PRETOOL_ROUTE" ] && { echo guard; exit 0; }
exec "$HOME/.claude/guard.py" <<<"$input"
