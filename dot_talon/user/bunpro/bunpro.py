"""Bunpro (bunpro.jp) voice control for Talon.

Three layers:

1. Site tag `user.bunpro` — active whenever Firefox is on bunpro.jp
   (matched via `browser.host`, with a window-title fallback since
   Firefox URL detection on macOS rides the accessibility tree).
2. Review tag `user.bunpro_review` — active during a Reviews/Cram
   session (title-based), scoping the quiz commands (next / wrong /
   audio / info / ...).
3. Answer verification — the bridge userscript (bunpro-bridge.user.js)
   appends a marker to document.title:

       «BP:<phase>:<answer1>|<answer2>»

   phase is `q` (question shown, awaiting answer) or `r` (result
   screen). Answers are the accepted kana/kanji fills for the current
   blank. This module watches the active window title, converts each
   answer to romaji spoken forms, and publishes them as the dynamic
   list {user.bunpro_answer}. Saying a listed answer types it (Bunpro's
   wanakana input converts romaji, kana passes through) and submits.
   Anything you say that is NOT an accepted answer matches no command,
   so nothing happens — by design the only way to mark an item wrong
   is the explicit "wrong" command.
"""

import re

from talon import Context, Module, actions, ui

mod = Module()
mod.tag("bunpro", desc="Active when the browser is on bunpro.jp")
mod.tag("bunpro_review", desc="Active during a Bunpro review/cram session")
mod.list("bunpro_answer", desc="Accepted answers for the current Bunpro question")

# --- Context wiring ---------------------------------------------------------

# Primary: URL-based match (works in Firefox/mac via community's AXWebArea
# browser.address provider, needs Talon's Accessibility permission).
ctx_host = Context()
ctx_host.matches = r"""
tag: browser
browser.host: bunpro.jp
"""
ctx_host.tags = ["user.bunpro"]

# Fallback: every Bunpro page <title> contains "Bunpro". Keeps the tag alive
# when AX URL reading is flaky.
ctx_title = Context()
ctx_title.matches = r"""
app: firefox
win.title: /Bunpro/
"""
ctx_title.tags = ["user.bunpro"]

# Review session: SPA titles are "Reviews | Bunpro" / "Cram | Bunpro"; the
# bridge marker «BP:...» is also only present mid-session.
ctx_review = Context()
ctx_review.matches = r"""
app: firefox
win.title: /(Reviews|Cram|Study).*Bunpro|«BP:/
"""
ctx_review.tags = ["user.bunpro", "user.bunpro_review"]

# Dynamic answer list lives in its own context so updates never touch the
# static ones above.
ctx_answers = Context()
ctx_answers.matches = r"""
app: firefox
win.title: /«BP:/
"""

# --- Bridge title parsing ---------------------------------------------------

BRIDGE_RE = re.compile(r"«BP:(q|r):([^»]*)»")

# Kana → Hepburn-ish romaji, longest-match-first. Enough for grammar answers;
# the typed value is always the original kana, so lossy romanization only
# affects the *spoken* form.
_KANA = {
    "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo", "しゃ": "sha", "しゅ": "shu",
    "しょ": "sho", "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho", "にゃ": "nya",
    "にゅ": "nyu", "にょ": "nyo", "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
    "みゃ": "mya", "みゅ": "myu", "みょ": "myo", "りゃ": "rya", "りゅ": "ryu",
    "りょ": "ryo", "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo", "じゃ": "ja",
    "じゅ": "ju", "じょ": "jo", "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
    "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "wo", "ん": "n",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    "ー": "-",
}
_SORTED_KANA = sorted(_KANA, key=len, reverse=True)


def _kata_to_hira(text: str) -> str:
    return "".join(
        chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in text
    )


def _to_romaji(kana: str) -> str:
    text = _kata_to_hira(kana)
    out = []
    i = 0
    while i < len(text):
        if text[i] == "っ" and i + 1 < len(text):
            nxt = _first_romaji(text[i + 1 :])
            out.append(nxt[0] if nxt else "")
            i += 1
            continue
        for k in _SORTED_KANA:
            if text.startswith(k, i):
                out.append(_KANA[k])
                i += len(k)
                break
        else:
            # Kanji or anything unmapped: keep as-is (unpronounceable for
            # the engine, but the typed value is unaffected).
            out.append(text[i])
            i += 1
    return "".join(out)


def _first_romaji(rest: str) -> str:
    for k in _SORTED_KANA:
        if rest.startswith(k):
            return _KANA[k]
    return ""


def _spoken_forms(kana: str) -> list[str]:
    """Spoken-form variants for one accepted answer.

    The English Conformer engine has never heard Japanese, so offer both the
    fused romaji ("teimasu") and syllable-spaced ("te i ma su") forms and let
    recognition meet us halfway.
    """
    romaji = _to_romaji(kana)
    if not romaji or not romaji.isascii():
        return []
    forms = {romaji}
    syllables = re.findall(r"[bcdfghjkmnprstwyz]*[aeiou-]|n", romaji)
    if syllables and "".join(syllables) == romaji:
        forms.add(" ".join(syllables))
    return [f.replace("-", "") for f in forms]


# Phase of the current question per the bridge: "q", "r", or "" (no bridge).
_phase = ""
_have_answers = False


def _on_title(win):
    global _phase, _have_answers
    try:
        if win != ui.active_window():
            return
        title = win.title
    except Exception:
        return
    m = BRIDGE_RE.search(title or "")
    if not m:
        if _phase or _have_answers:
            _phase = ""
            _have_answers = False
            ctx_answers.lists["user.bunpro_answer"] = {}
        return
    _phase = m.group(1)
    answers = [a for a in m.group(2).split("|") if a]
    spoken = {}
    for kana in answers:
        for form in _spoken_forms(kana):
            spoken[form] = kana
    _have_answers = bool(spoken)
    ctx_answers.lists["user.bunpro_answer"] = spoken


ui.register("win_title", _on_title)
ui.register("win_focus", _on_title)


# --- Actions ----------------------------------------------------------------


@mod.action_class
class Actions:
    def bunpro_open(path: str):
        """Open a bunpro.jp path in the browser"""
        actions.user.open_url(f"https://bunpro.jp/{path}")

    def bunpro_answer(answer: str):
        """Type a verified-correct answer into the review input and submit"""
        actions.insert(answer)
        actions.sleep("100ms")
        actions.key("enter")

    def bunpro_next():
        """Advance to the next question (submit/continue)"""
        actions.key("enter")

    def bunpro_wrong():
        """Explicitly mark the current item wrong.

        On the result screen (phase r) Bunpro's Backspace toggles the
        recorded grade, so a correct submission becomes a miss. On the
        question screen (phase q) submit a deliberately wrong answer so
        Bunpro records the miss and reveals the correct one. Without the
        bridge, fall back to the Backspace toggle.
        """
        if _phase == "q":
            actions.insert("わからない")
            actions.sleep("100ms")
            actions.key("enter")
        else:
            actions.key("backspace")
