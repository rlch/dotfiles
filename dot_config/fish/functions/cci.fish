function cci --description 'clodcurrent: force-reinstall from ~/dev/clodcurrent'
    # `cargo install --path .` no-ops when the crate version is unchanged
    # ("already installed, use --force to override"), so a plain reinstall
    # silently keeps the stale binary on PATH. Always --force. Extra args pass
    # through (e.g. `cci --debug` for a faster unoptimised build).
    cargo install --path ~/dev/clodcurrent --force $argv
end
