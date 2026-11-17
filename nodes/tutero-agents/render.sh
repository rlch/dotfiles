#!/bin/sh
# Writes the node tutero-agents' config folder (abyme change tutero-agents-node) into <out>:
# <out>/abyme-tutero (this folder's init.ts, the Mac's teams.ts and land.ts) and
# <out>/abyme-common (the four files it imports), so the Mac's and the node's never drift. Copy <out>'s
# two folders to the node's ~/.config. Deploys nothing itself.
set -eu
out=${1:?usage: render.sh <out>}
here=$(cd "$(dirname "$0")" && pwd)
src=$here/../../dot_config
mkdir -p "$out/abyme-tutero" "$out/abyme-common"
cp "$here/abyme-tutero/init.ts" "$out/abyme-tutero/"
cp "$src/abyme-tutero/teams.ts" "$src/abyme-tutero/land.ts" "$out/abyme-tutero/"
for f in roles.ts tutero.ts tutero-roles.ts tutero-triggers.ts; do cp "$src/abyme-common/$f" "$out/abyme-common/"; done
echo "$out/abyme-tutero $out/abyme-common"
