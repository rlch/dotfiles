function _tabjump --description 'rename current tab only if a new target tab is being created; then zl'
    set target_tab_name (_get_tab_name)
    set tab_exists 0
    for existing_tab in (zellij action query-tab-names)
        if test "$existing_tab" = "$target_tab_name"
            set tab_exists 1
            break
        end
    end

    if test $tab_exists -eq 0
        _rename_tab_if_allowed
    end

    zl
    if test "$argv" != - -a $status -ne 0
        cd -
    end
end
