# Karabiner

Karabiner rewrites `karabiner.json` itself (on a device change, in its UI): deploy it with
`chezmoi apply --force ~/.config/karabiner/karabiner.json`. Its source is one minified line. It
picks up changes on its own. The Left-Option-tap gesture sends herdr's zoom (herdr.md).
