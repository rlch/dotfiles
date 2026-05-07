function zl --description 'create-or-switch a tmux window named after the current dir/repo'
    if set -q GUARD_TAB
        return 1
    end

    set -q TMUX; or return 1

    set NAME (_get_tab_name)
    if _tmux_create_or_switch_window $NAME
        set -x AUTO_RENAME_TAB 0
        set -x GUARD_TAB 1
    end
end
