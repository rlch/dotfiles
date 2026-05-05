function _get_tab_name --description 'Tab name = git_root/git_prefix when in a repo, else basename of pwd'
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1
        set git_root (basename (git rev-parse --show-toplevel))
        set git_prefix (git rev-parse --show-prefix)
        set tab_name "$git_root/$git_prefix"
        string trim -c / "$tab_name"
    else
        if test "$PWD" = "$HOME"
            echo "~"
        else
            basename "$PWD"
        end
    end
end
