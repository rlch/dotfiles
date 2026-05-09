#!/usr/bin/env bash
# Claude Code UserPromptSubmit hook — sets @agent-working on the tmux
# window when the user kicks off a turn. The hourglass badge in the tab
# status (see @tab-working in tmux.conf) renders until Claude finishes,
# at which point agent-done-hook.sh unsets the flag.
#
# Unlike @agent-done, this badge renders on the active window too — the
# user wants to know Claude is busy in the tab they're looking at, not
# only in tabs they've left. So no focus check here; just set the flag.
#
# Usage: agent-working-hook.sh   (no args; payload from stdin is ignored)
# Registered in ~/.claude/settings.json on UserPromptSubmit.

set -uo pipefail

cat >/dev/null 2>&1 || true

[ -z "${TMUX_PANE:-}" ] && exit 0
command -v tmux >/dev/null 2>&1 || exit 0

wid="$(tmux display-message -p -t "$TMUX_PANE" '#{window_id}' 2>/dev/null)" || exit 0

tmux set-option -w -t "$wid" @agent-working "1" >/dev/null 2>&1 || exit 0
tmux refresh-client -S 2>/dev/null

exit 0
