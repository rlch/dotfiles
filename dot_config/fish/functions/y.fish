function y --wraps yazi --description 'yazi + chdir to its final cwd on quit (q jumps, Q does not)'
    set -l tmp (mktemp -t yazi-cwd.XXXXXX)
    yazi $argv --cwd-file=$tmp
    if test -s $tmp
        set -l cwd (command cat -- $tmp)
        if test -n "$cwd" -a "$cwd" != "$PWD"
            builtin cd -- $cwd
        end
    end
    rm -f -- $tmp
end
