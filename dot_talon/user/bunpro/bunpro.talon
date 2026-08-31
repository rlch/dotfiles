# Bunpro site navigation — active anywhere on bunpro.jp.
# In-page clicking/scrolling comes from Rango ("click <hints>", "upper",
# "downer", ...); these commands cover direct URL jumps so the common areas
# never need hints at all.
tag: user.bunpro
-
(bun pro | bunpro) dash [board]: user.bunpro_open("dashboard")
(bun pro | bunpro) home: user.bunpro_open("dashboard")
start reviews: user.bunpro_open("reviews")
start cram: user.bunpro_open("cram")
start learn: user.bunpro_open("learn")
show grammar [points]: user.bunpro_open("grammar_points")
show decks: user.bunpro_open("decks")
show stats: user.bunpro_open("stats")
show settings: user.bunpro_open("settings")
search for <user.text>:
    user.bunpro_open("search?q={text}")
