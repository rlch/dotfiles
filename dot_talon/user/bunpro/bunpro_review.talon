# Bunpro review/cram session commands.
#
# Core flow (typing mode, with the bridge userscript installed):
#   - Say the answer itself (e.g. "te i ru"): only utterances matching one of
#     the current question's accepted answers do anything — they get typed
#     (wanakana converts) and submitted. A wrong/misheard utterance matches
#     no command, so nothing happens.
#   - "next"  → advance (also submits whatever is typed, i.e. plain Enter).
#   - "wrong" → the ONLY way to record a miss: on the result screen it
#     Backspace-toggles the grade; on the question screen it submits a
#     deliberate wrong answer to reveal the correct one.
#
# Reveal & Grade answering style (Settings > Reviews) works too:
#   "flip" reveals, "next"/"good" grades pass (1), "wrong"/"again" fails (2).
tag: user.bunpro_review
-
{user.bunpro_answer}: user.bunpro_answer(bunpro_answer)
answer <user.text>:
    insert(text)
    key(enter)
next: user.bunpro_next()
wrong: user.bunpro_wrong()

# Reveal & Grade mode
flip | reveal: key(enter)
good: key(1)
again: key(2)

# Result/question screen utilities (Bunpro's own shortcuts)
oops | undo [that]: key(backspace)
play audio | say it: key(a)
translate | show english: key(s)
show info | explain: key(i)
hide info: key(escape)
furigana: key(f)
wrap up: key(w)
quit session: key(q)
