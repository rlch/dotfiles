#!/usr/bin/env bash
# user-layer override of launch-revdiff.sh. injects --exclude=<path> flags for
# every file marked linguist-generated / linguist-vendored / linguist-documentation
# in .gitattributes, then delegates to the bundled launcher.
#
# disable: chmod -x this file (resolver treats non-executable overrides as absent)
#          or set REVDIFF_NO_AUTO_EXCLUDE=1 to keep the wrapper but skip injection
# debug:   REVDIFF_DEBUG_AUTO_EXCLUDE=1 prints the injected list to stderr

set -euo pipefail

# locate the bundled launcher. CLAUDE_SKILL_DIR is set by the harness when the
# skill invokes us; outside that flow we fall back to the cached plugin path.
BUNDLED=""
for candidate in \
    "${CLAUDE_SKILL_DIR:-/nonexistent}/scripts/launch-revdiff.sh" \
    "$HOME/.claude/plugins/cache/revdiff/revdiff"/*/.claude-plugin/skills/revdiff/scripts/launch-revdiff.sh; do
    if [ -x "$candidate" ]; then
        BUNDLED="$candidate"
    fi
done
if [ -z "$BUNDLED" ]; then
    echo "error: bundled launch-revdiff.sh not found in skill dir or plugin cache" >&2
    exit 127
fi

auto_excludes=()
if [ "${REVDIFF_NO_AUTO_EXCLUDE:-0}" != "1" ] \
    && command -v git >/dev/null 2>&1 \
    && command -v python3 >/dev/null 2>&1 \
    && git rev-parse --show-toplevel >/dev/null 2>&1; then

    repo_root="$(git rev-parse --show-toplevel)"
    while IFS= read -r path; do
        [ -n "$path" ] && auto_excludes+=("--exclude=$path")
    done < <(
        cd "$repo_root" \
            && git ls-files -z 2>/dev/null \
            | git check-attr --stdin -z linguist-generated linguist-vendored linguist-documentation 2>/dev/null \
            | python3 -c '
import sys
data = sys.stdin.buffer.read().split(b"\0")
i = 0
seen = []
while i + 2 < len(data):
    path, _attr, value = data[i], data[i+1], data[i+2]
    i += 3
    if not path:
        continue
    if value in (b"true", b"set"):
        p = path.decode("utf-8", errors="replace")
        if p not in seen:
            seen.append(p)
for p in seen:
    print(p)
'
    )
fi

if [ "${REVDIFF_DEBUG_AUTO_EXCLUDE:-0}" = "1" ]; then
    printf 'revdiff auto-exclude: %d files\n' "${#auto_excludes[@]}" >&2
    for a in "${auto_excludes[@]}"; do printf '  %s\n' "$a" >&2; done
fi

exec "$BUNDLED" "${auto_excludes[@]}" "$@"
