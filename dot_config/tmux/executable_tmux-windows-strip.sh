#!/usr/bin/env bash
# Render the per-window status segments for status-format[1].
#
# Replaces tmux's `#{W:fmt-other,fmt-current}` two-format iterator
# because that iterator's per-iteration `window_active` binding is
# inconsistent across tmux versions (we hit a bug where only the
# first-indexed window picked up the active style regardless of which
# window was actually focused). One `tmux list-windows` call per
# status redraw + one printf per window — sub-millisecond, no need
# to cache.
#
# Caller passes the attached client's session name (`#{q:client_session}`)
# so we list the right session's windows. Each window's `@tab-badge`
# is expanded server-side via the `-F` format, so the badge composition
# (bell glyph, working timer, persistent flags, monitored flags) stays
# defined in tmux.conf — this script just colors and concatenates.

set -eu

ACTIVE_STYLE="${TMUX_WINDOW_ACTIVE_STYLE:-fg=#89B4FA,bold,italic}"
INACTIVE_STYLE="${TMUX_WINDOW_INACTIVE_STYLE:-fg=#6C7086}"

session="${1:-}"
[ -z "$session" ] && exit 0

# `-F` evaluates the format per window in tmux's own context, so
# `#{E:@tab-badge}` resolves with each window's own state — bell
# flags, working glyph etc. all bind to the iterating window.
fmt='#{window_index}	#{window_active}	#{window_name}	#{E:@tab-badge}'

while IFS=$'\t' read -r idx active name badge; do
    [ -z "$idx" ] && continue
    if [ "$active" = "1" ]; then
        printf '#[%s] %s%s #[default]' "$ACTIVE_STYLE" "$name" "$badge"
    else
        printf '#[%s] %s%s #[default]' "$INACTIVE_STYLE" "$name" "$badge"
    fi
done < <(tmux list-windows -t "$session" -F "$fmt" 2>/dev/null)
