import subprocess

from talon import Context, Module

OMNIWMCTL = "/opt/homebrew/bin/omniwmctl"
# The workspaces bound to ctrl-alt-1..8 in ~/.config/omniwm/settings.toml, by display name.
DESKS = ["code", "browser", "notes", "comms", "notion", "dev", "trading", "agent"]

mod = Module()
mod.list("omniwm_desk", desc="OmniWM workspace names")
ctx = Context()
ctx.lists["user.omniwm_desk"] = {name: name for name in DESKS}


@mod.action_class
class Actions:
    def omniwm(command: str):
        """Run an omniwmctl command"""
        subprocess.run([OMNIWMCTL, *command.split()], capture_output=True, timeout=3)
