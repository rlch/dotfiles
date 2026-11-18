#!/bin/sh
# Writes the node tutero-agents' config folder (abyme change tutero-agents-node) into <out>:
# <out>/abyme-tutero (this folder's init.ts, teams.ts and land.ts) and
# <out>/abyme-common (the four files it imports), so the Mac's and the node's never drift; and
# <out>/abyme-tutero/rules.ts, the operator's harness-neutral rules (agent-instructions/common.md, which
# the Mac's ~/.claude/CLAUDE.md and ~/.codex/AGENTS.md hold) as a string init.ts appends to every preset
# (option C: acp puts it in Claude's system prompt and Codex's developer instructions, so the node's home
# needs no file of the operator's). Copy <out>'s two folders to the node's ~/.config. Deploys nothing itself.
set -eu
out=${1:?usage: render.sh <out>}
here=$(cd "$(dirname "$0")" && pwd)
src=$here/../../dot_config
mkdir -p "$out/abyme-tutero" "$out/abyme-common"
cp "$here/abyme-tutero/init.ts" "$here/abyme-tutero/teams.ts" "$here/abyme-tutero/land.ts" "$out/abyme-tutero/"
for f in roles.ts tutero.ts tutero-roles.ts tutero-triggers.ts; do cp "$src/abyme-common/$f" "$out/abyme-common/"; done
python3 -c 'import json,sys; print("// Written by render.sh from agent-instructions/common.md: do not edit.\nexport const RULES = " + json.dumps(sys.stdin.read().strip()) + ";")' \
  < "$here/../../.chezmoitemplates/agent-instructions/common.md" > "$out/abyme-tutero/rules.ts"
echo "$out/abyme-tutero $out/abyme-common"
