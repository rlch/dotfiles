function d --wraps docker --description 'docker, or lazydocker when called with no args'
    if test (count $argv) -gt 0
        docker $argv
    else
        lazydocker
    end
end
