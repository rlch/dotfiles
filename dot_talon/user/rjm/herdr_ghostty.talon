# herdr layout commands — spoken names for the chords in
# ~/.config/herdr/config.toml.
app: ghostty
mode: user.lean
mode: command
-
agent next: key(cmd-])
agent last: key(cmd-[)
# Answer a Claude Code approval prompt in the focused agent.
agent approve: key(enter)
agent (reject | stop): key(escape)

tab next: key(cmd-l)
tab last: key(cmd-h)
tab new: key(cmd-t)
tab close: key(ctrl-s shift-x)
go tab <number_small>: key("ctrl-{number_small}")

space next: key(cmd-j)
space last: key(cmd-k)
space pick: key(cmd-p)
space new: key(cmd-n)
side bar: key(cmd-b)

pane left: key(ctrl-h)
pane down: key(ctrl-j)
pane up: key(ctrl-k)
pane right: key(ctrl-l)
pane zoom: key(ctrl-s f)
pane close: key(cmd-w)
split right: key(cmd-d)
split down: key(cmd-shift-d)

tree new: key(ctrl-s shift-g)
tree pick: key(ctrl-s g)
tree remove: key(ctrl-s ctrl-g)
