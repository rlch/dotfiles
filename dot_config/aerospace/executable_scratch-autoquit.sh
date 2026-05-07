#!/usr/bin/env bash
# Auto-park scratch by quitting it whenever focus moves to a non-scratch
# window. Wired into aerospace's on-focus-changed callback so any focus
# shift (alt-l, alt-tab, click, alt-n) parks scratch automatically.
#
# tmux session "scratch" lives on the tmux server independent of the
# Ghostty process, so the next alt-backtick attaches to the same
# session and all running programs (claude, btop, …) are still there.
#
# Grace: scratchpad.sh touches $GRACE_FILE right before `open -na`. The
# launch fires several focus events before macOS settles focus on the
# new scratch window, and we'd kill the just-spawned process otherwise.
# A 1-second mtime window covers the gap.

set -uo pipefail

APP_ID="com.mitchellh.ghostty.scratch"
APP_PATH="$HOME/Applications/Scratch.app"
GRACE_FILE="${XDG_STATE_HOME:-$HOME/.local/state}/scratchpad/grace"
GRACE_SECONDS=1
LOG_FILE="/tmp/scratchpad.log"

focused_bundle=$(aerospace list-windows --focused --format '%{app-bundle-id}' 2>/dev/null || true)
[[ "$focused_bundle" == "$APP_ID" ]] && exit 0

# Match the ghostty binary specifically — `$APP_PATH/Contents/MacOS` alone
# substring-matches every subprocess whose argv inherits a PATH containing
# this directory (npm exec, MCP servers, etc.), since `pgrep -f` looks at
# the full argv. Appending `/ghostty` cuts that off because the inherited
# PATH entry ends at `MacOS:`, never `MacOS/ghostty`.
pid=$(pgrep -f "$APP_PATH/Contents/MacOS/ghostty" 2>/dev/null | head -1)
[[ -z "$pid" ]] && exit 0

if [[ -f "$GRACE_FILE" ]]; then
  mtime=$(stat -f %m "$GRACE_FILE" 2>/dev/null || echo 0)
  if (( $(date +%s) - mtime < GRACE_SECONDS )); then
    exit 0
  fi
fi

printf '[%s] autoquit: kill pid=%s (focused=%s)\n' \
  "$(date +%H:%M:%S)" "$pid" "${focused_bundle:-<none>}" >>"$LOG_FILE"
# Order matters: tear down the dim first so the overlay's fade-out plays
# before scratch's close animation. See scratchpad.sh for the same logic
# in the explicit-toggle path.
pkill -TERM -f scratch-dimmer 2>/dev/null || true
kill -TERM "$pid" 2>/dev/null || true
