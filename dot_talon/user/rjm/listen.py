"""When Talon listens, and to how much.

- Talon starts asleep; the F17 key (listen.talon) is the way in.
- Awake, it runs in `user.lean` mode: only the rjm commands are live, so
  community's alphabet and symbols cannot type stray characters into an agent
  ("sit", "star" and "pit" all did, 2026-10-01). Apps in FULL_APPS get the
  whole community grammar instead.
- While Superwhisper records, the Talon HUD app stops hearing commands by
  itself (it watches Superwhisper's microphone), so Talon stays awake.
"""

import os
import subprocess

from talon import Module, actions, app, cron, scope, ui

# Bundle IDs that get the whole community grammar. Empty until Rango is
# installed in Firefox: its hints are spelled with community's alphabet, so
# "org.mozilla.firefox" belongs here then. Until then full grammar in the
# browser only types stray characters ("coma" typed a comma, 2026-10-01).
FULL_APPS: set[str] = set()
SOUNDS = os.path.join(os.path.dirname(__file__), "sounds")

mod = Module()
mod.mode("lean", desc="Only the rjm command set; community's grammar is off")

forced_full = False


def modes() -> set:
    return scope.get("mode") or set()


def awake() -> bool:
    return "sleep" not in modes()


def enforce():
    """Hold the mode invariant whatever woke or slept Talon."""
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


@mod.action_class
class Actions:
    def listen_toggle():
        """Wake or sleep Talon"""
        actions.speech.toggle()
        enforce()
        chime = "on.wav" if awake() else "off.wav"
        subprocess.Popen(["/usr/bin/afplay", os.path.join(SOUNDS, chime)])

    def listen_full(full: bool):
        """Force the whole community grammar on, or go back to lean-by-app"""
        global forced_full
        forced_full = full
        enforce()
        actions.user.hud_notice("full grammar" if full else "lean grammar")


def on_ready():
    actions.speech.disable()
    # The Talon HUD app hears for Talon now (Parakeet, through ears.py), so
    # Talon's own recogniser gets no audio. To go back, pick the microphone
    # again from Talon's menu.
    actions.sound.set_microphone("None")
    cron.interval("200ms", enforce)


app.register("ready", on_ready)
