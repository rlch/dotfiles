#!/usr/bin/env bash
# Two-stage popup orchestrator for the mosaic action picker.
#
# Stage 1 (the picker) is a tall popup hosting `mosaic _menu` — typing
# narrows the action list, Enter writes the chosen name to a temp file
# and the popup closes. Stage 2 reads that name and opens a *separate*
# shorter popup that runs `mosaic action -i <name> --background`. The
# size change is the whole point: the picker wants 22 rows so the menu
# fits, while a dialoguer prompt only needs 6 rows of pty space.
#
# Why two popups instead of one:
#   tmux's `display-popup` geometry is fixed for the lifetime of a
#   single invocation — there is no "resize the running popup" command.
#   Sequential popups are the only way to swap dimensions mid-flow.
#
# Invoked from the prefix-Ct binding's body. Stage 1 stores the pick
# at $picked_file; stage 2 (this script) reads + clears it. The file
# path is per-tmux-server (suffixed with the pid of `tmux #{pid}`) so
# concurrent tmux servers on the same machine don't collide.
set -eu

picked_file="/tmp/mosaic-picked-$(tmux display-message -p '#{pid}')"
[ -s "$picked_file" ] || exit 0

picked=$(cat "$picked_file")
rm -f "$picked_file"
[ -n "$picked" ] || exit 0

# Only open the prompt popup when the action has at least one
# required-but-missing arg. Otherwise dispatch directly: the popup
# would just flash open and close (dialoguer has nothing to ask),
# which the eye reads as a glitch.
#
# Detection trick: clap renders required args after `[OPTIONS]` on
# the Usage line. `Usage: ... [OPTIONS]` alone → no required args.
# `Usage: ... [OPTIONS] --foo <foo>` → at least one required arg.
# Cheaper and more accurate than grepping for the word "required",
# which appears in unrelated descriptions (e.g. `-i`'s help text).
# If parsing fails, fall through to the prompt popup — better to
# over-pop than miss a real prompt.
needs_prompt=$(
    mosaic action "$picked" --help 2>/dev/null \
    | awk '/^Usage:/ {
        # Anything after [OPTIONS] in the Usage line means a required arg.
        if ($0 ~ /\[OPTIONS\][[:space:]]+[^[:space:]]/) print "1"
        else print "0"
        exit
    }'
) || needs_prompt=1

if [ "$needs_prompt" = "0" ]; then
    # Direct dispatch — no popup. `-b` so the binding's tmux client
    # isn't blocked while the action runs.
    tmux run-shell -b "mosaic action $picked --background"
    exit 0
fi

# `-h 8` is the prompt-popup height: tight enough to feel like a
# context shift from the picker, tall enough to host dialoguer's
# prompt + the previous answer scrolling above. Width matches the
# picker so the visual anchor stays put. `-x R -y P` keeps the
# popup pinned to the prefix-key column.
exec tmux display-popup -B -x R -y P -w 50 -h 8 \
  -E "mosaic action -i $picked --background"
