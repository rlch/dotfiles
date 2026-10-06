"""herdr agent switching by voice, from any app.

Reads live state from the herdr CLI (it finds the default session socket on
its own, so it works outside a herdr pane) and focuses by pane ID. Agents are
named by letter: the agent-tags herdr plugin (~/dev/plugins/herdr/agent-tags)
gives each a sticky one as the pane token `letter`, the same letter herdr's
sidebar and the HUD show, and it is said in the Talon alphabet ("agent bat").
"""

import json
import os
import re
import subprocess
import time

from talon import Context, Module, actions, app, cron, registry

from .hud import send

HERDR = "/opt/homebrew/bin/herdr"
RECORDINGS = os.path.expanduser("~/Documents/superwhisper/recordings")
# Superwhisper pastes and submits after it writes the result; leave it room.
TELL_SETTLE = "1500ms"
TELL_LIMIT_S = 300
PEEK_LINES = 40

# herdr's agent panel under agent_panel_sort = "priority": attention first,
# newest state change breaking ties (src/ui/sidebar.rs, workspace_attention_priority).
PRIORITY = {"blocked": 4, "done": 3, "working": 2, "idle": 1, "unknown": 0}

# community's alphabet, in case its list is not loaded yet.
ALPHABET = "air bat cap drum each fine gust harp sit jury crunch look made near odd pit quench red sun trap urge vest whale plex yank zip".split()

FILLER = set(
    "the and for from with its their what when only every this that are was not you your".split()
)

mod = Module()
mod.list("herdr_word", desc="Every word in a live herdr agent's label")
mod.list("herdr_letter", desc="Every live herdr agent's letter, in the Talon alphabet")
ctx = Context()

agents: list[dict] = []
previous_pane = ""
tell_job = None


def herdr(*args: str) -> dict:
    out = subprocess.run([HERDR, *args], capture_output=True, text=True, timeout=3)
    return json.loads(out.stdout)["result"]


def words(label: str) -> list[str]:
    return re.sub(r"[^a-z]+", " ", label.lower()).split()


def alphabet() -> dict[str, str]:
    """Letter -> its spoken word, from community's user.letter list."""
    try:
        spoken = registry.lists["user.letter"][-1]
        words = {letter: word for word, letter in spoken.items() if " " not in word}
        if len(words) == 26:
            return words
    except (KeyError, IndexError):
        pass
    return dict(zip("abcdefghijklmnopqrstuvwxyz", ALPHABET))


def sayable(word: str) -> bool:
    """Worth registering as a way to name an agent. Talon has to pick some
    command for whatever it hears, so every filler word is a wrong target:
    "agent previous" became "agent prs" (from land-open-prs, 2026-10-01)."""
    return len(word) >= 3 and word not in FILLER and any(v in word for v in "aeiouy")


def refresh():
    global agents
    try:
        labels = {
            w["workspace_id"]: w.get("label") or ""
            for w in herdr("workspace", "list")["workspaces"]
        }
        found = herdr("agent", "list")["agents"]
    except Exception:
        # herdr not running; keep the last known list.
        return
    for a in found:
        name = a.get("display_agent")
        # Same naming rule as the HUD (src-tauri/src/lib.rs).
        a["label"] = labels.get(a["workspace_id"], "") if name in (None, "main") else name
        a["letter"] = a.get("tokens", {}).get("letter", "")
    agents = found
    spoken = alphabet()
    letters = {
        " ".join(spoken[c] for c in a["letter"]): a["letter"]
        for a in found
        if a["letter"] and all(c in spoken for c in a["letter"])
    }
    # The letters themselves too: Parakeet writes a spoken "q" as "Q", which the
    # HUD sends as "agent q", not as the alphabet word.
    letters.update({" ".join(a["letter"]): a["letter"] for a in found if a["letter"]})
    ctx.lists["user.herdr_letter"] = letters
    # A label word that is also a letter's word would make "agent red" mean two agents.
    taken = set(spoken.values())
    ctx.lists["user.herdr_word"] = {
        w: w for a in found for w in words(a["label"]) if sayable(w) and w not in taken
    }


def panel(action: str, **props):
    """Show, hide or toggle the agents panel. The HUD owns whether it is open:
    opening another panel closes it without Talon hearing about it."""
    send({"type": "widget", "id": "agents", "action": action, "props": props})


