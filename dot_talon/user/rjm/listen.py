"""When Talon listens, and to how much.

- Talon starts asleep; the F17 key (listen.talon) is the way in.
- Awake, it runs in `user.lean` mode: only the rjm commands are live, so
  community's alphabet and symbols cannot type stray characters into an agent
  ("sit", "star" and "pit" all did, 2026-10-01). Apps in FULL_APPS get the
  whole community grammar instead.
- While Superwhisper records, Talon sleeps, so dictated prose never runs as
  commands. Superwhisper creates recordings/<id>/ when a recording starts and
  writes meta.json into it when the recording stops.
"""

import os
import time

from talon import Module, actions, app, cron, scope, ui

RECORDINGS = os.path.expanduser("~/Documents/superwhisper/recordings")
# Bundle IDs that get the whole community grammar. Empty until Rango is
# installed in Firefox: its hints are spelled with community's alphabet, so
# "org.mozilla.firefox" belongs here then. Until then full grammar in the
# browser only types stray characters ("coma" typed a comma, 2026-10-01).
FULL_APPS: set[str] = set()
# A recording Superwhisper cancelled may never write meta.json.
DICTATION_LIMIT_S = 300

mod = Module()
mod.mode("lean", desc="Only the rjm command set; community's grammar is off")

forced_full = False
dictation: tuple[str, float] | None = None  # (recording dir, started) while asleep for it
recordings_mtime: float | None = None


def modes() -> set:
    return scope.get("mode") or set()


def awake() -> bool:
    return "sleep" not in modes()


def enforce():
    """Hold the mode invariant whatever woke or slept Talon."""
    global dictation
    if dictation and time.time() - dictation[1] > DICTATION_LIMIT_S:
        dictation = None
        actions.speech.enable()

    now = modes()
    if "sleep" in now:
        if "user.lean" in now:
            actions.mode.disable("user.lean")
        return
    if "dictation" in now:
        return
    try:
        full = forced_full or ui.active_app().bundle in FULL_APPS
    except Exception:
        full = forced_full
    if full != ("command" in now):
        (actions.mode.enable if full else actions.mode.disable)("command")
    if full == ("user.lean" in now):
        (actions.mode.disable if full else actions.mode.enable)("user.lean")


def watch_superwhisper():
    """Polled, not fs.watch: Talon's watcher indexes the whole tree first, and
    thousands of recordings stalled it for seconds (2026-10-01). The folder's
    mtime moves when a recording starts, so a tick costs one stat."""
    global dictation, recordings_mtime
    if dictation:
        folder = dictation[0]
        if os.path.exists(os.path.join(folder, "meta.json")) or not os.path.exists(folder):
            dictation = None
            actions.speech.enable()
        return
    try:
        mtime = os.stat(RECORDINGS).st_mtime
    except OSError:
        return
    if mtime == recordings_mtime:
        return
    first_look = recordings_mtime is None
    recordings_mtime = mtime
    if first_look or not awake():
        return
    newest = max(os.scandir(RECORDINGS), key=lambda e: e.stat().st_birthtime, default=None)
    if (
        newest
        and time.time() - newest.stat().st_birthtime < 10
        and not os.path.exists(os.path.join(newest.path, "meta.json"))
    ):
        dictation = (newest.path, time.time())
        actions.speech.disable()


def tick():
    watch_superwhisper()
    enforce()


@mod.action_class
class Actions:
    def listen_toggle():
        """Wake or sleep Talon"""
        global dictation
        dictation = None
        actions.speech.toggle()
        enforce()

    def listen_full(full: bool):
        """Force the whole community grammar on, or go back to lean-by-app"""
        global forced_full
        forced_full = full
        enforce()
        actions.user.hud_notice("full grammar" if full else "lean grammar")


def on_ready():
    actions.speech.disable()
    cron.interval("200ms", tick)


app.register("ready", on_ready)
