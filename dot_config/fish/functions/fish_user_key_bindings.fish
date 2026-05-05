function fish_user_key_bindings
    # Default (emacs) bindings as the base layer for insert mode.
    fish_default_key_bindings -M insert
    # Vi bindings on top, --no-erase so the emacs layer above survives.
    fish_vi_key_bindings --no-erase insert
end
