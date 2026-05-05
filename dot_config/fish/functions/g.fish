function g --wraps git --description 'git, or lazygit when called with no args'
    if test (count $argv) -gt 0
        git $argv
    else
        lazygit
    end
end
