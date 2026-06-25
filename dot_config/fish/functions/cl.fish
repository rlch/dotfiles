function cl --wraps claude --description 'clodcurrent: launch best free account; --ide; model shortcuts; restores tmux title'
    # Translate model shortcuts into `--model <id>` (passed through to claude).
    # opus/fable are pinned to the 1M-context ([1m]) variants; sonnet/haiku use
    # claude's own "latest" aliases so they auto-track releases. Bump opus/fable
    # here when a newer 1M model ships.
    set -l args
    for a in $argv
        switch $a
            case --opus
                set -a args --model 'claude-opus-4-8[1m]'
            case --fable
                set -a args --model 'claude-fable-5[1m]'
            case --sonnet
                set -a args --model sonnet
            case --haiku
                set -a args --model haiku
            case '*'
                set -a args $a
        end
    end

    # clodcurrent picks the highest-quota account not already running in another
    # pane, then exec's `claude` with CLAUDE_CONFIG_DIR set. `--ide` and the rest
    # pass straight through. Falls back to plain `claude` if clodcurrent is absent.
    set -l runner clodcurrent
    command -q clodcurrent; or set runner claude

    # In a cmux pane (CMUX_SURFACE_ID is exported by cmux), route the launch
    # through `cmux omc` so OMC team mode + agent panes become native cmux
    # splits. clodcurrent honors CLODCURRENT_LAUNCHER — it still picks the best
    # account and sets CLAUDE_CONFIG_DIR, then exec's the launcher instead of
    # claude. Without clodcurrent, invoke `cmux omc` directly. Outside cmux
    # (plain terminal, real tmux, ssh), nothing changes.
    if set -q CMUX_SURFACE_ID
        if test "$runner" = clodcurrent
            set -fx CLODCURRENT_LAUNCHER 'cmux omc'
        else
            set runner cmux omc
        end
    end

    if set -q TMUX
        set -l prev (tmux display-message -p '#W')
        $runner --ide $args
        set -l rc $status
        tmux rename-window -- "$prev"
        return $rc
    else
        $runner --ide $args
    end
end
