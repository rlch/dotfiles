#!/usr/bin/env bash
# Clears @agent-done on a tmux window and re-runs slugify-title.py to
# strip the bell suffix from the window name. Idempotent — exits 0 if
# the option isn't set.
#
# Invoked from tmux.conf's pane-focus-in hook with the focused pane's
# window id as the sole argument.
#
# Usage: clear-agent-done.sh <window-id>

set -uo pipefail

wid="${1:-}"
[ -z "$wid" ] && exit 0
command -v tmux >/dev/null 2>&1 || exit 0

done_set="$(tmux show-options -wv -t "$wid" @agent-done 2>/dev/null)"
[ -z "$done_set" ] && exit 0

tmux set-option -wu -t "$wid" @agent-done 2>/dev/null
name="$(tmux display-message -p -t "$wid" '#W' 2>/dev/null)"
[ -n "$name" ] && tmux rename-window -t "$wid" -- "$name" 2>/dev/null

exit 0
