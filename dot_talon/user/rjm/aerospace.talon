# Aerospace workspaces by their names ("desk", since "space" is a herdr
# workspace).
mode: user.lean
mode: command
-
desk {user.aerospace_desk}: user.aerospace("workspace {aerospace_desk}")
desk back: user.aerospace("workspace-back-and-forth")
desk next: key(alt-n)
desk last: key(alt-p)
window left: key(alt-h)
window down: key(alt-j)
window up: key(alt-k)
window right: key(alt-l)
window full: key(alt-f)
