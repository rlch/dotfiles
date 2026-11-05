# Nerd Font glyphs

Glyphs of three UTF-8 bytes (U+E000–U+F8FF) can vanish from an Edit or Write; four-byte ones
(U+F0000+) survive. Write a placeholder, put the glyph in with `python3` and `chr()`, and check
the bytes with `xxd`.
