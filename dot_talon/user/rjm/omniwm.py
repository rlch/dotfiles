import subprocess

from talon import Module

OMNIWMCTL = "/opt/homebrew/bin/omniwmctl"
mod = Module()


@mod.action_class
class Actions:
    def omniwm(command: str):
        """Run an omniwmctl command"""
        subprocess.run([OMNIWMCTL, *command.split()], capture_output=True, timeout=3)
