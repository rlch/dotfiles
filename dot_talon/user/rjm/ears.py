"""Talon's ears, replaced. An outside recogniser (the Talon HUD app, running
Parakeet) hears the phrase and sends it here; Talon runs it with mimic, as if
it had recognised the words itself. Talon's own model made four errors in
twelve utterances where Parakeet made one (2026-10-01).

~/.talon/ears.sock, one JSON object per line each way:
  -> {"say": "agent bat"}
  <- {"ok": true}  |  {"ok": false, "error": "asleep" | "not a command"}
  -> {"vocabulary": true}
  <- {"ok": true, "words": ["agent", "bat", ...]}
  -> {"commands": true}
  <- {"ok": true, "commands": [{"phrase": "agent bat", "dynamic": true,
                                "risky": false}, ...]}
  -> {"action": "listen_toggle"}      (a click in the HUD)
  -> {"action": "popup_open" | "popup_closed"}
  <- {"ok": true}

The vocabulary is every word the rjm commands can contain, so the recogniser
can snap a near miss ("health") onto a real word ("help") before giving up.
The commands are every phrase the rjm commands accept in the active app,
captures expanded, so the recogniser can match a whole misheard phrase:
`dynamic` marks one built from agent names or letters, which come and go and collide
with fixed words, and `risky` one it must only ever suggest, never run from
a guess.

A phrase that is not a command in the current context is refused, so nothing
is ever forced onto the nearest command.
"""

import json
import os
import re
import socket

from talon import actions, cron, registry, scope, ui

from .hud import popup

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


# Commands that close or stop something: the recogniser may suggest them
# from a near miss but never run them unasked.
RISKY = {"tab close", "pane close", "tree remove", "go to sleep", "agent reject", "agent stop"}
# Lists whose words come and go with the live agents.
DYNAMIC = {"user.herdr_word", "user.herdr_letter"}
# Apps a .talon header can name (ghostty.py), by bundle.
APPS = {"ghostty": "com.mitchellh.ghostty"}
TENS = "twenty thirty forty fifty sixty seventy eighty ninety".split()
ONES = NUMBERS[:19]
NUMBER_SMALL = ONES + [t if not o else f"{t} {o}" for t in TENS for o in [""] + ONES[:9]]


def expand(rule: str) -> list[tuple[str, bool]]:
    """Every phrase a rule accepts, each with whether it used a dynamic list.
    Handles (a | b), [optional], <number_small> and {lists}."""
    tokens = re.findall(r"\(|\)|\[|\]|\||<[^>]*>|\{[^}]*\}|[^\s()\[\]|<>{}]+", rule.strip("^$ "))

    def seq(i):
        """Alternatives up to a closing bracket: (list of (words, dynamic), next index)."""
        options, current = [], [((), False)]
        while i < len(tokens) and tokens[i] not in ")]":
            t = tokens[i]
            if t == "|":
                options += current
                current = [((), False)]
                i += 1
                continue
            if t in "([":
                inner, i = seq(i + 1)
                if t == "[":
                    inner = inner + [((), False)]
                i += 1
            elif t.startswith("<"):
                if t.strip("<>").removeprefix("user.") != "number_small":
                    raise ValueError(t)
                inner = [(tuple(n.split()), False) for n in NUMBER_SMALL]
                i += 1
            elif t.startswith("{"):
                name = t.strip("{}")
                spoken = registry.lists.get(name, [{}])[0]
                inner = [(tuple(w.split()), name in DYNAMIC) for w in spoken]
                i += 1
            else:
                inner = [((t,), False)]
                i += 1
            current = [(a + b, da or db) for a, da in current for b, db in inner]
        return options + current, i

    phrases, _ = seq(0)
    return [(" ".join(words), dynamic) for words, dynamic in phrases if words]


def commands() -> list[dict]:
    """Every rjm phrase active now: files for another app are left out."""
    bundle = ui.active_app().bundle
    found: dict[str, dict] = {}
    for name in sorted(os.listdir(HERE)):
        if not name.endswith(".talon"):
            continue
        with open(os.path.join(HERE, name)) as f:
            header, _, body = f.read().partition("\n-\n")
        apps = re.findall(r"^app:\s*(\S+)", header, re.M)
        if "tag:" in header or (apps and bundle not in {APPS.get(a) for a in apps}):
            continue
        for line in body.splitlines():
            if ":" not in line or line.startswith((" ", "#", "key(", "settings(")):
                continue
            try:
                phrases = expand(line.split(":")[0])
            except ValueError:
                continue
            for phrase, dynamic in phrases:
                found.setdefault(phrase, {"phrase": phrase, "dynamic": dynamic, "risky": phrase in RISKY})
    return list(found.values())


# What a click in the HUD may ask for, by name.
ACTIONS = {
    "listen_toggle": lambda: actions.user.listen_toggle(),
    "popup_open": lambda: popup(True),
    "popup_closed": lambda: popup(False),
}


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
                elif request.get("commands"):
                    reply = {"ok": True, "commands": commands()}
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
