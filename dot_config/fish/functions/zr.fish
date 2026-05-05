function zr --description 'reset GUARD_TAB by bouncing pwd, re-enabling auto-rename'
    set -x AUTO_RENAME_TAB 1
    cd .. && cd -
end
