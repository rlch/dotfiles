#!/usr/bin/env bash
# Listening-TCP-port helpers for the tmux status bar + a clickable
# kill menu.
#
# Subcommands:
#   count → ":N" if the current user has N>0 listening ports, else empty
#   list  → "<port>\t<pid>\t<command>" lines, sorted by port
#   menu  → emit a `tmux display-menu …` shell command that opens a
#           menu listing each port + a "kill -TERM <pid>" action per
#           row. Pipe to `sh` from a `MouseDown1Status` binding.
#
# Perf: lsof is slow (often 100+ms on macOS). The status bar polls
# `count` every status-interval (1s by default), so without caching
# we'd spawn lsof every second. We cache the parsed list under
# /tmp with a 5-second TTL — `count` and `list` read the cache;
# `menu` always refreshes so a click gets fresh data.
#
# Cache file is per-uid so multi-user machines don't share state.

set -eu

CACHE="${TMPDIR:-/tmp}/tmux-ports-$(id -u).cache"
TTL=5  # seconds

esc_single() {
    # POSIX trick: close-quote, backslash-escape ', open-quote.
    printf '%s' "$1" | sed "s/'/'\\\\''/g"
}

# Parse `lsof -iTCP -sTCP:LISTEN -P -n -u $USER` into
# "<port>\t<pid>\t<command>" lines. Dedups dual-stack listeners
# (one process bound to both IPv4 and IPv6 → single entry).
list_raw() {
    lsof -iTCP -sTCP:LISTEN -P -n -u "$USER" 2>/dev/null \
        | awk 'NR > 1 {
            # NAME column is the last field: *:3000, 127.0.0.1:5432, [::1]:6006.
            n = split($NF, parts, ":")
            port = parts[n]
            if (port ~ /^[0-9]+$/) {
                key = port "\t" $2
                if (!(key in seen)) {
                    seen[key] = 1
                    print port "\t" $2 "\t" $1
                }
            }
        }' \
        | sort -n
}

# Read from cache if fresh; refresh-then-read otherwise. Stat's `-f
# %m` (BSD/macOS) and `-c %Y` (GNU) both mean "mtime as epoch."
ensure_cache() {
    if [ -f "$CACHE" ]; then
        local mtime now age
        mtime=$(stat -f %m "$CACHE" 2>/dev/null || stat -c %Y "$CACHE" 2>/dev/null || echo 0)
        now=$(date +%s)
        age=$((now - mtime))
        if [ "$age" -lt "$TTL" ]; then
            return
        fi
    fi
    refresh_cache
}

refresh_cache() {
    # Atomic write so a partial lsof doesn't corrupt the cache.
    list_raw > "$CACHE.tmp" 2>/dev/null && mv "$CACHE.tmp" "$CACHE" 2>/dev/null
}

case "${1:-}" in
    count)
        ensure_cache
        n=$(wc -l < "$CACHE" 2>/dev/null | tr -d ' ' || echo 0)
        [ "${n:-0}" -gt 0 ] && printf ':%s' "$n" || true
        ;;
    list)
        ensure_cache
        cat "$CACHE" 2>/dev/null || true
        ;;
    menu)
        # User just clicked — bypass cache for freshness.
        refresh_cache
        if [ ! -s "$CACHE" ]; then
            printf "tmux display-message 'no listening ports'"
            exit 0
        fi
        cmd="tmux display-menu -T '#[align=centre] listening ports ' -x M -y S"
        while IFS=$'\t' read -r port pid command; do
            [ -n "$port" ] || continue
            label="$command :$port — pid $pid"
            action="run-shell \"kill -TERM $pid\""
            cmd="$cmd '$(esc_single "$label")' '' '$(esc_single "$action")'"
        done < "$CACHE"
        cmd="$cmd '' '' '' 'cancel' 'q' ''"
        printf '%s' "$cmd"
        ;;
    *)
        echo "usage: $0 {count|list|menu}" >&2
        exit 2
        ;;
esac
