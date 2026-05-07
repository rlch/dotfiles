#!/bin/bash
# Emit the canonical workspace cycle order, filtered to workspaces on
# the currently focused monitor. Used by alt-n / alt-p (and the
# alt-shift-n/p move variants) so cycling stops at the monitor's edge
# instead of crossing into another monitor's workspaces.
#
# Pipeline:
#   1. workspace_order.sh prints the canonical cycle order
#   2. grep -xFf keeps only lines that exact-match the focused-monitor
#      list, preserving the original order
#   3. result is piped via --stdin to `aerospace workspace next/prev`
#      (without --wrap-around → no-op at the edges)
focused=$(aerospace list-workspaces --monitor focused) || exit 1
~/.config/aerospace/workspace_order.sh | grep -xFf <(printf '%s\n' "$focused") || true
