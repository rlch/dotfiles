# herdr tab titles from the foreground TUI program.
#
# The Claude Stop hook (~/.claude/herdr-title.sh) titles a tab with the
# conversation ai-title, but it only fires for panes running Claude. A plain
# pane running a TUI (yazi, nvim, lazygit, …) never triggers it and would sit on
# a bare tab number. This bridges that gap: on launching a known TUI, name the
# tab after the program; restore the numeric default when it exits. herdr can't
# read OSC-2 terminal titles, so fish — which already knows the program being
# run — drives `herdr tab rename` directly.
#
# Coordination: both this and the Claude hook only ever overwrite a NUMERIC
# (default) tab label, so they never clobber each other or a name you set by
# hand. `cl` / `claude` are intentionally absent from the TUI list, so Claude
# panes are left alone and keep their ai-titles.

status is-interactive; or return
test "$HERDR_ENV" = 1; or return

# Full-screen TUIs worth surfacing as a tab title. Transient commands (ls, git,
# grep, …) are intentionally excluded so tabs don't flicker. Extend freely.
set -g __herdr_tui_progs yazi nvim vim hx helix lazygit lazydocker k9s htop btop \
    top ncdu gitui gdb lldb bluetuith
# Command wrappers to see through, so `sudo yazi` / `env FOO=1 nvim` resolve to
# the real program rather than the wrapper.
set -g __herdr_cmd_wrappers sudo doas env command nice nohup time stdbuf

# The first "real" program in a command line: skip leading VAR=val assignments,
# known wrappers, and their flags; return the program's basename.
function __herdr_real_prog
    for tok in (string split ' ' -- $argv[1])
        test -n "$tok"; or continue
        string match -qr '^[A-Za-z_][A-Za-z0-9_]*=' -- $tok; and continue  # VAR=val
        string match -qr '^-' -- $tok; and continue                        # -flag
        set -l base (path basename $tok)
        contains -- $base $__herdr_cmd_wrappers; and continue              # wrapper
        echo $base
        return
    end
end

function __herdr_tab_title_on_exec --on-event fish_preexec
    set -q HERDR_TAB_ID; or return
    set -l prog (__herdr_real_prog $argv[1])
    contains -- $prog $__herdr_tui_progs; or return
    # Only replace the plain positional default (a bare number); never clobber a
    # Claude ai-title or a label you set yourself.
    set -l cur (herdr tab get $HERDR_TAB_ID 2>/dev/null | jq -r '.result.tab.label // ""')
    string match -qr '^\d+$' -- "$cur"; or return
    set -g __herdr_tab_restore $cur
    herdr tab rename $HERDR_TAB_ID $prog >/dev/null 2>&1
end

function __herdr_tab_title_on_done --on-event fish_postexec
    set -q __herdr_tab_restore; or return
    herdr tab rename $HERDR_TAB_ID $__herdr_tab_restore >/dev/null 2>&1
    set -e __herdr_tab_restore
end
