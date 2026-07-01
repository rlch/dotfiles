function cl --wraps claude --description 'clodcurrent: launch best free account; --ide; model shortcuts'
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
    # through `cmux claude-teams` so Claude Code's native agent teams render as
    # native cmux splits (sets up the tmux shim + CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).
    # clodcurrent honors CLODCURRENT_LAUNCHER — it still picks the best account
    # and sets CLAUDE_CONFIG_DIR, then exec's the launcher instead of claude.
    # Without clodcurrent, invoke `cmux claude-teams` directly. Outside cmux
    # (plain terminal, ssh), nothing changes.
    if set -q CMUX_SURFACE_ID
        if test "$runner" = clodcurrent
            set -fx CLODCURRENT_LAUNCHER 'cmux claude-teams'
        else
            set runner cmux claude-teams
        end
    end

    $runner --ide $args
end