def focus(pane_id: str):
    global previous_pane
    here = next((a["pane_id"] for a in agents if a.get("focused")), "")
    if here and here != pane_id:
        previous_pane = here
    panel("hide")
    actions.user.switcher_focus("Ghostty")
    # `agent focus` alone only marks the pane focused inside its workspace;
    # the screen stays where it was. The workspace and tab have to be focused
    # too (2026-10-01: "agent seven" was heard and did nothing visible).
    target = next((a for a in agents if a["pane_id"] == pane_id), None)
    steps = [["agent", "focus", pane_id]]
    if target:
        steps = [
            ["workspace", "focus", target["workspace_id"]],
            ["tab", "focus", target["tab_id"]],
        ] + steps
    for step in steps:
        subprocess.run([HERDR, *step], capture_output=True, timeout=3)


def lettered(letter: str) -> dict | None:
    refresh()
    return next((a for a in agents if a["letter"] == letter), None)


def worded(word: str) -> dict | None:
    """The one agent whose label has this word; several open the panel narrowed to them."""
    refresh()
    matches = [a for a in agents if word in words(a["label"])]
    if len(matches) > 1:
        panel("show", filter=word)
    return matches[0] if len(matches) == 1 else None


def tell(agent: dict | None):
    """Dictate to an agent, then return: Superwhisper pastes and submits into
    whatever is focused, so go there, record, and come back once it is done."""
    global tell_job
    if agent is None:
        return
    focus(agent["pane_id"])
    started = time.time()
    actions.key("f18")

    def poll():
        global tell_job
        done = time.time() - started > TELL_LIMIT_S
        for entry in os.scandir(RECORDINGS):
            if entry.stat().st_birthtime < started:
                continue
            try:
                with open(os.path.join(entry.path, "meta.json")) as f:
                    done = done or bool(json.load(f).get("result"))
            except (OSError, ValueError):
                pass
        if done:
            cron.cancel(tell_job)
            tell_job = None
            cron.after(TELL_SETTLE, actions.user.herdr_agent_back)

    if tell_job:
        cron.cancel(tell_job)
    tell_job = cron.interval("500ms", poll)


@mod.action_class
class Actions:
    def herdr_agents_toggle():
        """Show or hide the lettered list of herdr agents"""
        panel("toggle")

    def herdr_agents_status(status: str):
        """Show only the agents waiting on you, or only those working"""
        panel("show", status=status)

    def herdr_agent_letter(letter: str):
        """Focus the herdr agent with this letter"""
        agent = lettered(letter)
        if agent:
            focus(agent["pane_id"])

    def herdr_agent_word(word: str):
        """Focus the agent whose label has this word"""
        agent = worded(word)
        if agent:
            focus(agent["pane_id"])

    def herdr_agent_ready():
        """Focus the next agent waiting on you: blocked first, then done"""
        refresh()
        for status in ("blocked", "done"):
            for a in agents:
                if a["agent_status"] == status and not a.get("focused"):
                    focus(a["pane_id"])
                    return
        actions.user.hud_notice("no agent is waiting")

    def herdr_agent_latest():
        """Focus the agent at the top of herdr's priority queue"""
        refresh()
        queue = sorted(
            (a for a in agents if not a.get("focused")),
            key=lambda a: (PRIORITY.get(a["agent_status"], 0), a.get("state_change_seq", 0)),
            reverse=True,
        )
        if queue:
            focus(queue[0]["pane_id"])

    def herdr_agent_back():
        """Return to the agent focused before the last jump"""
        refresh()
        if previous_pane:
            focus(previous_pane)

    def herdr_agent_status():
        """Say how many agents are waiting and working"""
        refresh()
        count = lambda s: sum(a["agent_status"] == s for a in agents)
        actions.user.hud_notice(
            f"{count('blocked')} need you · {count('done')} done · {count('working')} working"
        )

    def herdr_agent_peek(letter: str):
        """Show an agent's recent output in the HUD without switching"""
        agent = lettered(letter)
        if agent is None:
            return
        out = subprocess.run(
            [HERDR, "agent", "read", agent["pane_id"], "--source", "visible", "--format", "ansi"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        text = "\n".join(out.stdout.rstrip().splitlines()[-PEEK_LINES:])
        send(
            {
                "type": "widget",
                "id": "peek",
                "action": "show",
                "props": {"title": f"{letter} · {agent['label']}", "text": text},
            }
        )

    def herdr_tab(number: int):
        """Jump to the Nth herdr tab (herdr binds ctrl-1 to ctrl-9)"""
        if 1 <= number <= 9:
            actions.key(f"ctrl-{number}")

    def herdr_tell_letter(letter: str):
        """Dictate a prompt to the agent with this letter and come back"""
        tell(lettered(letter))

    def herdr_tell_word(word: str):
        """Dictate a prompt to the agent whose label has this word and come back"""
        tell(worded(word))


app.register("ready", refresh)
cron.interval("10s", refresh)
