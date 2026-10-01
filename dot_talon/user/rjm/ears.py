"""Talon's ears, replaced. An outside recogniser (the Talon HUD app, running
Parakeet) hears the phrase and sends it here; Talon runs it with mimic, as if
it had recognised the words itself. Talon's own model made four errors in
twelve utterances where Parakeet made one (2026-10-01).

~/.talon/ears.sock, one JSON object per line each way:
  -> {"say": "agent seven"}
  <- {"ok": true}  |  {"ok": false, "error": "asleep" | "not a command"}
  -> {"vocabulary": true}
  <- {"ok": true, "words": ["agent", "seven", ...]}
  -> {"action": "listen_toggle"}      (a click in the HUD)
  <- {"ok": true}

The vocabulary is every word the rjm commands can contain, so the recogniser
can snap a near miss ("health") onto a real word ("help") before giving up.

A phrase that is not a command in the current context is refused, so nothing
is ever forced onto the nearest command.
"""

import json
import os
import re
import socket

from talon import actions, cron, registry, scope

SOCK = os.path.expanduser("~/.talon/ears.sock")

try:
    os.unlink(SOCK)
except FileNotFoundError:
    pass
server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
server.bind(SOCK)
server.listen(4)
server.setblocking(False)


HERE = os.path.dirname(__file__)
NUMBERS = (
    "one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
    "fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty"
).split()


def vocabulary() -> list[str]:
    words = set(NUMBERS)
    for name in os.listdir(HERE):
        if not name.endswith(".talon"):
            continue
        with open(os.path.join(HERE, name)) as f:
            _, _, body = f.read().partition("\n-\n")
        for line in body.splitlines():
            if ":" in line and not line.startswith((" ", "#", "key(", "settings(")):
                rule = re.sub(r"<[^>]*>|\{[^}]*\}", " ", line.split(":")[0])
                words.update(re.findall(r"[a-z]+", rule))
    for name, values in registry.lists.items():
        if name.startswith("user.herdr_") or name.startswith("user.aerospace_"):
            for spoken in values[0]:
                words.update(spoken.split())
    return sorted(words)


# What a click in the HUD may ask for, by name.
ACTIONS = {"listen_toggle": lambda: actions.user.listen_toggle()}


def say(text: str) -> dict:
    if "sleep" in (scope.get("mode") or set()):
        return {"ok": False, "error": "asleep"}
    try:
        actions.mimic(text)
    except Exception:
        return {"ok": False, "error": "not a command"}
    return {"ok": True}


def poll():
    """Polled from cron, not a thread: cron jobs are torn down when this file
    reloads, and mimic has to run on Talon's main thread anyway."""
    while True:
        try:
            conn, _ = server.accept()
        except BlockingIOError:
            return
        with conn:
            conn.settimeout(0.2)
            try:
                request = json.loads(conn.makefile().readline())
                if request.get("vocabulary"):
                    reply = {"ok": True, "words": vocabulary()}
                elif request.get("action") in ACTIONS:
                    ACTIONS[request["action"]]()
                    reply = {"ok": True}
                else:
                    reply = say(str(request["say"]))
            except (OSError, ValueError, KeyError):
                reply = {"ok": False, "error": "bad request"}
            try:
                conn.sendall((json.dumps(reply) + "\n").encode())
            except OSError:
                pass


cron.interval("30ms", poll)
