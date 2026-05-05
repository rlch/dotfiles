#!/usr/bin/env bash
# Toggle a scratchpad window from the cloned Scratch.app bundle.
# - Window absent  → spawn fresh, centered, zellij-attached
# - Window focused → send off-screen (parking position)
# - Otherwise      → bring to current workspace, re-center, focus
#
# Aerospace handles workspace + focus. Position is set via AXPosition through
# System Events — same accessibility primitive aerospace uses internally for
# its `move` action, so this is just running on the same path with absolute
# coordinates instead of directional steps.
#
# Window-id and pid are cached in a state file because aerospace's
# `list-windows` excludes minimized windows; not strictly needed for the
# off-screen approach but keeps the script resilient if minimize ever returns.
#
# Usage: scratchpad.sh [name]   (default: "scratch")
set -uo pipefail

NAME="${1:-scratch}"
APP_ID="com.mitchellh.ghostty.scratch"
APP_PATH="$HOME/Applications/Scratch.app"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/scratchpad"
STATE_FILE="$STATE_DIR/$NAME"

COLS=113
ROWS=32
WIN_W_PX=880
WIN_H_PX=520
PARK_X=-30000
PARK_Y=-30000

mkdir -p "$STATE_DIR"

screen_size() {
  osascript -e 'tell application "Finder" to get bounds of window of desktop' \
    | awk -F', ' '{print $3 " " $4}'
}

set_position() {
  local pid="$1" x="$2" y="$3"
  osascript -e "tell application \"System Events\" to set position of window 1 of (first process whose unix id is $pid) to {$x, $y}" 2>/dev/null || true
}

read_state() {
  if [[ -f "$STATE_FILE" ]]; then
    read -r CACHED_PID CACHED_WIN_ID <"$STATE_FILE" || true
    if [[ -n "${CACHED_PID:-}" ]] && kill -0 "$CACHED_PID" 2>/dev/null; then
      return 0
    fi
  fi
  CACHED_PID=""
  CACHED_WIN_ID=""
  return 1
}

LOG="/tmp/scratchpad.log"
log() { echo "[$(date '+%H:%M:%S')] $*" >>"$LOG"; }

if read_state; then
  focused_id=$(aerospace list-windows --focused --format '%{window-id}' 2>/dev/null || echo "")
  log "toggle pid=$CACHED_PID win=$CACHED_WIN_ID focused=$focused_id"
  if [[ "$focused_id" == "$CACHED_WIN_ID" ]]; then
    log "  → park at ($PARK_X, $PARK_Y)"
    set_position "$CACHED_PID" "$PARK_X" "$PARK_Y"
  else
    current_ws=$(aerospace list-workspaces --focused)
    log "  current_ws=$current_ws"
    aerospace move-node-to-workspace --window-id "$CACHED_WIN_ID" "$current_ws" 2>/dev/null || true
    aerospace focus --window-id "$CACHED_WIN_ID"
    read -r screen_w screen_h < <(screen_size)
    pos_x=$(( (screen_w - WIN_W_PX) / 2 ))
    pos_y=$(( (screen_h - WIN_H_PX) / 2 ))
    log "  screen=${screen_w}x${screen_h} → recenter at ($pos_x, $pos_y)"
    set_position "$CACHED_PID" "$pos_x" "$pos_y"
  fi
  exit 0
fi

# No live scratchpad — spawn fresh.
rm -f "$STATE_FILE"
read -r screen_w screen_h < <(screen_size)
pos_x=$(( (screen_w - WIN_W_PX) / 2 ))
pos_y=$(( (screen_h - WIN_H_PX) / 2 ))

open -na "$APP_PATH" --args \
  --title=" " \
  --window-save-state=never \
  --macos-titlebar-style=transparent \
  --window-width="$COLS" \
  --window-height="$ROWS" \
  --window-position-x="$pos_x" \
  --window-position-y="$pos_y" \
  -e zellij attach -c "$NAME"

for _ in $(seq 1 50); do
  read -r WIN_ID PID < <(
    aerospace list-windows --monitor all --app-bundle-id "$APP_ID" \
      --format '%{window-id} %{app-pid}' \
      | head -n1
  )
  if [[ -n "${WIN_ID:-}" ]]; then
    echo "$PID $WIN_ID" >"$STATE_FILE"
    exit 0
  fi
  sleep 0.1
done

echo "scratchpad: spawned but window never appeared in aerospace" >&2
exit 1
