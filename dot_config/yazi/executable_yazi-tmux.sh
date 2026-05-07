#!/usr/bin/env bash
# yazi-tmux.sh — tmux integration helper for yazi keymap.
#
# When yazi is launched from the Ctrl+Y popup binding, that binding bakes
# YAZI_OUTER_SESSION (#{session_name}) and YAZI_OUTER_PANE (#{pane_id})
# into the throwaway nested session's env. We retarget tmux operations
# at those when set; otherwise (yazi launched in a regular pane via the
# `f` fish abbrev or similar) we let tmux default to the current session
# and pane. Same script, both call sites.
#
# Usage:
#   yazi-tmux.sh window <cwd>             new window in outer session
#   yazi-tmux.sh vsplit <cwd>             vertical split of outer pane
#   yazi-tmux.sh hsplit <cwd>             horizontal split of outer pane
#   yazi-tmux.sh edit   <files...>        new window in outer session, $EDITOR
#
# All errors land in /tmp/yazi-tmux.log so the keymap doesn't have to
# fight yazi's task UI for visibility.

set -euo pipefail

LOG=/tmp/yazi-tmux.log
exec 2>>"$LOG"
echo "[$(date +%H:%M:%S)] $0 $*  outer-session=${YAZI_OUTER_SESSION-} outer-pane=${YAZI_OUTER_PANE-} yazi-id=${YAZI_ID-} tmux=${TMUX-}" >&2

action=${1:?missing action}
shift

session_target=()
pane_target=()
[[ -n "${YAZI_OUTER_SESSION-}" ]] && session_target=(-t "${YAZI_OUTER_SESSION}:")
[[ -n "${YAZI_OUTER_PANE-}"    ]] && pane_target=(-t "${YAZI_OUTER_PANE}")

case "$action" in
  window)
    tmux new-window "${session_target[@]}" -c "${1:-$PWD}"
    ;;
  vsplit)
    tmux split-window -h "${pane_target[@]}" -c "${1:-$PWD}"
    ;;
  hsplit)
    tmux split-window -v "${pane_target[@]}" -c "${1:-$PWD}"
    ;;
  edit)
    tmux new-window "${session_target[@]}" "${EDITOR:-nvim}" "$@"
    ;;
  *)
    echo "yazi-tmux.sh: unknown action '$action'" >&2
    exit 2
    ;;
esac

# Ask the spawning yazi to exit so the tmux action takes the user's focus
# instead of leaving yazi behind. YAZI_ID is set by yazi for any shell
# command spawned from a binding; if it's missing or yazi already exited,
# `ya emit-to` is harmless.
if [[ -n "${YAZI_ID-}" ]]; then
  ya emit-to "$YAZI_ID" quit || true
fi
