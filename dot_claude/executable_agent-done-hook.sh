#!/usr/bin/env bash
# Claude Code Stop hook — sets @agent-done on the tmux window when the
# main agent finishes its turn (i.e. is awaiting your next prompt).
#
# The @agent-done flag drives the transient bell badge in the tab status
# (see @tab-badge in tmux.conf). The hook only touches the option;
# rendering, prefix/suffix layout, and clearing-on-focus all live in
# tmux's format string and the pane-focus-in hook respectively, so this
# script doesn't need to know what the bell glyph is or where it goes.
#
# Cleared on focus, not on time: the tmux pane-focus-in hook calls
# clear-agent-done.sh whenever you focus into the window, which unsets
# @agent-done — making the bell vanish the moment you look at the tab.
#
# Usage: agent-done-hook.sh   (no args; payload from stdin is ignored)
# Registered in ~/.claude/settings.json on Stop with matcher `.*`.

set -uo pipefail

# Drain stdin (Claude Code feeds JSON; we don't need it).
cat >/dev/null 2>&1 || true

[ -z "${TMUX_PANE:-}" ] && exit 0
command -v tmux >/dev/null 2>&1 || exit 0

wid="$(tmux display-message -p -t "$TMUX_PANE" '#{window_id}' 2>/dev/null)" || exit 0

# Skip the bell when the user is already looking at this window. The bell
# exists to nudge focus back; it's pure noise when there's nothing to
# nudge to. pane-focus-in won't fire (no focus change), so the bell would
# otherwise stick until the user leaves and returns.
#
# `window_active` is true when `wid` is the active window of its session;
# `session_attached` is the count of clients attached to that session.
# Both must hold — an active window in a detached session is still
# "unseen" until the client reattaches.
state="$(tmux display-message -p -t "$wid" '#{window_active}/#{session_attached}' 2>/dev/null || true)"
case "$state" in
  1/[1-9]*) exit 0 ;;
esac

tmux set-option -w -t "$wid" @agent-done "1" >/dev/null 2>&1 || exit 0
tmux refresh-client -S 2>/dev/null

exit 0
