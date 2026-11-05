# Ghostty

- **No inline/trailing comments.** A `#` on the same line as a directive is parsed as part of the
  value, not stripped. `keybind = cmd+j=csi:106;9u   # ...` makes Ghostty send the CSI-u sequence
  plus the comment text as literal keystrokes: herdr eats the `ESC[…u` and the rest prints into the
  shell on every press (2026-07-01, the whole ⌘-forward block). Put every comment on its own line
  above the directive. Same for `text:`/`csi:` payloads: whitespace and `#` after the value are not
  trimmed.
- After editing `dot_config/ghostty/config`, `chezmoi apply`, then reload Ghostty (⌘⇧,): keybinds
  don't change until then.
- `super+digit_N` defaults need `cmd+digit_N` to override (`cmd+one` doesn't shadow goto_tab).
- The ⌘-forwarding block is a matched pair with herdr's keymap (herdr.md).
- No floating/dropdown Ghostty: tried, rejected.
