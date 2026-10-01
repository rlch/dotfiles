# Housekeeping that must exist in lean mode, where community's own versions
# are switched off.
mode: user.lean
mode: command
-
^go to sleep$: speech.disable()
full mode: user.listen_full(true)
lean mode: user.listen_full(false)
help: user.hud_help()
hud history: user.hud_widget("history", "toggle")
