function tmux_tab_name_update --on-variable PWD --description 'rename current tmux window when PWD changes (if AUTO_RENAME_TAB and inside tmux)'
    set -q AUTO_RENAME_TAB; or return
    set -q TMUX;            or return
    set tab_name (_get_tab_name)
    command nohup tmux rename-window $tab_name >/dev/null 2>&1 &
end
