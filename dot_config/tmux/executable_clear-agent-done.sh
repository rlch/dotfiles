#!/usr/bin/env bash
# Clears the @agent-done transient badge on a tmux window.
#
# The badge is a tab status icon rendered by window-status-format via
# @tab-badge in tmux.conf. Toggling the option is enough — the format
# re-evaluates within status-interval. We `refresh-client -S` for an
# instant redraw.
#
# Invoked from tmux.conf's pane-focus-in hook with the focused pane's
# window id as the sole argument. Idempotent — exits 0 if the option
# isn't set.
#
# Usage: clear-agent-done.sh <window-id>

set -uo pipefail

wid="${1:-}"
[ -z "$wid" ] && exit 0
command -v tmux >/dev/null 2>&1 || exit 0

done_set="$(tmux show-options -wv -t "$wid" @agent-done 2>/dev/null)"
[ -z "$done_set" ] && exit 0

tmux set-option -wu -t "$wid" @agent-done 2>/dev/null
tmux refresh-client -S 2>/dev/null

exit 0
