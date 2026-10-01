"""Ending a Superwhisper dictation by voice.

"dispatch", said alone while Superwhisper records, stops the recording and
sends what was dictated. The HUD app hears the word (it is the one phrase it
listens for during a dictation) and asks for this through ears.py.

Superwhisper transcribes the word too, so once it has pasted, the word is
taken back off the end before Enter is pressed.
"""

import json
import os
import re
import time

from talon import actions, cron

RECORDINGS = os.path.expanduser("~/Documents/superwhisper/recordings")
# "dispatch" as Superwhisper writes it at the end of a dictation, with the
# space before it and any punctuation after.
TRAILING = re.compile(r"\s*\bdispatch\b[\s.!?,]*$", re.IGNORECASE)
# Superwhisper writes the result, then pastes it.
PASTE_SETTLE = "500ms"
GIVE_UP_S = 60

job = None


def newest_recording() -> str | None:
    try:
        return max(os.scandir(RECORDINGS), key=lambda e: e.stat().st_birthtime).path
    except (OSError, ValueError):
        return None


def result_of(folder: str) -> str:
    try:
        with open(os.path.join(folder, "meta.json")) as f:
            return json.load(f).get("result") or ""
    except (OSError, ValueError):
        return ""


def finish(text: str):
    match = TRAILING.search(text)
    if match and match.group():
        actions.key(f"backspace:{len(match.group())}")
    actions.key("enter")


def dispatch():
    """Stop the recording in progress, then send it once it has been pasted."""
    global job
    folder = newest_recording()
    # A recording in progress has no meta.json yet. Without one there is
    # nothing to send, and F18 would start a recording instead of ending one.
    if folder is None or os.path.exists(os.path.join(folder, "meta.json")):
        return
    started = time.time()
    actions.key("f18")

    def poll():
        global job
        text = result_of(folder)
        if not text and time.time() - started < GIVE_UP_S:
            return
        cron.cancel(job)
        job = None
        if text:
            cron.after(PASTE_SETTLE, lambda: finish(text))

    if job:
        cron.cancel(job)
    job = cron.interval("200ms", poll)
