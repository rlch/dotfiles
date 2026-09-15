function langfuse-env --description 'Export Langfuse API keys (self-hosted, project modality) from 1Password into this shell'
    # For `npx langfuse-cli` and the SDKs. LANGFUSE_BASE_URL is set globally in
    # config.fish; only the key pair is pulled here, on demand, never persisted.
    set -l item "op://bywkocjywlrt5ck43vjsfqmb64/Langfuse modality API key"
    set -l pk (op read "$item/username" --account tutero.1password.com 2>/dev/null)
    set -l sk (op read "$item/credential" --account tutero.1password.com 2>/dev/null)
    if test -z "$pk" -o -z "$sk"
        echo "langfuse-env: key pair not found in 1Password ($item)" >&2
        return 1
    end
    set -gx LANGFUSE_PUBLIC_KEY $pk
    set -gx LANGFUSE_SECRET_KEY $sk
    set -gx LANGFUSE_BASE_URL https://langfuse.tutero.dev
    set -gx LANGFUSE_HOST https://langfuse.tutero.dev
    echo "langfuse-env: exported LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY for $LANGFUSE_BASE_URL"
end
