function _tmux_create_or_switch_window --description 'go-to existing tmux window by name, or create one'
    set window_name $argv[1]

    for existing in (tmux list-windows -F '#W' 2>/dev/null)
        if test "$existing" = "$window_name"
            tmux select-window -t "$window_name"
            return 1
        end
    end

    tmux new-window -n "$window_name" -c (pwd)
    return 0
end
