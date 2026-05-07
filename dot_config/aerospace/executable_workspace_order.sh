#!/bin/sh
# Canonical cycle order for alt-n/alt-p (and alt-shift-n/p when moving a
# window). Aerospace's default sort is purely lexical; piping this list
# through `aerospace workspace next --stdin` lets us pin dev last without
# resorting to name-mangling tricks.
cat <<'EOF'
code
dev
browser
notes
comms
notion
EOF
