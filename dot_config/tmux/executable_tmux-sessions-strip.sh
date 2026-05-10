#!/usr/bin/env bash
# Emit a styled all-sessions strip for tmux status-left.
#
# Usage:
#   tmux-sessions-strip.sh [<attached-session>]
#
# Pass `#{q:client_session}` from tmux to mark the attached session
# bright/bold; everything else renders dim. Each session's bell-sum
# superscript (from tmux-bells.sh) is appended.
#
# Why a single shell call (instead of tmux-native `#{S:…}`): tmux
# caches `#()` results keyed on the *pre-substitution* command
# string. A `#(tmux-bells.sh session #{q:session_name})` inside
# `#{S:…}` reuses one cache slot for every iteration — every session
# ends up showing the last-iterated session's count. One outer
# `#()` post-substitutes once and emits the whole strip in a
# single string, sidestepping the quirk.
#
# Costs: one `tmux list-sessions` (sub-ms IPC) + one `cat` per
# session (~10µs). Cheap enough to run every status-interval.

set -eu

ATTACHED="${1:-}"
ACTIVE_STYLE="${TMUX_SESSION_ACTIVE_STYLE:-fg=#89B4FA,bold}"
INACTIVE_STYLE="${TMUX_SESSION_INACTIVE_STYLE:-fg=#6C7086}"
SEPARATOR="${TMUX_SESSION_SEPARATOR:-  }"

bells="$(dirname "$0")/tmux-bells.sh"

out=""
while IFS= read -r s; do
    [ -n "$s" ] || continue
    sup=$("$bells" session "$s" 2>/dev/null || true)
    # `range=user|session:<name>` makes the segment clickable; the
    # MouseDown1Status binding in tmux.conf parses `mouse_status_range`
    # to dispatch `switch-client -t <name>` (no native handler — sessions
    # don't have one like `range=window|N` does).
    if [ "$s" = "$ATTACHED" ]; then
        seg="#[range=user|session:${s},$ACTIVE_STYLE]${s}${sup}#[norange,default]"
    else
        seg="#[range=user|session:${s},$INACTIVE_STYLE]${s}${sup}#[norange,default]"
    fi
    if [ -n "$out" ]; then
        out="${out}${SEPARATOR}${seg}"
    else
        out="$seg"
    fi
done < <(tmux list-sessions -F '#{session_name}' 2>/dev/null)
printf '%s' "$out"
