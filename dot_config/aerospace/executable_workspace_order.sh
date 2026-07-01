#!/bin/sh
# Canonical cycle order for alt-n/alt-p (and alt-shift-n/p when moving a
# window). Aerospace's default sort is purely lexical; piping this list
# through `aerospace workspace next --stdin` lets us order freely (here:
# dev, then code, then the agent browser) without name-mangling tricks.
# focused_workspaces.sh narrows this to the focused monitor's workspaces.
cat <<'EOF'
dev
code
agent
browser
trading
notes
comms
notion
EOF
