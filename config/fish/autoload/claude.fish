function cl --wraps claude
    ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude --ide --allow-dangerously-skip-permissions $argv
end

function clc --wraps claude
    ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude --ide --allow-dangerously-skip-permissions --continue $argv || claude --ide --allow-dangerously-skip-permissions $argv
end
