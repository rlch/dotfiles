function fish_user_key_bindings
    # Default (emacs) bindings as the base layer for insert mode.
    fish_default_key_bindings -M insert
    # Vi bindings on top, --no-erase so the emacs layer above survives.
    fish_vi_key_bindings --no-erase insert

    # Ctrl-D forward-deletes but never exits the shell. Default is
    # `delete-or-exit`, which closes the shell on an empty line — far too
    # easy to fat-finger. `exit`/`⌃s q` still work for leaving deliberately.
    bind -M insert \cd delete-char
    bind -M default \cd delete-char
end
