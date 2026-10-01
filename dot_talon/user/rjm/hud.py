"""Feed the Talon HUD (~/dev/plugins/talon/hud), a Tauri overlay that draws
everything Talon would otherwise show in its own widgets.

One JSON object per line over ~/.talon/hud.sock. A send is fire-and-forget:
when the HUD is not running, Talon carries on unaffected.
"""

import json
import os
import re
import socket
import time

from talon import Module, actions, cron, scope, speech_system, ui

SOCK = os.path.expanduser("~/.talon/hud.sock")
# Every phrase Talon acted on, one JSON object per line: the record to read
# when a command "doesn't work".
PHRASE_LOG = os.path.expanduser("~/.talon/rjm-phrases.log")
HERE = os.path.dirname(__file__)
# Unchanged mode and screen are re-sent this often so a restarted HUD catches up.
RESEND_TICKS = 15

mod = Module()

last_mode = None
last_screen = None
ticks = 0


def send(event: dict):
    try:
        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
            s.settimeout(0.2)
            s.connect(SOCK)
            s.sendall((json.dumps(event) + "\n").encode())
    except OSError:
        pass


def listening() -> bool:
    return "sleep" not in (scope.get("mode") or set())


def on_phrase(j):
    words = j.get("phrase")
    # Asleep, Talon still hears everything; only what it acts on is shown.
    if not words or not listening():
        return
    text = " ".join(words)
    send({"type": "phrase", "text": text})
    try:
        app_name = ui.active_app().name
    except Exception:
        app_name = ""
    with open(PHRASE_LOG, "a") as f:
        f.write(json.dumps({"at": time.strftime("%F %T"), "app": app_name, "text": text}) + "\n")


def spoken_rule(rule: str) -> str:
    """A .talon rule as you would say it: "agent {user.herdr_word}" reads "agent <word>"."""
    rule = re.sub(r"[\^$]", "", rule).strip()
    rule = re.sub(r"\{user\.(?:\w+_)?(\w+)\}", r"<\1>", rule)
    return rule.replace("<number_small>", "<number>")


def cheat_sheet() -> list[dict]:
    """The rjm commands, read straight from the .talon files so the sheet
    cannot go stale. Ghostty-only files are left out elsewhere."""
    in_ghostty = ui.active_app().bundle == "com.mitchellh.ghostty"
    groups = []
    for name in sorted(os.listdir(HERE)):
        if not name.endswith(".talon"):
            continue
        with open(os.path.join(HERE, name)) as f:
            header, _, body = f.read().partition("\n-\n")
        if "app: ghostty" in header and not in_ghostty:
            continue
        rules = [
            spoken_rule(line.split(":")[0])
            for line in body.splitlines()
            if ":" in line and not line.startswith((" ", "#", "key(", "settings("))
        ]
        if rules:
            groups.append({"title": name[: -len(".talon")].replace("_", " "), "commands": rules})
    return groups


def tick():
    global last_mode, last_screen, ticks
    ticks += 1
    resend = ticks % RESEND_TICKS == 0

    modes = scope.get("mode") or set()
    mode = {
        "type": "mode",
        "listening": "sleep" not in modes,
        "mode": "dictation" if "dictation" in modes else "command",
    }
    if mode != last_mode or resend:
        last_mode = mode
        send(mode)

    # The HUD covers whichever screen holds the focused window.
    try:
        focused = ui.active_window().screen
    except Exception:
        # No active window (the desktop, or an app with none): keep the HUD
        # placed rather than leave it without a screen after a restart.
        focused = ui.main_screen()
    rect = focused.rect
    menubar = focused.visible_rect.y - rect.y
    screen = {
        "type": "screen",
        "x": rect.x,
        "y": rect.y,
        "width": rect.width,
        "height": rect.height,
        # The status pill sits in the menu bar; a tall one means a notch.
        "menubar": menubar,
    }
    if screen != last_screen or resend:
        last_screen = screen
        send(screen)


@mod.action_class
class Actions:
    def hud_widget(id: str, action: str):
        """Show, hide or toggle a HUD widget"""
        send({"type": "widget", "id": id, "action": action})

    def hud_help():
        """Toggle the cheat sheet of commands that apply here"""
        send({"type": "widget", "id": "help", "action": "toggle", "props": {"groups": cheat_sheet()}})

    def hud_notice(text: str):
        """Show a one-line notice in the HUD status pill"""
        send({"type": "notice", "text": text})


speech_system.register("phrase", on_phrase)
cron.interval("300ms", tick)
