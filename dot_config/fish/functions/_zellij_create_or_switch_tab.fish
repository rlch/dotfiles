function _zellij_create_or_switch_tab --description 'go-to existing tab by name, or create with layout'
    set tab_name $argv[1]
    set layout_name $argv[2]

    for existing_tab in (zellij action query-tab-names)
        if test "$existing_tab" = "$tab_name"
            zellij action go-to-tab-name "$tab_name"
            # If a layout.kdl is in the cwd, replay it into a new pane.
            if test -f layout.kdl
                zellij run -f -- zellij action new-pane -- zellij -l layout.kdl
                zellij action close-pane
            end
            return 1
        end
    end

    zellij action new-tab -l $layout_name -n "$tab_name"
    return 0
end
