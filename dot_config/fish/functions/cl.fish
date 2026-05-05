function cl --wraps claude --description 'claude --ide --continue, falling back to fresh session'
    claude --ide --continue $argv; or claude --ide $argv
end
