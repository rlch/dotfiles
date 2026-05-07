#!/usr/bin/env bash
# Spawned by the tmux Ctrl+Y binding. Format expansion (#{...}) is only
# reliable in run-shell argument strings, NOT in display-popup's
# shell-command argument when the binding fires from a keypress — so the
# binding hands us the calling cwd / session / pane explicitly, and we
# bake them into the throwaway nested session that runs yazi. The yazi
# keymap's <C-w>*/<C-o> bindings then read YAZI_OUTER_SESSION /
# YAZI_OUTER_PANE via yazi-tmux.sh to retarget tmux operations at the
# original session, not the throwaway one.
#
# Toggle behavior: the inner nested session inherits the outer tmux's
# `bind -T root C-y` (bindings are server-global, not session-local), so a
# Ctrl+Y inside the popup re-fires this script — without the toggle, that
# stacks a nested popup on top of the existing one. We name the inner
# session `yazi-popup`; if it already exists we kill it instead of
# spawning. Killing the session ends the inner client, and `display-popup
# -E` then tears the popup chrome down. Same script handles both the
# outer-press-to-open and any-press-to-close paths.

set -euo pipefail

cwd=${1:?missing cwd}
outer_session=${2:?missing session}
outer_pane=${3:?missing pane}

readonly POPUP_SESSION=yazi-popup

if tmux kill-session -t "$POPUP_SESSION" 2>/dev/null; then
  exit 0
fi

exec tmux display-popup -d "$cwd" -E -w 80% -h 80% \
  "tmux new-session -s '$POPUP_SESSION' -e YAZI_OUTER_SESSION='$outer_session' -e YAZI_OUTER_PANE='$outer_pane' yazi \\; set status off"
