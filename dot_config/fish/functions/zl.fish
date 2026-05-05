function zl --description 'create-or-switch-to a zellij tab named after the current dir/repo'
    if set -q GUARD_TAB
        return 1
    end

    set NAME (_get_tab_name)
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
