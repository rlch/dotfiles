#!/bin/sh
# Writes the node tutero-agents' config folder (abyme change tutero-agents-node) into <out>:
# <out>/abyme-tutero (this folder's init.ts, teams.ts and land.ts) and
# <out>/abyme-common (the four files it imports), so the Mac's and the node's never drift; and
# <out>/codex/AGENTS.md, the operator's harness-neutral rules (agent-instructions/common.md, the Mac's
# ~/.claude/CLAUDE.md and ~/.codex/AGENTS.md share it), which Codex reads as its global instructions.
# Copy <out>'s abyme-* folders to the node's ~/.config and codex/AGENTS.md to its ~/.codex/AGENTS.md.
# Deploys nothing itself.
set -eu
out=${1:?usage: render.sh <out>}
here=$(cd "$(dirname "$0")" && pwd)
src=$here/../../dot_config
mkdir -p "$out/abyme-tutero" "$out/abyme-common" "$out/codex"
cp "$here/abyme-tutero/init.ts" "$here/abyme-tutero/teams.ts" "$here/abyme-tutero/land.ts" "$out/abyme-tutero/"
for f in roles.ts tutero.ts tutero-roles.ts tutero-triggers.ts; do cp "$src/abyme-common/$f" "$out/abyme-common/"; done
cp "$here/../../.chezmoitemplates/agent-instructions/common.md" "$out/codex/AGENTS.md"
echo "$out/abyme-tutero $out/abyme-common $out/codex/AGENTS.md"
