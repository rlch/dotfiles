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

function _zellij_create_or_switch_tab
    set tab_name $argv[1]
    set layout_name $argv[2]

    # Check if tab exists and switch to it
    for existing_tab in (zellij action query-tab-names)
        if [ "$existing_tab" = "$tab_name" ]
            zellij action go-to-tab-name "$tab_name"
            # Apply layout if layout.kdl exists in current directory
            if test -f layout.kdl
                zellij run -f -- zellij action new-pane -- zellij -l layout.kdl
                zellij action close-pane
            end
            return 1
        end
    end

    # Create new tab with layout
    zellij action new-tab -l $layout_name -n "$tab_name"
    return 0
end

function zl
    if set -q GUARD_TAB
        return 1
    end

    set NAME (_get_tab_name)
    set LAYOUT_NAME ""
    if test -f layout.kdl
        set LAYOUT_NAME layout.kdl
    else
        set LAYOUT_NAME default
    end

    if test -n "$LAYOUT_NAME"
        if _zellij_create_or_switch_tab $NAME $LAYOUT_NAME
            set -x AUTO_RENAME_TAB 0
            set -x GUARD_TAB 1
        end
    end
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
