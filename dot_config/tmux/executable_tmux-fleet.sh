#!/usr/bin/env bash
# Server-wide aggregates of per-window state, rendered in the bottom
# status row. Three categories with priority bell > timer > idle:
#
#   󰂚 — windows with the bell signal (window_bell_flag OR @agent-done):
#       "something happened, look here"
#   󰔟 — windows where @tab-working fires (Claude waiting on you mid-turn):
#       "agent paused, your input needed"
#   󰒲 — Claude windows with neither (Claude pane present but quiet):
#       "agent open, nothing pending right now"
#
# Each window falls into exactly one category by the highest signal
# it has; non-Claude windows without bells are ignored. Output is
# width-stable: space-superscript for zero, "⁺" for ≥10.
#
# All inputs come from existing tmux state (`window_bell_flag`,
# `@agent-done`, `@tab-working`, `pane_current_command`) — no Claude
# Code hooks or external state files needed. One `tmux list-windows`
# call per status redraw; format substitutions evaluate per-window
# server-side via `#{P:…}` for the Claude-presence check.

set -eu

fmt_sup() {
    case "$1" in
        0) printf ' '  ;;
        1) printf '¹' ;;
        2) printf '²' ;;
        3) printf '³' ;;
        4) printf '⁴' ;;
        5) printf '⁵' ;;
        6) printf '⁶' ;;
        7) printf '⁷' ;;
        8) printf '⁸' ;;
        9) printf '⁹' ;;
        *) printf '⁺' ;;
    esac
}

bell=0
timer=0
idle=0

# Tab-separated columns:
#   1 window_id       (skip empty rows)
#   2 window_bell_flag (0|1)
#   3 @agent-done     (0|1)         set by ~/.claude/agent-done-hook.sh
#   4 @tab-working    (0|1)         non-empty if any pane has Claude waiting
#   5 has_claude      (0|1)         any pane in window with command=claude
fmt=$'#{window_id}\t#{window_bell_flag}\t#{?@agent-done,1,0}\t#{?#{E:@tab-working},1,0}\t#{?#{P:#{?#{==:#{pane_current_command},claude},X,}},1,0}'

while IFS=$'\t' read -r wid bell_flag agent_done waiting has_claude; do
    [ -z "$wid" ] && continue
    if [ "$bell_flag" = "1" ] || [ "$agent_done" = "1" ]; then
        bell=$((bell + 1))
    elif [ "$waiting" = "1" ]; then
        timer=$((timer + 1))
    elif [ "$has_claude" = "1" ]; then
        idle=$((idle + 1))
    fi
done < <(tmux list-windows -aF "$fmt" 2>/dev/null)

# Order: idle (least urgent, leftmost) → timer → bell (most urgent, rightmost).
# "Bell on right, idle on left" — your eye lands on the highest-priority signal
# closest to the right edge of the bar.
#
# Trailing-space rstrip on the bell slot: when bell=0, fmt_sup returns
# a literal space to keep the inter-glyph slot width-stable. That space
# would compound with the format-string's own space before the next
# separator, doubling the gap. Strip exactly one trailing space if it
# remains so bell=0 and bell≥1 render the same gap before " │ ".
out=$(printf '󰒲%s 󰔟%s 󰂚%s' "$(fmt_sup $idle)" "$(fmt_sup $timer)" "$(fmt_sup $bell)")
printf '%s' "${out% }"
