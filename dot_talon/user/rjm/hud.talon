# The HUD never has the keyboard, so Talon takes Escape for it while a popup
# is open. With none open the tag is off and Escape is untouched.
mode: all
tag: user.hud_popup
-
key(escape): user.hud_close()
