#!/usr/bin/env bash
# clean-tmp.sh — safe /tmp janitor for macOS.
#
# Reclaims scratch space from /tmp while refusing to touch anything that could
# break a running process. Dry-run by default; pass --apply to actually delete.
#
# Safety model (an entry is PRESERVED if ANY of these hold):
#   1. Not owned by the current user            (system / other-user state)
#   2. It is a socket or FIFO                    (live IPC endpoint)
#   3. Its name matches a protected glob         (tmux-*, claude-*, ssh-*, ...)
#   4. It (or anything inside it) is held open   (lsof — the real breakage guard)
#   5. It (or anything inside it) was modified   (active-session guard)
#      within --days N  (default 3)
# Everything else is a deletion candidate.
#
# Usage:
#   clean-tmp.sh                # dry-run, show what WOULD be removed
#   clean-tmp.sh --apply        # actually delete
#   clean-tmp.sh --days 7       # only consider entries idle >7 days
#   clean-tmp.sh --all          # ignore the age guard (still honours 1-4)
#   clean-tmp.sh --apply --all  # most aggressive: delete everything safe to
#
# Env: DAYS overrides the default age threshold.

set -euo pipefail

# /tmp is a symlink to private/tmp on macOS; BSD find won't descend a symlink
# start-point, so always operate on the real directory.
TMP=/private/tmp

DAYS="${DAYS:-3}"
APPLY=0
IGNORE_AGE=0

while [ $# -gt 0 ]; do
	case "$1" in
		--apply) APPLY=1 ;;
		--all) IGNORE_AGE=1 ;;
		--days) DAYS="${2:?--days needs a number}"; shift ;;
		--days=*) DAYS="${1#*=}" ;;
		-h|--help) sed -n '2,30p' "$0"; exit 0 ;;
		*) echo "unknown arg: $1" >&2; exit 2 ;;
	esac
	shift
done

# Names we never delete, even if idle and not currently open. These are IPC /
# runtime dirs whose absence breaks a daemon or the agent itself.
is_protected_name() {
	case "$1" in
		tmux-*|tmux*-*) return 0 ;;   # tmux server socket dirs (default + any -L named server)
		claude-*) return 0 ;;          # Claude Code runtime (sockets, cwd markers, project state)
		ssh-*|gpg-*|gnupg-*) return 0 ;;
		com.apple.*) return 0 ;;
		.X11-unix|.ICE-unix|.font-unix|.*-unix) return 0 ;;
		powerlog) return 0 ;;          # powermetrics drop dir used by perf tooling
		*) return 1 ;;
	esac
}

# One lsof pass: every open path under /tmp or /private/tmp, system-wide.
open_paths="$(lsof -w -Fn 2>/dev/null | sed -n 's/^n//p' | grep -aE '^(/private/tmp|/tmp)/' || true)"

is_open() {
	# $1 = /private/tmp/<name>. Match either the real or the symlinked form,
	# as a path prefix. Over-matching only ever preserves more — the safe side.
	local p="$1" alt="/tmp/${1#"$TMP"/}"
	[ -n "$open_paths" ] || return 1
	printf '%s\n' "$open_paths" | grep -qaF -e "$p" -e "$alt"
}

is_recent() {
	# True if the entry, or anything inside it, was modified within DAYS days.
	[ "$IGNORE_AGE" -eq 1 ] && return 1
	[ -n "$(find "$1" -mtime "-${DAYS}" -print -quit 2>/dev/null)" ]
}

candidates=()
preserved=0

while IFS= read -r -d '' path; do
	name="${path##*/}"
	if [ ! -O "$path" ];        then preserved=$((preserved+1)); continue; fi  # not mine
	if [ -S "$path" ] || [ -p "$path" ]; then preserved=$((preserved+1)); continue; fi  # socket/fifo
	if is_protected_name "$name";        then preserved=$((preserved+1)); continue; fi
	if is_open "$path";                  then preserved=$((preserved+1)); continue; fi
	if is_recent "$path";                then preserved=$((preserved+1)); continue; fi
	candidates+=("$path")
done < <(find "$TMP" -mindepth 1 -maxdepth 1 -print0)

guard_desc=$([ "$IGNORE_AGE" -eq 1 ] && echo 'OFF (--all)' || echo "idle >${DAYS}d")
if [ "${#candidates[@]}" -eq 0 ]; then
	echo "Nothing to clean. ($preserved entries preserved; age guard: $guard_desc)"
	exit 0
fi

# Reclaimable size.
kb=0
for p in "${candidates[@]}"; do
	k=$(du -sk "$p" 2>/dev/null | awk '{print $1}'); kb=$((kb + ${k:-0}))
done
human=$(awk -v k="$kb" 'BEGIN{u="KMGT";s="K";v=k; while(v>=1024&&length(u)>1){v/=1024;u=substr(u,2);s=substr(u,1,1)} printf "%.1f%sB", v, s}')

if [ "$APPLY" -eq 1 ]; then
	printf 'Deleting %d entries (%s)...\n' "${#candidates[@]}" "$human"
	for p in "${candidates[@]}"; do rm -rf -- "$p"; done
	printf 'Done. %s reclaimed. %d entries preserved.\n' "$human" "$preserved"
else
	printf 'DRY RUN — would delete %d entries, reclaiming %s. %d preserved.\n' \
		"${#candidates[@]}" "$human" "$preserved"
	printf '  age guard: %s\n\n' "$guard_desc"
	for p in "${candidates[@]}"; do echo "  rm -rf $p"; done
	printf '\nRe-run with --apply to delete.\n'
fi
