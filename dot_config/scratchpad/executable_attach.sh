#!/usr/bin/env bash
# Ghostty's `command` for the Scratch window — Scratch.app is a tmux
# client. tmuxinator owns the session layout (~/.config/tmuxinator/Scratch.yml).
# `start` is idempotent: it creates the session on first launch and
# attaches thereafter, so any windows the user added inside Scratch
# survive across spawns of Scratch.app.
#
# Socket isolation: tmuxinator's `socket_name:` in Scratch.yml puts the
# scratch session on the `scratch` tmux socket (`tmux -L scratch …`).
# That's a totally separate tmux server from the main socket, so the
# user's main session can never be focus-stolen, name-collided, or
# accidentally killed by anything happening here. Listing scratch
# sessions or sending commands also requires `-L scratch` — it's
# invisible from the main `tmux ls`.
#
# PATH bootstrap: Ghostty launches this script as a GUI command with
# `shell-integration = none`, so the user's fish/zsh rc files don't run
# and PATH is the macOS GUI default (/usr/bin:/bin:/usr/sbin:/sbin).
# /opt/homebrew/bin isn't on it, so `tmuxinator` resolves to "command not
# found". `brew shellenv` sets up PATH/MANPATH/INFOPATH the way an
# interactive shell would.
set -euo pipefail
if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi
exec tmuxinator start Scratch
