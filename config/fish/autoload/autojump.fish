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

# c - Autojump with intelligent tab management
# 1. Uses zoxide (z) to jump to specified directory
# 2. Looks for existing Zellij tab for the target directory/git workspace
# 3. If tab exists: switches to that tab, preserves current tab state
# 4. If no tab exists: creates new tab with appropriate layout
# 5. The spawning tab remains unaffected (no unwanted renames)
# Key behavior: Creates/switches to project tabs, doesn't rename spawning tab
function c --wraps z
    z $argv
    _tabjump $argv
end

# cc - Autojump with current tab rename only
# 1. Uses zoxide (z) to jump to specified directory
# 2. Renames the CURRENT tab to match the new location
# 3. Does NOT create or switch to other tabs
# 4. Stays in the same tab but updates its name appropriately
# Key behavior: Only renames current tab, no tab switching/creation
function cc --wraps z
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
