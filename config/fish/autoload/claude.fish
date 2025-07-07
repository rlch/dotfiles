function cl --wraps claude
    claude --ide --continue $argv || claude --ide $argv
end
