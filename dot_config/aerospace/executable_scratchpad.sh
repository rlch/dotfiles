#!/usr/bin/env bash
# Toggle the scratchpad with monitor-aware semantics:
#
#   alive on monitor X, pressed on monitor X  → close (toggle off)
#   alive on monitor X, pressed on monitor Y  → close+respawn on Y
#   not alive                                  → spawn on focused monitor
#
# Why: cross-monitor focus moves no longer auto-quit scratch (see
# scratch-autoquit.sh), so re-pressing globe on a different monitor is
# the user's signal to relocate the scratchpad. We close on the old
# monitor and respawn on the new one rather than AX-moving the live
# window — kill+respawn reuses the existing position/size/dimmer
# pipeline (which is well-tested), and tmux's "scratch" session lives
# on the tmux server independent of ghostty so the new window attaches
# to exactly the same shell + programs.
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

APP_ID="com.mitchellh.ghostty.scratch"
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
  # Compare scratch's current monitor against the toggle invocation
  # monitor. Both come from aerospace's own monitor-id space so the
  # comparison can't drift across NSScreen / CGDisplay orderings.
  #
  # Each command sub gets `|| true` so a transient aerospace error
  # (server reload, brief unresponsiveness, anything that returns
  # non-zero) cannot kill the toggle under `set -euo pipefail`.
  SCRATCH_MONITOR=$(aerospace list-windows --all \
                      --format '%{app-bundle-id} %{monitor-id}' 2>/dev/null \
                    | awk -v id="$APP_ID" '$1==id {print $2; exit}' \
                    || true)
  TOGGLE_MONITOR=$(aerospace list-monitors --focused \
                     --format '%{monitor-id}' 2>/dev/null || true)
  # Same NSScreen index space scratch-axpos / scratch-dimmer expect.
  TOGGLE_SCREEN_IDX=$(aerospace list-monitors --focused \
                        --format '%{monitor-appkit-nsscreen-screens-id}' 2>/dev/null \
                      || true)
  TOGGLE_SCREEN_IDX="${TOGGLE_SCREEN_IDX:-1}"

  if [[ -n "$SCRATCH_MONITOR" && -n "$TOGGLE_MONITOR" \
        && "$SCRATCH_MONITOR" != "$TOGGLE_MONITOR" ]]; then
    # === Cross-monitor toggle: MOVE scratch to the new monitor ===
    # Preserves ghostty/tmux state — only the window relocates and the
    # dimmer rebuilds. Always dim-down BEFORE moving the window so the
    # user sees: (1) old-monitor overlay disappears, (2) scratch
    # repositions, (3) new-monitor overlay paints. Reordering looks
    # broken: scratch on the new monitor with no dim around it for one
    # frame.
    pkill -TERM -xf "$DIMMER_BIN" 2>/dev/null || true
    for _ in 1 2 3 4 5 6 7 8 9 10; do  # max ~200ms
      pgrep -f "$DIMMER_BIN" >/dev/null 2>&1 || break
      sleep 0.02
    done

    # Reposition + resize scratch via AX. center-pct is the same path
    # the spawn-from-cold uses (size as % of visibleFrame, centred), so
    # the moved window matches a fresh-launch layout exactly.
    if [[ -x "$AXPOS_BIN" ]]; then
      "$AXPOS_BIN" "$pid" center-pct "$SCRATCH_W_PCT" "$SCRATCH_H_PCT" "$TOGGLE_SCREEN_IDX" \
        2>>/tmp/scratchpad.log || true
    fi

    # Bring scratch to front on the new monitor so the user lands on
    # it without a tab-switch.
    osascript -e "tell application id \"$APP_ID\" to activate" 2>/dev/null || true

    # Spawn a fresh dimmer scoped to the new screen. The dimmer
    # auto-derives its target from scratch's actual frame on launch,
    # so the env hint matters only as a fallback if scratch's frame
    # isn't readable yet.
    if [[ -x "$DIMMER_BIN" ]]; then
      : >/tmp/scratch-dimmer.log
      SCRATCH_DIMMER_SCREEN_IDX="$TOGGLE_SCREEN_IDX" "$DIMMER_BIN" \
        >>/tmp/scratch-dimmer.log 2>&1 &
      disown 2>/dev/null || true
    fi
    exit 0
  fi

  # === Same-monitor toggle: kill scratch ===
  # Strict order: dim FIRST, wait for it to exit, then scratch.
  pkill -TERM -xf "$DIMMER_BIN" 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    pgrep -f "$DIMMER_BIN" >/dev/null 2>&1 || break
    sleep 0.02
  done

  # SIGKILL (not SIGTERM) for instant death. SIGTERM lets ghostty run
  # async cleanup for ~50–100ms; if the user presses alt-N inside that
  # window, the alt-N's focus change races with scratch's dying
  # NSWorkspaceDidTerminate reshuffle and the reshuffle wins,
  # snapping focus back to scratch's old monitor for one frame
  # (visible cursor flicker via aerospace's `move-mouse
  # window-lazy-center`). Tmux's "scratch" session lives on the tmux
  # server, not in ghostty, so we lose nothing by skipping ghostty's
  # graceful shutdown — the next launch reattaches to the same shell
  # state.
  kill -KILL "$pid" 2>/dev/null || true
  exit 0
fi

mkdir -p "$(dirname "$GRACE_FILE")"
touch "$GRACE_FILE"

# macOS NSWindow autosave: ghostty's `window-save-state = never` only
# disables ghostty's own state plumbing — macOS still writes
# `NSWindowLastPosition` into the app's defaults plist (via the AppKit
# frame-autosave that ghostty registers on the window) and restores
# from it on the next cold launch. When that key exists, macOS positions
# the window from it BEFORE our --window-position-x/y CLI overrides take
# effect, so scratch lands wherever it was last closed regardless of
# which monitor the toggle thinks is focused. The dimmer (correctly)
# dims the focused monitor, scratch (incorrectly) appears on the last-
# closed monitor, and the spotlight breaks.
#
# Delete the key before every launch so our CLI args win on frame 1.
# `defaults delete … NSWindowLastPosition` is idempotent: missing key
# returns non-zero, hence `|| true`.
defaults delete com.mitchellh.ghostty.scratch NSWindowLastPosition 2>/dev/null || true

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
  pkill -xf "$DIMMER_BIN" 2>/dev/null || true
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
