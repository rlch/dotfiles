# Ghostty

- **No inline/trailing comments.** A `#` on the same line as a directive is parsed as part of the
  value, not stripped. `keybind = cmd+j=csi:106;9u   # ...` makes Ghostty send the CSI-u sequence
  plus the comment text as literal keystrokes into the shell on every
  press (2026-07-01). Put every comment on its own line
  above the directive. Same for `text:`/`csi:` payloads: whitespace and `#` after the value are not
  trimmed.
- After editing `dot_config/ghostty/config`, `chezmoi apply`, then reload Ghostty (⌘⇧,): keybinds
  don't change until then.
- `super+digit_N` defaults need `cmd+digit_N` to override (`cmd+one` doesn't shadow goto_tab).
- No floating/dropdown Ghostty: tried, rejected.
