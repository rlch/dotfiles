function ci --wraps zi --description 'interactive zoxide picker + zellij tab management (like c, but uses zi)'
    zi $argv
    _tabjump $argv
end
