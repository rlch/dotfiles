#!/usr/bin/env bash
# Server-wide AI fleet aggregate. Each Claude *pane* contributes exactly
# one count to one bucket (bell > timer > idle).
#
#   󰂚 bell  — Claude pane in a window with bell signal
#             (window_bell_flag OR @agent-done):
#             "something happened, look here"
#   󰔟 timer — Claude pane waiting for your input (no ✳ in title):
#             "agent paused, your input needed"
#   󰒲 idle  — Claude pane currently processing (✳ in title):
#             "agent open, nothing pending right now"
#
# Per-pane (not per-window): three Claude panes idle in one window
# count as idle=3. `tmux list-panes -a` walks every pane on every
# session on this server, so the count is genuinely socket-wide.
#
# All inputs come from existing tmux state (`window_bell_flag`,
# `@agent-done`, `pane_current_command`, `pane_title`) — no Claude
# Code hooks required. Non-Claude panes are ignored entirely;
# the fleet is AI-conversation-only.
#
# Output is width-stable: space-superscript for zero, "⁺" for ≥10.

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

# Per-pane fields, tab-separated:
#   1 pane_id              (skip empty)
#   2 pane_current_command (filter: must equal "claude")
#   3 ✳-title flag         (1 if pane_title matches "✳*", else 0 → "waiting")
#   4 window_bell_flag     (window-level — same for sibling panes)
#   5 @agent-done          (window-level — set by agent-done-hook.sh)
fmt=$'#{pane_id}\t#{pane_current_command}\t#{?#{m:✳*,#{pane_title}},1,0}\t#{window_bell_flag}\t#{?@agent-done,1,0}'

while IFS=$'\t' read -r pid cmd has_star bell_flag agent_done; do
    [ -z "$pid" ] && continue
    [ "$cmd" = "claude" ] || continue
    if [ "$bell_flag" = "1" ] || [ "$agent_done" = "1" ]; then
        bell=$((bell + 1))
    elif [ "$has_star" = "1" ]; then
        idle=$((idle + 1))
    else
        timer=$((timer + 1))
    fi
done < <(tmux list-panes -aF "$fmt" 2>/dev/null)

# Order: idle (least urgent, leftmost) → timer → bell (most urgent, rightmost).
# "Bell on right, idle on left" — your eye lands on the highest-priority signal
# closest to the right edge of the bar.
#
# Each glyph is colored individually:
#   count > 0 → ACTIVE color (catppuccin green)
#   count = 0 → INACTIVE color (overlay grey, low contrast)
ACTIVE='#A6E3A1'
INACTIVE='#6C7086'

color() { [ "$1" -gt 0 ] && printf '%s' "$ACTIVE" || printf '%s' "$INACTIVE"; }

# Trailing-space rstrip on the bell slot: when bell=0, fmt_sup returns
# a literal space to keep the inter-glyph slot width-stable. That space
# would compound with the format-string's own trailing space before the
# next separator, doubling the gap. Strip exactly one trailing space if
# it remains so bell=0 and bell≥1 render the same gap before " │ ".
out=$(printf '#[fg=%s]󰒲%s #[fg=%s]󰔟%s #[fg=%s]󰂚%s' \
    "$(color $idle)"  "$(fmt_sup $idle)" \
    "$(color $timer)" "$(fmt_sup $timer)" \
    "$(color $bell)"  "$(fmt_sup $bell)")
printf '%s' "${out% }"
