function c --wraps z --description 'zoxide jump + create-or-switch tmux window + return to prev dir'
    z $argv
    zl && cd -
end
