function cl --wraps claude --description 'clodcurrent: launch best free account; model shortcuts'
    # Translate model shortcuts into `--model <id>` (passed through to claude).
    # opus/fable are pinned to the 1M-context ([1m]) variants; sonnet uses
    # claude's own "latest" alias so it auto-tracks releases. No --haiku: the
    # global model rule bans it. Bump opus/fable
    # here when a newer 1M model ships.
    set -l args
    for a in $argv
        switch $a
            case --opus
                set -a args --model 'claude-opus-5-5[1m]'
            case --fable
                set -a args --model 'claude-fable-5-1[1m]'
            case --sonnet
                set -a args --model sonnet
            case '*'
                set -a args $a
        end
    end

    # desk's agent plugin: the skills and MCP tools deskd writes for agents
    # (~/dev/desk docs/deskd.md). Read live from the folder, so it follows deskd's
    # config and enabled plugins. Only for a session, not for `cl mcp ...` and
    # the other subcommands, and only where deskd has written it.
    set -l desk_plugin ~/.local/state/desk/agent-plugin
    if test -d $desk_plugin; and not contains -- "$args[1]" mcp plugin update install doctor config auth agents setup-token
        set -p args --plugin-dir $desk_plugin
    end

    # clodcurrent picks the highest-quota account not already running in another
    # pane, trusts the launch folder in that account's config, kicks off the
    # conversation sync in the background, then exec's `claude` with
    # CLAUDE_CONFIG_DIR set. Everything in $args passes straight through.
    # herdr detects and tracks the claude agent on its own (integration hook), so
    # there's no launcher wrapper to route through — just run it.
    if command -q clodcurrent
        clodcurrent $args
        return
    end

    # No clodcurrent: plain claude, with the trust step done here. Claude's trust
    # walk stops at the cwd's git toplevel, so $HOME/~/dev trust never reaches
    # into a fresh worktree or clone; without this every new checkout prompts.
    command -q claude-trust-path; and claude-trust-path (pwd) >/dev/null
    claude $args
end
