function zl
    set NAME (basename "$PWD")
    set LAYOUT_NAME ""
    if test -f layout.kdl
        set LAYOUT_NAME layout.kdl
    else if git rev-parse --is-inside-work-tree &>/dev/null
        set NAME (basename (git rev-parse --show-toplevel))
        set LAYOUT_NAME compact
    end
    if test -z $LAYOUT_NAME
        return 0
    end

    for EXISTING in (zellij action query-tab-names)
        if [ "$EXISTING" = "$NAME" ]
            zellij action go-to-tab-name "$NAME"
            return 1
        end
    end
    zellij action new-tab -l $LAYOUT_NAME -n "$NAME"
    return 2
end

# function zellij_tab_name_update --on-variable PWD
#     if not set -q ZELLIJ
#         return
#     end
#     set tab_name ''
#     if git rev-parse --is-inside-work-tree >/dev/null 2>&1
#         set git_root (basename (git rev-parse --show-toplevel))
#         set git_prefix (git rev-parse --show-prefix)
#         set tab_name "$git_root/$git_prefix"
#         set tab_name (string trim -c / "$tab_name") # Remove trailing slash
#     else
#         set tab_name $PWD
#         if test "$tab_name" = "$HOME"
#             set tab_name "~"
#         else
#             set tab_name (basename "$tab_name")
#         end
#     end
#     command nohup zellij action rename-tab $tab_name >/dev/null 2>&1 &
# end
