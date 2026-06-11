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
    # Rendering strategy (empirically tested in Ghostty + tmux 3.6):
    #   - sixel: Ghostty doesn't decode it (tmux.conf force-declares the
    #     terminal-feature, so don't trust client_termfeatures).
    #   - kitty Unicode placeholders: Ghostty doesn't render them.
    #   - kitty passthrough: pixels place at the OUTER terminal cursor
    #     (which tracks the focused pane) and tmux repaints wipe them —
    #     absolute-positioned placements were tried and wiped too. Only
    #     reliable while THIS pane is focused and visible.
    #   - symbols: cell art in tmux's grid; survives every redraw.
    # So: symbols always (automatic), overdraw kitty pixels while the
    # pane is focused+visible, back to symbols on focus loss.
    # Outer terminal identity: tmux >=3.4 overwrites TERM_PROGRAM=tmux in
    # pane envs; the real terminal's value lives in the session env (kept
    # fresh by update-environment on each client attach).
    outer="$(tmux show-environment TERM_PROGRAM 2>/dev/null | cut -d= -f2-)"
    size() { printf '%dx%d' "$(tput cols)" "$(($(tput lines) - 1))"; }
    footer() {
        printf '\033[2m%s — Enter closes · focus pane for hi-res\033[0m' \
            "$(basename "$img")"
    }
    draw_symbols() {
        printf '\033[H\033[2J'
        if [[ -r "$img" ]]; then
            chafa --animate off --align center -f symbols \
                --view-size "$(size)" "$img" 2>/dev/null || true
        else
            printf 'cannot read: %s\n' "$img"
        fi
        footer
    }
    draw_kitty() {
        printf '\033[H'
        chafa --animate off --align center -f kitty --passthrough tmux \
            --view-size "$(size)" "$img" 2>/dev/null || true
        footer
    }
    trap 'last=' WINCH
    sleep 0.3 # let the spawner finish splitting before the first paint
    last=
    while :; do
        state="$(tmux display -t "$TMUX_PANE" -p \
            '#{&&:#{pane_active},#{window_active}}' 2>/dev/null || echo 0)"
        if [[ "$state" != "$last" ]]; then
            draw_symbols
            [[ "$state" == 1 && -r "$img" && "$outer" == ghostty ]] &&
                draw_kitty
            last="$state"
        fi
        IFS= read -rs -t 1 _ && break
        rc=$?
        ((rc > 128)) || break
    done
    exit 0
fi

[[ $# -ge 1 ]] || { echo "usage: show-image.sh <image> [image...]" >&2; exit 2; }
[[ -n "${TMUX:-}" ]] || { echo "not inside tmux — fall back to: open <image>" >&2; exit 1; }

for img in "$@"; do
    [[ -r "$img" ]] || { echo "no such image: $img" >&2; exit 1; }
done

# First image splits right of the calling pane; the rest stack vertically
# in that right-hand column, sized so all N images end up even (splitting
# off (remaining/remaining+1) of the shrinking pane each time). -d keeps
# focus on the calling pane so the conversation isn't interrupted.
pane="${TMUX_PANE:?}"
total=$#
i=0
for img in "$@"; do
    i=$((i + 1))
    abs="$(cd "$(dirname "$img")" && pwd)/$(basename "$img")"
    if ((i == 1)); then
        splitargs=(-h)
    else
        remaining=$((total - i + 1))
        splitargs=(-v -l "$((remaining * 100 / (remaining + 1)))%")
    fi
    pane="$(tmux split-window "${splitargs[@]}" -d -t "$pane" \
        -e SHOW_IMAGE_FILE="$abs" -P -F '#{pane_id}' "$self --view")"
    tmux select-pane -t "$pane" -T "$(basename "$img")"
done
