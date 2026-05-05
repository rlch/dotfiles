function c --wraps z --description 'zoxide jump + create-or-switch zellij tab + return to prev dir'
    z $argv
    zl && cd -
end
