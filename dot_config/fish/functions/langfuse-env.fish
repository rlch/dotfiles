function langfuse-env --description 'Export Langfuse API keys (self-hosted, project modality) into this shell'
    # Reads the local cache ~/.config/langfuse/env (KEY=VALUE, chmod 600) — never
    # 1Password on the hot path: every `op read` costs a Touch ID prompt. The
    # cache is written once by hand (or from the MCP token in ~/.claude*/.claude.json).
    set -l cache ~/.config/langfuse/env
    if not test -r $cache
        echo "langfuse-env: $cache missing — write LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY there (see script comment)" >&2
        return 1
    end
    for line in (grep -v '^#' $cache | grep '=')
        set -l kv (string split -m1 '=' $line)
        set -gx $kv[1] $kv[2]
    end
    test -n "$LANGFUSE_BASE_URL"; or set -gx LANGFUSE_BASE_URL https://langfuse.tutero.dev
    test -n "$LANGFUSE_HOST"; or set -gx LANGFUSE_HOST $LANGFUSE_BASE_URL
end
