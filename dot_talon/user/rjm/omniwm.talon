# OmniWM task workspaces by their slot on the focused monitor ("desk", since
# "space" is a herdr workspace).
mode: user.lean
mode: command
-
desk <number_small>: user.omniwm("command switch-workspace slot {number_small}")
desk back: user.omniwm("command switch-workspace back-and-forth")
desk next: user.omniwm("command switch-workspace next")
desk last: user.omniwm("command switch-workspace prev")
window left: key(alt-h)
window down: key(alt-j)
window up: key(alt-k)
window right: key(alt-l)
window full: key(alt-f)
window wider: key(alt-r)
window center: key(alt-c)
desk chat: key(alt-s)
