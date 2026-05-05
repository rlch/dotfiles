function _rename_tab_if_allowed --description 'compute tab name (rename call kept commented out — toggle if you want it)'
    if not set -q GUARD_TAB
        set tab_name (_get_tab_name)
        # Uncomment to actually rename:
        # command nohup zellij action rename-tab $tab_name >/dev/null 2>&1 &
    end
end
