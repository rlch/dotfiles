# =============================================================================
# Autojump Integration with Zellij Tab Management
# =============================================================================

# _rename_tab_if_allowed - Conditionally rename tab based on GUARD_TAB environment
# Only renames tab if GUARD_TAB is not set (prevents unwanted renames)
# Used by c/cc functions to control when tab renaming should occur
# Runs asynchronously to avoid blocking navigation commands
function _rename_tab_if_allowed
    if not set -q GUARD_TAB
        set tab_name (_get_tab_name)
        command nohup zellij action rename-tab $tab_name >/dev/null 2>&1 &
    end
end

# _tabjump - Internal helper for tab jumping with fallback behavior
# 1. Creates/switches to project tab via zl
# 2. Only renames current tab if creating a new session (not switching to existing)
# 3. Falls back to previous directory if zl fails and not using '-' argument
# Used by both c and ci functions for consistent tab management behavior
function _tabjump
    # Check if target tab already exists before renaming
    set target_tab_name (_get_tab_name)
    set tab_exists 0
    for existing_tab in (zellij action query-tab-names)
        if test "$existing_tab" = "$target_tab_name"
            set tab_exists 1
            break
        end
    end

    # Only rename current tab if target tab doesn't exist (i.e., we're creating a new session)
    if test $tab_exists -eq 0
        _rename_tab_if_allowed
    end

    zl
    # return to previous directory if zl succeeded
    if test "$argv" != - -a $status -ne 0
        cd -
    end
end

function c --wraps z
    z $argv
    _rename_tab_if_allowed
end

function j --wraps z
    z $argv
    _rename_tab_if_allowed
end

# ci - Interactive autojump with tab management
# Same as 'c' but uses zoxide's interactive mode (zi) for directory selection
# 1. Opens zoxide's interactive picker to select directory
# 2. Applies same tab management logic as 'c' function
# 3. Creates/switches to project tabs as needed
function ci --wraps zi
    zi $argv
    _tabjump $argv
end
