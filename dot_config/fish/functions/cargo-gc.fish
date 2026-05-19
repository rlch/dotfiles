function cargo-gc --description 'Prune cargo target bloat. --full nukes everything; default is incremental + examples + llvm-cov-target.'
    # Why this exists: cargo never GCs target/. Every (rustc-version × features
    # × env) tuple seen during the lifetime of a project leaves a fingerprint
    # behind in target/debug/incremental/, and the artifacts duplicate in
    # target/debug/deps/. After weeks of iterative work in a large workspace
    # this passes 100 GB and stat() over the tree starts dominating cargo's
    # startup time (12+ min "hangs" on `cargo check` were observed in
    # ~/dev/trading at 172 GB before this was added).
    #
    # Default mode (light): rm -rf target/debug/{incremental,examples} +
    # target/llvm-cov-target. Cheap, cargo re-populates fingerprints on the
    # next build.
    #
    # --full mode: `cargo clean` — frees everything, costs a full rebuild
    # (~30-45 min for the trading workspace). Use sparingly.

    argparse 'h/help' 'f/full' 'd/dry-run' -- $argv
    or return 1

    if set -q _flag_help
        echo "Usage: cargo-gc [--full] [--dry-run] [path]"
        echo ""
        echo "  (default)  Prune target/debug/{incremental,examples} + target/llvm-cov-target"
        echo "  --full     cargo clean — full workspace rebuild required after"
        echo "  --dry-run  Show sizes only; don't delete"
        echo ""
        echo "Operates on \$argv[1] if given, else cwd. Must contain a target/ dir."
        return 0
    end

    set -l root (test -n "$argv[1]"; and realpath $argv[1]; or pwd)
    if not test -d "$root/target"
        echo "cargo-gc: no target/ in $root" >&2
        return 1
    end

    set -l before (du -sh "$root/target" 2>/dev/null | cut -f1)
    echo "cargo-gc: $root/target → $before"

    if set -q _flag_full
        if set -q _flag_dry_run
            echo "  --dry-run: would run \`cargo clean\` (frees ~all of $before)"
            return 0
        end
        # cargo clean handles workspace + virtual-manifest correctly; avoids
        # the foot-gun of `rm -rf target` racing a running cargo process.
        command cargo clean --manifest-path "$root/Cargo.toml"
    else
        # Light mode: the three subdirs that grow without bound. Each guarded
        # by `test -d` so partial states (e.g. no examples ever built) don't
        # trip a misleading "rm: missing".
        for sub in target/debug/incremental target/debug/examples target/llvm-cov-target
            if test -d "$root/$sub"
                set -l sz (du -sh "$root/$sub" 2>/dev/null | cut -f1)
                if set -q _flag_dry_run
                    echo "  --dry-run: would rm -rf $sub ($sz)"
                else
                    echo "  rm -rf $sub ($sz)"
                    rm -rf "$root/$sub"
                end
            end
        end
    end

    if not set -q _flag_dry_run
        set -l after (du -sh "$root/target" 2>/dev/null | cut -f1)
        echo "cargo-gc: $root/target → $after"
    end
end
