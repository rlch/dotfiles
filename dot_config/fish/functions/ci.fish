function ci --wraps zi --description 'interactive zoxide picker + tmux window management (like c, but uses zi)'
    zi $argv
    _tabjump $argv
end
