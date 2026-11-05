function g --wraps git --description 'git, or git status when called with no args'
    if test (count $argv) -gt 0
        git $argv
    else
        git status -sb
    end
end
