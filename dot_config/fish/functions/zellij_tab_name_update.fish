function zellij_tab_name_update --on-variable PWD --description 'rename current zellij tab when PWD changes (if AUTO_RENAME_TAB and inside zellij)'
    set -q AUTO_RENAME_TAB; or return
    set -q ZELLIJ;          or return
    set tab_name (_get_tab_name)
    command nohup zellij action rename-tab $tab_name >/dev/null 2>&1 &
end
