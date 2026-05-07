function tmux-send --description 'send-keys to a tmux pane and mark its window as agent-driven'
    # Wraps `tmux send-keys` so the parent window of the target pane gets a
    # visible "an agent is acting here" indicator.
    #
    # Sets @agent on the target pane's WINDOW (tab-scoped per the user's
    # design call: "we wont have multiple different agents acting on the
    # same tab"); writes a deadline timestamp into @agent-ts. Triggers a
    # window rename so slugify-title.py re-runs and prepends the agent
    # glyph (nf-md-creation, U+F0674) to the window name. The glyph
    # propagates to Ghostty's tab title and tmux's window list because
    # both render #W.
    #
    # Auto-clear: @agent-ts is a deadline (now + 30s). A backgrounded
    # timer waits 30s, re-reads @agent-ts, and only clears if the
    # deadline has actually passed — so a newer send (with later
    # deadline) keeps the indicator alive without needing the timer to
    # cancel.
    #
    # Usage:
    #   tmux-send <target-pane> <key-or-string> [more keys...]
    #
    # Honours TMUX_SEND_AGENT for the agent name (default: claude).

    if test (count $argv) -lt 2
        echo "usage: tmux-send <target-pane> <keys...>" >&2
        return 1
    end

    set -l target $argv[1]
    set -l rest $argv[2..]

    set -l agent_name $TMUX_SEND_AGENT
    test -z "$agent_name"; and set agent_name claude

    set -l win (tmux display-message -p -t $target '#{window_id}' 2>/dev/null)
    if test -z "$win"
        echo "tmux-send: no such pane: $target" >&2
        return 1
    end

    set -l now (date +%s)
    set -l deadline (math "$now + 30")

    # Status-right's mauve "action" segment is wrapper-only by design — the
    # Claude Code hook deliberately does NOT write @agent-action to keep
    # the segment from spamming on every tool call. The wrapper writes a
    # short label of what it just sent.
    set -l label (string join ' ' $rest | string sub -l 25)
    test -z "$label"; and set label "(send-keys)"

    tmux set-option -w -t $win @agent        "$agent_name" >/dev/null
    tmux set-option -w -t $win @agent-action "$label"      >/dev/null
    tmux set-option -w -t $win @agent-ts     "$deadline"   >/dev/null

    set -l current (tmux display-message -p -t $win '#W' 2>/dev/null)
    tmux rename-window -t $win -- "$current" 2>/dev/null

    tmux send-keys -t $target $rest

    fish -c "
        sleep 30
        set -l ts (tmux show-options -wv -t $win @agent-ts 2>/dev/null)
        if test -z \"\$ts\"; exit; end
        set -l now2 (date +%s)
        if test \$now2 -ge \$ts
            tmux set-option -wu -t $win @agent 2>/dev/null
            tmux set-option -wu -t $win @agent-action 2>/dev/null
            tmux set-option -wu -t $win @agent-ts 2>/dev/null
            set -l name (tmux display-message -p -t $win '#W' 2>/dev/null)
            and tmux rename-window -t $win -- \"\$name\" 2>/dev/null
        end
    " >/dev/null 2>&1 &
    disown
end
