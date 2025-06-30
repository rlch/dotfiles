function _get_tab_name
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1
        set git_root (basename (git rev-parse --show-toplevel))
        set git_prefix (git rev-parse --show-prefix)
        set tab_name "$git_root/$git_prefix"
        set tab_name (string trim -c / "$tab_name") # Remove trailing slash
        echo $tab_name
    else
        set current_path $PWD
        if test "$current_path" = "$HOME"
            echo "~"
        else
            echo (basename "$current_path")
        end
    end
end

function zl
    if set -q GUARD_TAB
        return
    end

    set NAME (_get_tab_name)
    set LAYOUT_NAME ""
    if test -f layout.kdl
        set LAYOUT_NAME layout.kdl
    else if git rev-parse --is-inside-work-tree &>/dev/null
        set LAYOUT_NAME compact
    end
    if test -z $LAYOUT_NAME
        return 0
    end

    for EXISTING in (zellij action query-tab-names)
        if [ "$EXISTING" = "$NAME" ]
            zellij action go-to-tab-name "$NAME"
            # Apply layout if layout.kdl exists in current directory
            if test -f layout.kdl
                zellij run -f -- zellij action new-pane -- zellij -l layout.kdl
                zellij action close-pane
            end
            return 1
        end
    end
    zellij action new-tab -l $LAYOUT_NAME -n "$NAME"
    set -x AUTO_RENAME_TAB 0
    set -x GUARD_TAB 1
    return 2
end

function zr
    set -x AUTO_RENAME_TAB 1
    cd .. && cd -
end

function zellij_tab_name_update --on-variable PWD
    if not set -q AUTO_RENAME_TAB
        return
    end
    if not set -q ZELLIJ
        return
    end
    set tab_name (_get_tab_name)
    command nohup zellij action rename-tab $tab_name >/dev/null 2>&1 &
end

