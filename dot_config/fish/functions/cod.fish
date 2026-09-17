function cod --wraps codex --description 'Launch Codex without approvals or sandboxing'
    command codex --dangerously-bypass-approvals-and-sandbox $argv
end
