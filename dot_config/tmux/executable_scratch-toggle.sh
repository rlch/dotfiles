#!/bin/sh
# Toggle the focused tmux client between the `scratch` session and the
# previously-attached session. Bound at tmux root to C-S-g (tmux.conf);
# triggered by a Globe (fn) / Moonlander caps-lock tap when Ghostty is
# frontmost — Karabiner emits Ctrl+Shift+G in that condition, Ghostty
# routes it via CSI-u, tmux runs us.
#
# Creates the session on first use via tmuxinator (Scratch.yml lives on
# the default socket — no more `-L scratch`), so the very first tap from
# a fresh tmux server works the same as subsequent toggles.
#
# Runs inside `run-shell`, so $TMUX is set and we can use bare tmux
# commands; brew shellenv is added defensively so tmuxinator resolves
# even when this script is invoked outside an interactive shell.
set -eu

if [ -x /opt/homebrew/bin/brew ]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [ -x /usr/local/bin/brew ]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

if ! tmux has-session -t scratch 2>/dev/null; then
  tmuxinator start Scratch --no-attach
fi

current=$(tmux display-message -p '#S')
if [ "$current" = "scratch" ]; then
  # `switch-client -l` flips back to the previously-attached session.
  tmux switch-client -l
else
  tmux switch-client -t scratch
fi
