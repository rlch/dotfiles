#!/usr/bin/env bash
# Extract the last command's output from a captured pane file and copy it
# to the macOS clipboard. Bound to <prefix> y in tmux.conf.
#
# Heuristic: starship's success/error symbol is `λ`, which is unique enough
# to mark prompt lines. We find the last two prompt lines and copy
# everything between them, then trim trailing blank lines.
set -eu

file=${1:-/tmp/tmux-last-output.txt}
[[ -s $file ]] || exit 0

awk '
  /λ / { pp = lp; lp = NR }
  { L[NR] = $0 }
  END {
    if (!lp) { for (i = 1; i < NR; i++) print L[i]; exit }
    s = pp ? pp : 1
    e = lp - 1
    while (e >= s && L[e] ~ /^[[:space:]]*$/) e--
    for (i = s; i <= e; i++) print L[i]
  }
' "$file" | pbcopy
