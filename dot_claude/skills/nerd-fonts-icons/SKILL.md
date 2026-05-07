---
name: nerd-fonts-icons
description: Look up Nerd Fonts glyph names, codepoints, and characters, and write them into config files reliably. Use whenever an icon needs to appear in a config, prompt, statusline, or script — Neovim/LazyVim/lualine/snacks/mini.icons, Starship, tmux, lazygit, ghostty, aerospace, Waybar, or any place that takes a glyph. Always look up the codepoint instead of guessing — the local CSV mirrors every icon shipped by Nerd Fonts (~12,883 entries). Use the `nficon` helper to search by name, the exports/ for bulk Lua/JSON/Sh/TOML/TSV consumption, and the "Writing glyphs into files" section before pasting glyphs into Edit/Write — the tools silently drop 3-byte Private Use Area chars (most `nf-cod-*`/`nf-fa-*` glyphs).
---

# Nerd Fonts Icons

Local mirror of every glyph shipped by Nerd Fonts (sourced from
nerdfonts.com cheat-sheet). Use this skill instead of guessing codepoints.

## When to invoke

- Editing any file that references an icon by glyph or codepoint:
  Neovim plugin specs (lualine, snacks, mini.icons, statuscol, dashboard,
  bufferline, noice, which-key), tmux/starship/ghostty configs, lazygit,
  aerospace, waybar/wofi/rofi, shell prompts, scripts that print glyphs.
- The user asks "what's the icon for X" or "give me a nerd-font glyph for X".
- A diff is about to introduce a literal `` or `\uXXXX` escape — verify
  the name/codepoint pair first.

## Library files

Layout (deployed to `~/.claude/skills/nerd-fonts-icons/`):

```
SKILL.md
icons.csv             # source of truth: name,codepoint_hex,glyph (~12,883 rows)
nficon                # CLI lookup helper (bash)
nficon-export         # regenerator for exports/ (python3)
exports/
  icons.json          # { "nf-...": { "codepoint": "...", "glyph": "" }, ... }
  icons.lua           # return { ["nf-..."] = { codepoint = "...", glyph = "" }, ... }
  icons.sh            # NF_<NAME>="" exports
  icons.toml
  icons.tsv
```

`nficon` is on `$PATH` only if you symlink/source it; it's safe to invoke
by absolute path: `~/.claude/skills/nerd-fonts-icons/nficon`.

## Common workflows

### Search by name (regex, case-insensitive)

```sh
~/.claude/skills/nerd-fonts-icons/nficon 'github|git_commit|debug'
~/.claude/skills/nerd-fonts-icons/nficon '^nf-md-folder'
```

### Exact lookup

```sh
nficon --name nf-cod-github          # full row
nficon --glyph nf-cod-github         # just the glyph 
nficon --codepoint nf-cod-github     # just the hex (e.g. f02a3)
```

### Convert a hex codepoint to a printf escape

```sh
nficon --to-printf f16e0     # → \U000f16e0
nficon --to-printf f2b4      # → 
```

### Print a glyph from a codepoint (Bash)

```sh
printf '\n'            # codepoints ≤ ffff
printf '\U000f16e0\n'        # codepoints > ffff
```

### Search the CSV directly

```sh
rg -i 'docker|podman|orbstack' ~/.claude/skills/nerd-fonts-icons/icons.csv
rg '^nf-cod-' ~/.claude/skills/nerd-fonts-icons/icons.csv | head
```

### Filter exports for a subset

```sh
~/.claude/skills/nerd-fonts-icons/nficon-export \
  --format json --mode map --prefix nf-md- \
  --out /tmp/nf-md.json
```

## Naming convention

Icon names follow `nf-<set>-<name>`:

| set       | source                              |
| --------- | ----------------------------------- |
| `nf-cod`  | VS Code Codicons                    |
| `nf-dev`  | Devicons                            |
| `nf-fa`   | Font Awesome                        |
| `nf-fae`  | Font Awesome Extension              |
| `nf-iec`  | IEC Power Symbols                   |
| `nf-indent` | Indentation indicators            |
| `nf-linux`| Logos                               |
| `nf-md`   | Material Design Icons (largest set) |
| `nf-oct`  | Octicons                            |
| `nf-pl`   | Powerline                           |
| `nf-pom`  | Pomicons                            |
| `nf-ple`  | Powerline Extra                     |
| `nf-seti` | Seti UI                             |
| `nf-weather` | Weather Icons                    |

## Updating the library

The CSV was generated from `nerdfonts.com/cheat-sheet`. To refresh:

1. Save the page as `/tmp/nerdfont.html`.
2. Extract the embedded `const glyphs = { ... }` JS object → JSON.
3. Convert each `name,hex` pair to `name,hex,<chr(int(hex,16))>` and
   sort by name.
4. Write to `icons.csv`, then run `nficon-export --format <fmt>` for each
   format in `exports/`.

A small helper to do steps 2–4 lives in this skill's history; rerun it
when nerdfonts publishes a new release.

## Writing glyphs into files (important)

The `Edit`/`Write` tools may silently drop literal Nerd Font glyphs in
the **3-byte UTF-8 / Private Use Area** range (U+E000–U+F8FF), which
covers most `nf-cod-*`, `nf-fa-*`, `nf-dev-*`, `nf-oct-*`, etc. The
4-byte SMP glyphs (U+F0000–U+FFFFF, all of `nf-md-*`) survive. Symptom:
you write a line with seven glyphs, only the `nf-md-*` ones appear.

**Reliable workflow** — write via a `python3` heredoc through Bash, using
explicit codepoints, then verify with `xxd`:

```sh
python3 - <<'PY'
import pathlib
p = pathlib.Path('/path/to/file')
text = p.read_text()
GLYPH = chr(0xeb56)   # nf-cod-split_horizontal — never paste literal
text = text.replace('PLACEHOLDER', GLYPH)
p.write_text(text)
PY

# Then confirm the bytes landed:
awk 'NR==<line>' /path/to/file | xxd | grep -i 'ee\|ef\|f3'
```

Codepoint → expected UTF-8 leading byte:
- U+E000–U+EFFF → `ee XX XX` (3 bytes)
- U+F000–U+FFFF → `ef XX XX` (3 bytes)
- U+F0000–U+FFFFF → `f3 b0 XX XX` (4 bytes)

If the bytes are missing, **don't retry the same Edit** — fall back to
the python+codepoint path.

## Practical reminders

- Glyphs only render where the rendering surface uses a Nerd Font (or a
  Nerd Fonts symbols-only font) in its `font-family`.
- In configs that accept a literal character (Lua tables, Waybar JSON,
  Starship TOML), prefer the glyph; the CSV stays the source of truth
  for the name+codepoint pair.
- For Lua specs that prefer escapes over literals, use the codepoint:
  `vim.fn.nr2char(0xf02a3)` or write `""` as the literal char from the
  exports file.
- Do not invent names. If `nficon` returns nothing for a query, the icon
  doesn't exist under that name — broaden the search.
