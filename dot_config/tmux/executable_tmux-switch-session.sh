#!/usr/bin/env bash
# Jump to the Nth session by alphabetical order.
#
# Wired to C-S-1..9 in tmux.conf — one keystroke to jump to a known
# slot regardless of which session you're currently attached to.
# `tmux list-sessions` already sorts alphabetically by default, so
# index N maps stably across reconnects (unless a session is created
# or destroyed between presses).
#
# Usage: tmux-switch-session.sh <N>

set -eu

n="${1:-}"
[ -z "$n" ] && { echo "usage: $0 <N>" >&2; exit 2; }

target=$(tmux list-sessions -F '#{session_name}' -f '#{!=:#{m:*-hold,#{session_name}},1}' 2>/dev/null | awk -v n="$n" 'NR==n')
[ -n "$target" ] && tmux switch-client -t "$target"
