#!/usr/bin/env bash
# show-image — render image(s) in tmux split pane(s) next to the calling pane.
# Each viewer pane closes when the user presses Enter in it.
#
# Usage:  show-image.sh <image> [image...]
# Internal: show-image.sh --view   (runs inside the spawned pane; reads
#           $SHOW_IMAGE_FILE — env-var passing sidesteps shell quoting
#           across tmux's default-shell, which is fish here)
set -euo pipefail

self="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"

if [[ "${1:-}" == "--view" ]]; then
    img="${SHOW_IMAGE_FILE:?}"
    if [[ -r "$img" ]]; then
        args=(--animate off --align center)
        # Ghostty speaks the kitty graphics protocol; tmux.conf sets
        # allow-passthrough, so pixel-perfect rendering works. Anything
        # else gets chafa's auto-detected symbol/sixel output.
        if [[ "${TERM_PROGRAM:-}" == "ghostty" ]]; then
            args+=(-f kitty --passthrough tmux)
        fi
        chafa "${args[@]}" --view-size "$(tput cols)x$(($(tput lines) - 1))" "$img" || true
    else
        printf 'cannot read: %s\n' "$img"
    fi
    printf '\033[2m%s — Enter closes\033[0m' "$(basename "$img")"
    IFS= read -rs _ || true
    exit 0
fi

[[ $# -ge 1 ]] || { echo "usage: show-image.sh <image> [image...]" >&2; exit 2; }
[[ -n "${TMUX:-}" ]] || { echo "not inside tmux — fall back to: open <image>" >&2; exit 1; }

for img in "$@"; do
    [[ -r "$img" ]] || { echo "no such image: $img" >&2; exit 1; }
done

# First image splits right of the calling pane; the rest stack vertically
# in that right-hand column. -d keeps focus on the calling pane so the
# conversation isn't interrupted; the user clicks (mouse on) or Ctrl-s h/l
# into a viewer pane and presses Enter to close it.
pane="${TMUX_PANE:?}"
split=-h
for img in "$@"; do
    abs="$(cd "$(dirname "$img")" && pwd)/$(basename "$img")"
    pane="$(tmux split-window "$split" -d -t "$pane" \
        -e SHOW_IMAGE_FILE="$abs" -P -F '#{pane_id}' "$self --view")"
    tmux select-pane -t "$pane" -T "$(basename "$img")"
    split=-v
done
