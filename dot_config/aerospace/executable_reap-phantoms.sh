#!/bin/bash
# Reap AeroSpace phantom windows — window nodes whose owning process is
# already dead. AeroSpace tiles for these ghosts, squeezing real windows
# (e.g. one Ghostty crammed into 1/N of the screen).
#
# Why they happen: AeroSpace tracks windows via the Accessibility API and
# expects a kAXUIElementDestroyedNotification (or an app-termination event)
# when a window goes away. winit/egui/Bevy apps typically `process::exit()`
# straight out of their event loop, tearing the process down without the
# orderly AppKit window-close sequence — so AeroSpace never hears the window
# died and keeps the node forever, now pointing at a dead PID. (The old
# scratch system hit the same failure via `pkill -TERM`.)
#
# Fix: list every tracked window, and for any whose PID is no longer alive,
# `aerospace close --window-id` it. AeroSpace drops the dead node and
# re-tiles. Wired into on-focus-changed (aerospace.toml) so tiling
# self-heals the instant you move focus after quitting such an app.
#
# Safety: we close ONLY when `kill -0` confirms the PID is dead. A live PID
# short-circuits before the close, so we never AX-close a real window. PID
# recycling can only cause a false *survival* (skip the reap), never a false
# close — the next focus change retries.
set -u

aerospace list-windows --all --format '%{window-id} %{app-pid}' 2>/dev/null |
while read -r wid pid; do
  case "$pid" in ''|*[!0-9]*) continue ;; esac   # skip empty / non-numeric
  kill -0 "$pid" 2>/dev/null || aerospace close --window-id "$wid" 2>/dev/null
done
