import subprocess

from talon import Context, Module

AEROSPACE = "/opt/homebrew/bin/aerospace"
# The named workspaces bound to ctrl-alt-1..8 in aerospace.toml.
DESKS = ["code", "browser", "notes", "comms", "notion", "dev", "trading", "agent"]

mod = Module()
mod.list("aerospace_desk", desc="Aerospace workspace names")
ctx = Context()
ctx.lists["user.aerospace_desk"] = {name: name for name in DESKS}


@mod.action_class
class Actions:
    def aerospace(command: str):
        """Run an aerospace command"""
        subprocess.run([AEROSPACE, *command.split()], capture_output=True, timeout=3)
