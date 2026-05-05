function cc --wraps z --description 'zoxide jump + rename current tab (no new tab created)'
    z $argv
    _rename_tab_if_allowed
end
