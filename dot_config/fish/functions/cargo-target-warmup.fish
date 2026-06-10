function cargo-target-warmup --description 'Hardlink immutable registry/git deps from a donor target/ into this worktree to skip cold rebuilds.'
    # Thin wrapper over ~/.local/bin/cargo-target-warmup (a Python port of
    # howardjohn's cargo-registry-deps.py). The implementation lives in
    # Python because the hot loop hardlinks 5k+ files: doing it in fish via
    # subprocess-per-iteration costs ~30s, vs ~1s in Python via os.link().
    #
    # Background on the technique:
    # blog.howardjohn.info/posts/shared-rust-build/
    #
    # The fish layer exists so the command tab-completes alongside other
    # cargo-* helpers (cargo-gc etc.) and so $argv handling is consistent
    # with the rest of the user's fish toolkit.

    command cargo-target-warmup $argv
end
