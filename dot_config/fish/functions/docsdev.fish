function docsdev --description "Run this repo's Fumadocs docs-site dev server (./docs)"
    # Locate the docs/ Node island: prefer ./docs, else the git root's docs/.
    set -l dir
    if test -f docs/package.json
        set dir docs
    else
        set -l root (git rev-parse --show-toplevel 2>/dev/null)
        if test -n "$root"; and test -f "$root/docs/package.json"
            set dir "$root/docs"
        end
    end
    if test -z "$dir"
        echo "docsdev: no docs/ Fumadocs app here (looked in ./docs and the git root)." >&2
        echo "         scaffold one with the docs-scaffold skill." >&2
        return 1
    end

    pushd "$dir" >/dev/null
    if not test -d node_modules
        echo "docsdev: installing deps in $dir …"
        npm install
    end
    # workflow: ⌘D to split a pane (herdr), then run `docsdev` in it.
    npm run dev $argv
    popd >/dev/null
end
