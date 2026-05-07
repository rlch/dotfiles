function tmux-agent --description 'manually mark/clear the agent indicator on a tmux window'
    # Companion to tmux-send for cases where you want to mark a window
    # without actually sending keys (e.g. you've already started the
    # process and just want the indicator), or clear the indicator early.
    #
    # Window-scoped (tab-based): @agent applies to a whole tmux window.
    # The "target" arg is a pane (because that's what you usually have a
    # handle to); the option is set on its parent window.
    #
    # Usage:
    #   tmux-agent set [<agent-name>] [<target-pane>]
    #   tmux-agent clear [<target-pane>]
    #   tmux-agent status [<target-pane>]
    #
    # Defaults: agent-name=claude (or $TMUX_SEND_AGENT), target=current pane.

    set -l action $argv[1]
    if test -z "$action"
        echo "usage: tmux-agent set|clear|status [args...]" >&2
        return 1
    end

    switch $action
        case set
            set -l agent_name $argv[2]
            set -l target $argv[3]
            test -z "$agent_name"; and set agent_name $TMUX_SEND_AGENT
            test -z "$agent_name"; and set agent_name claude
            test -z "$target"; and set target (tmux display-message -p '#{pane_id}')
            set -l win (tmux display-message -p -t $target '#{window_id}' 2>/dev/null)
            test -z "$win"; and echo "no such pane: $target" >&2; and return 1
            set -l deadline (math (date +%s)" + 30")
            tmux set-option -w -t $win @agent "$agent_name" >/dev/null
            tmux set-option -w -t $win @agent-ts "$deadline" >/dev/null
            set -l name (tmux display-message -p -t $win '#W')
            tmux rename-window -t $win -- "$name"
        case clear
            set -l target $argv[2]
            test -z "$target"; and set target (tmux display-message -p '#{pane_id}')
            set -l win (tmux display-message -p -t $target '#{window_id}' 2>/dev/null)
            test -z "$win"; and echo "no such pane: $target" >&2; and return 1
            tmux set-option -wu -t $win @agent 2>/dev/null
            tmux set-option -wu -t $win @agent-action 2>/dev/null
            tmux set-option -wu -t $win @agent-ts 2>/dev/null
            set -l name (tmux display-message -p -t $win '#W')
            tmux rename-window -t $win -- "$name"
        case status
            set -l target $argv[2]
            test -z "$target"; and set target (tmux display-message -p '#{pane_id}')
            set -l win (tmux display-message -p -t $target '#{window_id}')
            tmux display-message -p -t $win 'window=#{window_id} agent=#{@agent} action=#{@agent-action} ts=#{@agent-ts}'
        case '*'
            echo "usage: tmux-agent set|clear|status [args...]" >&2
            return 1
    end
end
