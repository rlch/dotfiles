#!/bin/bash
# Reap AeroSpace ghost windows safely. Workaround for upstream bug #1615:
# on macOS Tahoe, macOS stops reliably delivering window open/close/minimize
# events to AeroSpace, so closing a window (even with the app still running)
# leaves an EMPTY-TITLE node in the tree that slices the layout.
# flatten-workspace-tree / reload-config do NOT clear these — only
# `aerospace close --window-id` does. Real fix is the upstream reactive
# refresh rewrite; this bridges the gap until it ships.
#   https://github.com/nikitabobko/AeroSpace/issues/1615 (NirSingher's comment)
#
# Wired into exec-on-workspace-change (aerospace.toml). Safe to auto-run
# because of three guards:
#   1. Debounce — only close a window-id that was empty-title on TWO
#      consecutive runs. A real window gains its title within a check or two,
#      so it's never eligible; a true ghost stays empty forever.
#   2. Skip the focused window — a just-opened window is the focused one, and
#      the one most likely to be legitimately title-less for a moment.
#   3. EXCLUDE list — some real apps legitimately report an empty window-title
#      (Gather, a Brave PWA, is title-less whenever it's unfocused). Without
#      this they'd be reaped on unfocus. Match is on app-name; extend the
#      regex as 'Gather|OtherApp' if another app turns out title-less.
AS=/opt/homebrew/bin/aerospace
STATE="$HOME/.cache/aerospace/ghost-prev"
EXCLUDE='Gather'
mkdir -p "$(dirname "$STATE")"

empties=$("$AS" list-windows --all --json 2>/dev/null \
  | jq -r --arg excl "$EXCLUDE" '
      .[]
      | select(."window-title" == "")
      | select(((."app-name" // "") | test("^(" + $excl + ")$")) | not)
      | ."window-id"' \
  | sort -u)

prev=$(cat "$STATE" 2>/dev/null)
printf '%s\n' "$empties" > "$STATE"            # remember this check for next time
focused=$("$AS" list-windows --focused --format '%{window-id}' 2>/dev/null | tr -d ' ')

comm -12 <(printf '%s\n' "$empties") <(printf '%s\n' "$prev" | sort -u) \
  | { [ -n "$focused" ] && grep -vx "$focused" || cat; } \
  | while IFS= read -r id; do
      [ -n "$id" ] && "$AS" close --window-id "$id" 2>/dev/null
    done
