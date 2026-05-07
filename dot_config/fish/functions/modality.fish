function modality --description 'open Modality 3-pane layout (claude / just server / yazi) in current tmux'
    if not set -q TMUX
        echo "modality: not in a tmux session" >&2
        return 1
    end

    set -l name modality

    # Idempotent: jump to the window if it already exists in this session.
    for existing in (tmux list-windows -F '#W' 2>/dev/null)
        if test "$existing" = "$name"
            tmux select-window -t "$name"
            return 0
        end
    end

    set -l root ~/dev/tutero/frontend/library/modality
    set -l w (tmux new-window -P -F '#{window_id}' -c "$root" -n "$name")
    tmux send-keys -t "$w" 'claude' Enter
    tmux split-window -h -c "$root" -t "$w"
    tmux send-keys -t "$w" 'cd server && just server' Enter
    tmux split-window -v -c "$root" -t "$w"
    tmux send-keys -t "$w" 'yazi' Enter
    tmux select-layout -t "$w" main-vertical
    tmux select-pane -t "$w".1
end
