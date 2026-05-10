#!/usr/bin/env bash
# Dispatch a tmux status-bar click for `range=user|<arg>` regions.
#
# Wired to MouseDown1Status in tmux.conf. The binding tests for native
# range types (`window`) first and lets tmux's `select-window -t =`
# handle those; everything that falls through is a user-arg range and
# lands here as $1.
#
# Why a helper instead of inline format substitution: tmux commands
# (switch-client, display-menu, etc.) do NOT expand `#{...}` format
# specifiers in their argument strings — only `run-shell` and
# `display-message` do. So a binding like
# `switch-client -t '#{s/...:mouse_status_range}'` tries to find a
# session literally named `#{...}` and errors out. Routing through
# `run-shell -b "tmux-mouse-status.sh '#{q:mouse_status_range}'"`
# expands the format at the run-shell layer, which the helper then
# parses cleanly with bash pattern matching.

set -eu

range="${1:-}"

case "$range" in
    tmux_ports)
        # Pipe `display-menu` argv to sh so the user can dismiss/select
        # without entering a key table. tmux-ports.sh emits a single
        # `tmux display-menu …` line; we exec it.
        ~/.config/tmux/tmux-ports.sh menu | sh
        ;;
    session:*)
        tmux switch-client -t "${range#session:}"
        ;;
esac
