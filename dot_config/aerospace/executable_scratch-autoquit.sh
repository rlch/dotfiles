#!/usr/bin/env bash
# Auto-park scratch by quitting it whenever focus moves to a non-scratch
# window ON THE SAME MONITOR as scratch. Wired into aerospace's
# on-focus-changed callback so any same-monitor focus shift (click,
# alt-l, alt-tab) parks scratch automatically.
#
# Cross-monitor focus moves (alt-1/2/3, multi-monitor mouse warp, etc.)
# are NOT auto-quits — scratch stays alive on its current monitor while
# the user works elsewhere. To dismiss/move scratch from another
# monitor, press globe again: scratchpad.sh detects the cross-monitor
# toggle and closes-and-reopens on the new monitor.
#
# This rule eliminates the cross-monitor focus flicker we previously
# papered over with a pre-kill app-activate + post-kill focus-monitor
# dance: kills only happen on the same monitor the user is on, so
# macOS's NSWorkspace activation reshuffle can't yank focus across
# displays.
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

# === Cross-monitor: leave scratch alive ===
# If the user just moved focus to a window on a DIFFERENT monitor than
# scratch's, do nothing. They're working elsewhere; scratch stays on its
# monitor (with the dim overlay still painted, so it's obvious which
# display the scratchpad is on). They can dismiss it by re-pressing
# globe on scratch's monitor, or move it by pressing globe on another
# monitor (handled in scratchpad.sh).
#
# Pulling both monitors from aerospace's tree (rather than mixing
# aerospace + AX/CG) keeps the comparison consistent: both are
# aerospace's own monitor-id values, so we don't have to worry about
# NSScreen vs CGDisplayBounds vs aerospace ordering disagreements.
SCRATCH_MONITOR=$(aerospace list-windows --all --format '%{app-bundle-id} %{monitor-id}' 2>/dev/null \
                  | awk -v id="$APP_ID" '$1==id {print $2; exit}' \
                  || true)
FOCUSED_MONITOR=$(aerospace list-monitors --focused --format '%{monitor-id}' 2>/dev/null || true)
if [[ -n "$SCRATCH_MONITOR" && -n "$FOCUSED_MONITOR" \
   && "$SCRATCH_MONITOR" != "$FOCUSED_MONITOR" ]]; then
  printf '[%s] autoquit: SKIP (scratch on monitor=%s, focused on monitor=%s, focused-bundle=%s)\n' \
    "$(date +%H:%M:%S)" "$SCRATCH_MONITOR" "$FOCUSED_MONITOR" "${focused_bundle:-<none>}" \
    >>"$LOG_FILE"
  exit 0
fi

printf '[%s] autoquit: kill pid=%s (focused=%s, monitor=%s)\n' \
  "$(date +%H:%M:%S)" "$pid" "${focused_bundle:-<none>}" "${FOCUSED_MONITOR:-?}" >>"$LOG_FILE"

# Strict ordering: dim down FIRST and wait for it to exit, then scratch.
# Dispatching both kills at the same time leaves a small window where
# scratch's close animation can start before the overlay finishes
# tearing down. Same invariant as scratchpad.sh's explicit-toggle path.
pkill -TERM -xf "$HOME/.local/bin/scratch-dimmer" 2>/dev/null || true
for _ in 1 2 3 4 5 6 7 8 9 10; do  # max ~200ms
  pgrep -f "$HOME/.local/bin/scratch-dimmer" >/dev/null 2>&1 || break
  sleep 0.02
done

# SIGKILL (not SIGTERM) for instant death — same reasoning as
# scratchpad.sh's same-monitor toggle: SIGTERM gives ghostty 50–100ms
# of async cleanup, during which a user alt-N keypress can race with
# scratch's dying NSWorkspaceDidTerminate reshuffle and the reshuffle
# wins, snapping focus back to scratch's old monitor (visible flicker
# via aerospace's move-mouse window-lazy-center). Tmux's "scratch"
# session lives on the tmux server, so we lose nothing by skipping
# ghostty's graceful shutdown.
kill -KILL "$pid" 2>/dev/null || true
