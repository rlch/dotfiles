#!/usr/bin/env bash
# worktree-janitor leaves land's warm checkouts alone (abyme openspec land-plugin, 1.9).
# Fake HOME, dry run only: an old cargo target in a land checkout is never listed,
# the same one in an ordinary worktree is.
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd)
jan="$here/dot_local/bin/executable_worktree-janitor"
export HOME; HOME=$(cd "$(mktemp -d)" && pwd -P)
trap 'rm -rf "$HOME"' EXIT
export GIT_CONFIG_GLOBAL=/dev/null GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
repo=$HOME/dev/repo
git init -q -b main "$repo"
git -C "$repo" commit -q --allow-empty -m init
land=$HOME/.local/state/abyme/land/repo/queue
oldland=$HOME/.local/share/abyme/land/repo/queue
other=$HOME/dev/other
git -C "$repo" worktree add -q -b queue "$land"
git -C "$repo" worktree add -q -b oldqueue "$oldland"
git -C "$repo" worktree add -q -b other "$other"
for wt in "$land" "$oldland" "$other"; do
  mkdir -p "$wt/target/debug/incremental/x"
  touch "$wt/target/CACHEDIR.TAG" "$wt/target/.rustc_info.json" "$wt/target/debug/incremental/x/f"
  find "$wt/target" -exec touch -t 202001010000 {} +
done
out=$(JANITOR_FLOOR_GB=0 JANITOR_REAP_MATCH='^$' \
  bash "$jan" -n --remove-landed 2>&1 || true)
echo "$out"
fail=0
grep -q "would clean $other/target" <<<"$out" || { echo "FAIL: ordinary target not listed"; fail=1; }
for l in "$land" "$oldland"; do
  if grep -E "would (clean|prune|remove).*$l" <<<"$out"; then echo "FAIL: land checkout $l listed"; fail=1; fi
done
(( fail == 0 )) && echo "PASS"
exit $fail
