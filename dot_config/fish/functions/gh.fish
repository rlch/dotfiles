function gh --wraps 'command gh' --description 'gh, or gh dash when called with no args'
    if test (count $argv) -gt 0
        command gh $argv
    else
        command gh dash
    end
end
