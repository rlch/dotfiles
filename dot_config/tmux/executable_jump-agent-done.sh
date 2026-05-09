#!/usr/bin/env bash
# Jump to next/prev tmux window flagged with @agent-done (Claude's "awaiting
# reply" badge) or window_bell_flag (TUI hardware bell). Both render as a
# bell glyph in the tab status (see @tab-transient in tmux.conf), so this
# script treats them as one "wants your attention" pool.
#
# Usage: jump-agent-done.sh <next|prev> <session|global>
#   session — only windows in the current session
#   global  — all windows across all sessions (switch-client jumps sessions)
#
# Excludes the current window from candidates: a transient badge can only
# linger on a non-active window (pane-focus-in clears @agent-done on focus,
# and @tab-transient gates window_bell_flag away from the active window),
# so "jump to current" is never the right answer.

set -uo pipefail

direction="${1:-next}"
scope="${2:-session}"

# session_id | window_id | 1 if flagged else 0
fmt='#{session_id}|#{window_id}|#{?#{@agent-done},1,#{?window_bell_flag,1,0}}'

if [ "$scope" = "global" ]; then
  list="$(tmux list-windows -a -F "$fmt" 2>/dev/null)"
else
  list="$(tmux list-windows -F "$fmt" 2>/dev/null)"
fi
[ -z "$list" ] && exit 0

cur_sid="$(tmux display-message -p '#{session_id}' 2>/dev/null)"
cur_wid="$(tmux display-message -p '#{window_id}' 2>/dev/null)"

# Walk the list once. Track the first/last candidate (for wrap), the latest
# candidate seen before the current window (prev target), and the first
# candidate seen after the current window (next target).
target="$(printf '%s\n' "$list" | awk -F'|' \
  -v dir="$direction" -v sid="$cur_sid" -v wid="$cur_wid" '
  BEGIN { seen_cur = 0; first = ""; last = ""; before = ""; after = "" }
  {
    is_cur = ($1 == sid && $2 == wid)
    if (is_cur) { seen_cur = 1; next }
    if ($3 == "1") {
      cand = $1 "|" $2
      if (first == "") first = cand
      last = cand
      if (!seen_cur)              before = cand
      if (seen_cur && after == "") after = cand
    }
  }
  END {
    if (dir == "next") print (after  != "" ? after  : first)
    else               print (before != "" ? before : last)
  }
')"

[ -z "$target" ] && exit 0

session_id="${target%|*}"
window_id="${target#*|}"

if [ "$scope" = "global" ] && [ "$session_id" != "$cur_sid" ]; then
  tmux switch-client -t "$session_id" 2>/dev/null || exit 0
fi
tmux select-window -t "$window_id" 2>/dev/null || true
