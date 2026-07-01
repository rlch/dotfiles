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
    # herdr detects and tracks the claude agent on its own (integration hook), so
    # there's no launcher wrapper to route through — just run it.
    set -l runner clodcurrent
    command -q clodcurrent; or set runner claude

    $runner --ide $args
end
