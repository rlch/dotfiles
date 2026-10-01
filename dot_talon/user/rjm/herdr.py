"""herdr agent switching by voice, from any app.

Reads live state from the herdr CLI (it finds the default session socket on
its own, so it works outside a herdr pane) and focuses by pane ID. Numbers are
positions in `herdr agent list`, the same order the HUD's agents panel shows.
"""

import json
import os
import re
import subprocess
import time

from talon import Context, Module, actions, app, cron

from .hud import send

HERDR = "/opt/homebrew/bin/herdr"
RECORDINGS = os.path.expanduser("~/Documents/superwhisper/recordings")
# Superwhisper pastes and submits after it writes the result; leave it room.
TELL_SETTLE = "1500ms"
TELL_LIMIT_S = 300
PEEK_LINES = 40

mod = Module()
mod.list("herdr_word", desc="Every word in a live herdr agent's label")
ctx = Context()

agents: list[dict] = []
panel_open = False
previous_pane = ""
tell_job = None


def herdr(*args: str) -> dict:
    out = subprocess.run([HERDR, *args], capture_output=True, text=True, timeout=3)
    return json.loads(out.stdout)["result"]


def words(label: str) -> list[str]:
    return re.sub(r"[^a-z]+", " ", label.lower()).split()


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
    agents = found
    ctx.lists["user.herdr_word"] = {w: w for a in found for w in words(a["label"])}


def panel(show: bool, **props):
    global panel_open
    panel_open = show
    send(
        {
            "type": "widget",
            "id": "agents",
            "action": "show" if show else "hide",
            "props": props,
        }
    )


def focus(pane_id: str):
    global previous_pane
    here = next((a["pane_id"] for a in agents if a.get("focused")), "")
    if here and here != pane_id:
        previous_pane = here
    panel(False)
    actions.user.switcher_focus("Ghostty")
    subprocess.run([HERDR, "agent", "focus", pane_id], capture_output=True, timeout=3)


def numbered(number: int) -> dict | None:
    refresh()
    return agents[number - 1] if 1 <= number <= len(agents) else None


def worded(word: str) -> dict | None:
    """The one agent whose label has this word; several open the panel narrowed to them."""
    refresh()
    matches = [a for a in agents if word in words(a["label"])]
    if len(matches) > 1:
        panel(True, filter=word)
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
        """Show or hide the numbered list of herdr agents"""
        panel(not panel_open)

    def herdr_agents_status(status: str):
        """Show only the agents waiting on you, or only those working"""
        panel(True, status=status)

    def herdr_agent_number(number: int):
        """Focus the Nth herdr agent"""
        agent = numbered(number)
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

    def herdr_agent_peek(number: int):
        """Show the Nth agent's recent output in the HUD without switching"""
        agent = numbered(number)
        if agent is None:
            return
        out = subprocess.run(
            [HERDR, "agent", "read", agent["pane_id"], "--source", "visible"],
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
                "props": {"title": f"{number} · {agent['label']}", "text": text},
            }
        )

    def herdr_tab(number: int):
        """Jump to the Nth herdr tab (herdr binds ctrl-1 to ctrl-9)"""
        if 1 <= number <= 9:
            actions.key(f"ctrl-{number}")

    def herdr_tell_number(number: int):
        """Dictate a prompt to the Nth agent and come back"""
        tell(numbered(number))

    def herdr_tell_word(word: str):
        """Dictate a prompt to the agent whose label has this word and come back"""
        tell(worded(word))


app.register("ready", refresh)
cron.interval("10s", refresh)
