#!/usr/bin/env bash
# Claude Code Stop hook — sets @agent-done on the tmux window when the
# main agent finishes its turn (i.e. is awaiting your next prompt).
#
# Cleared on focus, not on time: the tmux pane-focus-in hook (configured
# in tmux.conf) calls clear-agent-done.sh whenever you focus into the
# window, which unsets @agent-done and re-renders the slug — making the
# bell suffix vanish the moment you look at the tab.
#
# Usage: agent-done-hook.sh   (no args; payload from stdin is ignored)
# Registered in ~/.claude/settings.json on Stop with matcher `.*`.

set -uo pipefail

# Drain stdin (Claude Code feeds JSON; we don't need it).
cat >/dev/null 2>&1 || true

[ -z "${TMUX_PANE:-}" ] && exit 0
command -v tmux >/dev/null 2>&1 || exit 0

wid="$(tmux display-message -p -t "$TMUX_PANE" '#{window_id}' 2>/dev/null)" || exit 0

tmux set-option -w -t "$wid" @agent-done "1" >/dev/null 2>&1 || exit 0

# Trigger slugify-title.py so the bell suffix appears in the window name.
name="$(tmux display-message -p -t "$wid" '#W' 2>/dev/null)"
[ -n "$name" ] && tmux rename-window -t "$wid" -- "$name" 2>/dev/null

exit 0
