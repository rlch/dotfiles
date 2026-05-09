function cl --wraps claude --description 'claude --ide; restores tmux window title on exit'
    if set -q TMUX
        set -l prev (tmux display-message -p '#W')
        claude --ide $argv
        set -l rc $status
        tmux rename-window -- "$prev"
        return $rc
    else
        claude --ide $argv
    end
end
