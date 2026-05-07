#!/usr/bin/env bash
# Toggle the scratchpad. With autoquit-on-unfocus, scratch is only ever
# alive while you're looking at it — so "alive ⇒ kill" is the toggle:
#
#   - process running     → kill it (re-press while focused = close)
#   - process not running → spawn it
#
# Size + position are computed BEFORE ghostty launches: `scratch-axpos
# cells-for SCRATCH_W_PCT SCRATCH_H_PCT <focused-screen-idx>` returns
# `<cells_w> <cells_h> <pos_x> <pos_y>` already quantised to the cell
# grid for the configured font, and we feed those into ghostty's
# --window-width / --window-height / --window-position-x / -y CLI
# overrides. That makes the very first painted frame land on the
# focused monitor at the right size — no axpos catch-up, no jump.
# scratch.conf still carries 155×52 / (317,118) as a fallback for when
# the helper isn't available (e.g. fresh checkout, swiftc missing).
#
# tmux attach is handled by `command = …attach.sh` inside scratch.conf,
# coupled with `shell-integration = none` so ghostty doesn't wrap us in
# a login zsh (which would flash MOTD before tmuxinator takes over).
#
# Grace file: `open -na` is async and on-focus-changed often fires
# before macOS hands focus to the new scratch window, so without a
# guard the autoquit handler kills scratch the moment it spawns.
# Touching the grace sentinel right before launch tells autoquit to
# skip kills for ~1s while focus settles.
set -euo pipefail

APP_PATH="$HOME/Applications/Scratch.app"
SCRATCH_CONF="${XDG_CONFIG_HOME:-$HOME/.config}/ghostty/scratch.conf"
ATTACH="${XDG_CONFIG_HOME:-$HOME/.config}/scratchpad/attach.sh"
GRACE_FILE="${XDG_STATE_HOME:-$HOME/.local/state}/scratchpad/grace"
DIMMER_BIN="$HOME/.local/bin/scratch-dimmer"
AXPOS_BIN="$HOME/.local/bin/scratch-axpos"

# Size as fraction of the focused monitor's visibleFrame. Tuned against
# the user's previous fixed laptop config (155×52 cells of JetBrainsMono
# 15pt centred on a 2056×1290 visible frame ≈ 68% × 87%). Tweak via env
# vars rather than editing this file.
SCRATCH_W_PCT="${SCRATCH_W_PCT:-0.68}"
SCRATCH_H_PCT="${SCRATCH_H_PCT:-0.85}"

# Match the ghostty binary specifically — `$APP_PATH/Contents/MacOS` alone
# substring-matches every subprocess whose argv inherits a PATH containing
# this directory (npm exec, MCP servers, etc.), since `pgrep -f` looks at
# the full argv. Appending `/ghostty` cuts that off because the inherited
# PATH entry ends at `MacOS:`, never `MacOS/ghostty`.
pid=$(pgrep -f "$APP_PATH/Contents/MacOS/ghostty" 2>/dev/null | head -1 || true)
if [[ -n "$pid" ]]; then
  # Order matters: tear down the dim FIRST so the user sees the overlay
  # disappear (with its fade-out) before scratch's own close animation
  # plays. If we killed scratch first, kill(pid,0) polling would notice
  # ~250 ms later and the dim would linger over a half-closed scratch.
  pkill -TERM -f scratch-dimmer 2>/dev/null || true
  kill -TERM "$pid" 2>/dev/null || true
  exit 0
fi

mkdir -p "$(dirname "$GRACE_FILE")"
touch "$GRACE_FILE"

# Discover the focused monitor's NSScreen index (1-based, matches what
# scratch-axpos and scratch-dimmer expect). Aerospace's
# monitor-appkit-nsscreen-screens-id is exactly this. Fall back to 1
# (primary) if aerospace is unreachable so the toggle still works.
SCREEN_IDX="$(aerospace list-monitors --focused --format '%{monitor-appkit-nsscreen-screens-id}' 2>/dev/null || true)"
SCREEN_IDX="${SCREEN_IDX:-1}"

# Precompute target cell counts + top-left position (in CG/AX coords) so
# ghostty spawns at the correct size on the focused monitor from the
# very first frame. No post-spawn resize, no flash, no jump — the
# computed values go straight into ghostty's --window-* CLI overrides
# below. Falls back to scratch.conf's hardcoded laptop layout if the
# helper is missing or fails (e.g. binary not built yet).
CLI_GEOMETRY=()
if [[ -x "$AXPOS_BIN" ]]; then
  if read -r CW CH PX PY < <("$AXPOS_BIN" cells-for "$SCRATCH_W_PCT" "$SCRATCH_H_PCT" "$SCREEN_IDX" 2>/dev/null) \
     && [[ -n "${CW:-}" && -n "${CH:-}" && -n "${PX:-}" && -n "${PY:-}" ]]; then
    CLI_GEOMETRY=(
      "--window-width=$CW"
      "--window-height=$CH"
      "--window-position-x=$PX"
      "--window-position-y=$PY"
    )
  fi
fi

# Spotlight effect: spawn the dimmer overlay just before scratch. The
# binary self-monitors Scratch.app's pid via kill(pid, 0) and exits when
# scratch dies — handles both the explicit toggle-off and the
# autoquit-on-unfocus path with no shell-side bookkeeping.
# SCRATCH_DIMMER_SCREEN_IDX scopes the overlay to the focused monitor so
# reference material on the other displays stays at full brightness.
if [[ -x "$DIMMER_BIN" ]]; then
  # Sweep any orphan dimmer instance before spawning a fresh one so
  # opacity doesn't stack and old monitor loops don't linger.
  pkill -f scratch-dimmer 2>/dev/null || true
  # Diagnostic log so we can see what windows the dimmer enumerated and
  # filtered. Truncated each launch.
  : >/tmp/scratch-dimmer.log
  SCRATCH_DIMMER_SCREEN_IDX="$SCREEN_IDX" "$DIMMER_BIN" >>/tmp/scratch-dimmer.log 2>&1 &
  disown 2>/dev/null || true
fi

# Command + shell-integration are baked into scratch.conf so ghostty
# doesn't wrap our --command in a login zsh that flashes "Last login: …"
# for a frame before tmux attaches.
open -na "$APP_PATH" --args \
  --config-file="$SCRATCH_CONF" \
  "${CLI_GEOMETRY[@]}"
