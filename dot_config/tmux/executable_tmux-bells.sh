#!/usr/bin/env bash
# Per-window tmux bell counter.
#
# tmux exposes a per-window `bell` flag (boolean) — but no count. This
# script keeps its own count file alongside it so the status bar can
# show "this session has 5 unread bells" instead of just "there's a
# bell somewhere." Generic tmux UX: the bell is the universal
# "something happened" signal — Claude Code's Stop hook ringing,
# `cargo build` finishing, an SSH disconnect, an editor's flash —
# anything that emits `\a` increments the count.
#
# Wired in tmux.conf:
#   set-hook -g alert-bell             "run-shell -b '~/.config/tmux/tmux-bells.sh inc #{q:session_name} #{window_index}; tmux refresh-client -S'"
#   set-hook -g session-window-changed "run-shell -b '~/.config/tmux/tmux-bells.sh clear #{q:session_name} #{window_index}; tmux refresh-client -S'"
#
# Read in window-status-format / sessions strip:
#   #(~/.config/tmux/tmux-bells.sh window #{q:session_name} #{window_index})
#   #(~/.config/tmux/tmux-bells.sh session #{q:session_name})
#
# State lives under $XDG_RUNTIME_DIR (or /tmp on macOS) — ephemeral by
# design. Bells die when the OS reboots or /tmp clears, which matches
# their semantics anyway (a bell from yesterday is not unread).
#
# Costs: cat is ~10µs, the read in window-status-format runs once per
# (session,window) per status-interval. Negligible. No caching needed.

set -eu

DIR="${XDG_RUNTIME_DIR:-/tmp/tmux-bells-$(id -u)}/bells"

# tmux session names are arbitrary strings — `/` and `\0` could escape
# the bells dir. Replace them with `_` before using as a path segment.
sanitize() {
    printf '%s' "$1" | tr '/\\\0' '___'
}

# Format a count as a status-bar superscript.
#   0     → empty (slot collapses)
#   1..9  → single Unicode superscript digit
#   ≥10   → "⁺" (saturating)
fmt_count() {
    case "$1" in
        0) ;;
        1) printf '¹' ;;
        2) printf '²' ;;
        3) printf '³' ;;
        4) printf '⁴' ;;
        5) printf '⁵' ;;
        6) printf '⁶' ;;
        7) printf '⁷' ;;
        8) printf '⁸' ;;
        9) printf '⁹' ;;
        *) printf '⁺' ;;
    esac
}

# Errors mustn't break the tmux hook chain — best-effort throughout.
mkdir -p "$DIR" 2>/dev/null || exit 0

case "${1:-}" in
    inc)
        sess=$(sanitize "${2:?}"); win="${3:?}"
        d="$DIR/$sess"
        mkdir -p "$d" 2>/dev/null
        f="$d/$win"
        n=$(cat "$f" 2>/dev/null || echo 0)
        case "$n" in *[!0-9]*) n=0 ;; esac
        # Atomic-ish: write to .tmp then rename.
        echo $((n + 1)) > "$f.tmp" 2>/dev/null && mv "$f.tmp" "$f" 2>/dev/null
        ;;
    clear)
        sess=$(sanitize "${2:?}"); win="${3:?}"
        rm -f "$DIR/$sess/$win" 2>/dev/null || true
        ;;
    window)
        sess=$(sanitize "${2:?}"); win="${3:?}"
        n=$(cat "$DIR/$sess/$win" 2>/dev/null || echo 0)
        case "$n" in *[!0-9]*) n=0 ;; esac
        fmt_count "$n"
        ;;
    session)
        sess=$(sanitize "${2:?}")
        sum=0
        if [ -d "$DIR/$sess" ]; then
            for f in "$DIR/$sess"/*; do
                [ -f "$f" ] || continue
                v=$(cat "$f" 2>/dev/null || echo 0)
                case "$v" in *[!0-9]*) v=0 ;; esac
                sum=$((sum + v))
            done
        fi
        fmt_count "$sum"
        ;;
    *)
        echo "usage: $0 {inc|clear|window|session} <session> [<window>]" >&2
        exit 2
        ;;
esac
