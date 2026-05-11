# Dotfiles — agent guide

Personal macOS dotfiles managed by **chezmoi**. Source of truth lives here
(`~/dev/dotfiles`); chezmoi renders/copies into `~`.

## Edit here, not in `~`

Always edit files in this repo. Never edit `~/.config/*`, `~/.claude/*`, etc.
directly — `chezmoi apply` will overwrite them. The flow is:

1. Edit a file under `dot_config/`, `dot_claude/`, or root (`Brewfile`,
   `Brewfile.heavy`, `.chezmoiscripts/...`).
2. **Always run `chezmoi apply`** after every edit — the source isn't
   live until it's deployed. Use `chezmoi diff` first if you want a preview.
   For tmux/fish/etc. that have a running daemon, also reload (e.g.
   `tmux source-file ~/.config/tmux/tmux.conf`, `exec fish`).
3. Commit + push when stable.

**Don't end a task assuming the user will apply later.** If you've changed
files under this repo, run `chezmoi apply` (or scope it: `chezmoi apply
~/.config/tmux`) before reporting done — otherwise nothing you wrote is
actually in effect, and any "verification" you do is verifying the source
copy, not the live one.

The `dot_` prefix is a chezmoi requirement, not a style choice — files
prefixed `dot_foo` deploy as `~/.foo`, `executable_foo` deploys with mode 755,
`.tmpl` files are templated. Don't try to rename them.

## Repo layout

```
.chezmoi.toml.tmpl          → renders ~/.config/chezmoi/chezmoi.toml on init
.chezmoiignore.tmpl         → files in this repo NOT to deploy (templated by role)
.chezmoiscripts/            → run-on-change install hooks
.chezmoitemplates/          → shared partials referenced by `{{ template ... }}`
                              (e.g. obsidian-shared/ — see "Obsidian vaults" below)
Brewfile                    → base packages, installed everywhere
Brewfile.heavy              → installed only when heavyHardware = true
dot_claude/                 → ~/.claude/ (settings.json, notify.sh hook)
dot_config/                 → ~/.config/ (aerospace, fish, ghostty, k9s,
                              lazydocker, starship.toml, tmux, tridactyl)
Knowledge/dot_obsidian/     → ~/Knowledge/.obsidian/ (notes vault config)
dev/trading/vault/          → ~/dev/trading/vault/.obsidian/ (per-project vault)
```

## Multi-host

Two machines share this repo: an MBP M5 Max and a Mac mini. They diverge via a
single `role` value, prompted once on `chezmoi init` and persisted to
`~/.config/chezmoi/chezmoi.toml`:

```toml
[data]
    role = "mbp"          # or "mini"
    heavyHardware = true  # derived; true iff role == "mbp"
```

- `Brewfile.heavy` (currently just Ollama) installs only when
  `heavyHardware = true`.
- The install script (`.chezmoiscripts/run_onchange_install-packages.sh.tmpl`)
  reads both files' hashes so external edits to either Brewfile retrigger it.
- For per-file divergence: rename `foo` → `foo.tmpl` and use
  `{{ if eq .role "mini" }}` blocks. To skip a file entirely on one host,
  add a templated entry to `.chezmoiignore`.

Mac mini bootstrap (one command):

```sh
brew install chezmoi && chezmoi init --apply rlch/dotfiles
# Answer "mini" at the role prompt
```

## Stack

Locked-in tool choices (don't re-litigate without checking with the user):

| Concern        | Tool                                                |
| -------------- | --------------------------------------------------- |
| Manager        | chezmoi                                             |
| Shell          | fish 4.x + fisher                                   |
| Terminal       | Ghostty                                             |
| Multiplexer    | tmux (modal Ctrl-s/a/b/q, hjkl — ported from zellij)|
| Window manager | aerospace (no yabai/skhd)                           |
| Status bar     | macOS default (sketchybar/jankyborders rejected)    |
| Editor         | Neovim + LazyVim base (**no AI plugins** — pure editor) |
| Prompt         | starship                                            |
| Git TUI        | lazygit                                             |
| AI CLIs        | Claude Code (primary) + Codex CLI + Hermes Agent    |
| Local LLM      | Ollama (heavy hardware only)                        |
| Containers     | OrbStack                                            |
| Secrets        | 1Password CLI                                       |
| Browser        | Firefox (daily) + Chrome (Flutter web dev) + Brave (PWA host) |
| Notes          | Obsidian                                            |
| Launcher       | Raycast                                             |

## Conventions / invariants

- **Preserve existing keymaps when porting.** The user has muscle memory in
  aerospace, tmux (zellij-style modal), nvim, fish abbreviations, and tridactyl.
  Cosmetic refactors fine; keybind changes are not.
- **k9s `config.yaml` is global prefs only**, not cluster state. k9s rewrites
  cluster-specific sections at runtime — keeping them in source pollutes the
  Mac mini and stale-clusters them.
- **Fish does not auto-attach tmux.** This was deliberately dropped from the
  zellij config and stays dropped; don't re-introduce it.
- **tmux modal scheme is canonical** — `Ctrl-s` pane, `Ctrl-a`/`F3` tab,
  `Ctrl-b` scroll, `Ctrl-q` session, hjkl/arrows everywhere, `Ctrl-1..9`
  windows. Ported verbatim from the zellij config; don't switch back to a
  prefix-based scheme without checking with the user.
- **Window names auto-slugify to ≤10 chars** via `~/.config/tmux/slugify-title.py`
  on the `window-renamed` hook. Claude Code's OSC titles get NLP-picked salient
  tokens (proper nouns / ALLCAPS preferred); paths get basenamed; long words
  get vowel-dropped. Idempotent.
- **No floating/dropdown Ghostty.** Tried, rejected. Don't propose it.
- **Brewfile and Brewfile.heavy are listed in `.chezmoiignore`** so they aren't
  deployed to `~`. They're consumed only by `brew bundle install` invoked from
  the install script.

## Obsidian vaults

Multiple Obsidian vaults live across the filesystem (the main `~/Knowledge/`
plus per-project vaults like `~/dev/trading/vault/`). They all share **one
canonical config** so plugins, themes, hotkeys, and snippets behave
identically everywhere.

The pattern is plain chezmoi — no custom script, no `.chezmoiignore` exclusion:

- **Canonical content** lives in `.chezmoitemplates/obsidian-shared/`.
  This is chezmoi's official directory for shared partial templates;
  it's never deployed to a literal path.
- **Per-vault wrappers** live at `<vault-source-path>/dot_obsidian/<file>.tmpl`
  and contain a single `{{- template "obsidian-shared/<file>" . -}}` line.
  Chezmoi expands the template into each destination, so `chezmoi diff`
  shows real per-file diffs.
- **Plugin/theme symlinks** use chezmoi's `symlink_<name>.tmpl` files.
  Their contents are the link target (typically
  `{{ .chezmoi.homeDir }}/dev/plugins/obsidian/<plugin>` or, for the
  Catppuccin theme, the Knowledge vault's themes dir — Knowledge is the
  one place the real theme dir lives, every other vault symlinks to it).

**Why copy JSON but symlink themes/plugins**: per [pjeby/obsidian-symlinks](https://github.com/pjeby/obsidian-symlinks),
Obsidian writes JSON config without re-reading on disk, so symlinking
shared JSON between vaults will silently corrupt settings as different
vaults clobber each other. Read-only assets (CSS snippets, plugin code,
theme dirs) are safe to symlink.

To add a new vault:

1. Copy an existing wrapper tree:
   ```sh
   cp -r ~/dev/dotfiles/Knowledge/dot_obsidian \
         ~/dev/dotfiles/<source-path-of-new-vault>/dot_obsidian
   ```
   `<source-path-of-new-vault>` is the home-relative path with `dot_` for
   leading dots — e.g. `dev/myproject/notes/dot_obsidian` deploys to
   `~/dev/myproject/notes/.obsidian/`.
2. Decide whether the new vault needs the Catppuccin theme symlink under
   `themes/symlink_Catppuccin.tmpl` (only Knowledge holds the real dir;
   every other vault symlinks).
3. `chezmoi apply <full-path-to-new-vault>/.obsidian` to deploy.

To change a setting that should propagate everywhere: edit
`.chezmoitemplates/obsidian-shared/<file>` and `chezmoi apply`. Both
vaults update.

## Common tasks

```sh
chezmoi diff                          # preview pending changes
chezmoi apply                         # deploy
chezmoi cd                            # cd into source dir
chezmoi edit ~/.config/foo/bar        # edit the source for a deployed file
brew bundle check --file=Brewfile     # verify base bundle satisfied
brew bundle check --file=Brewfile.heavy  # verify heavy bundle satisfied
```

When adding a new tool: install via Brewfile (or Brewfile.heavy), add config
under `dot_config/<tool>/`, run `chezmoi apply`. The install script auto-runs
when the Brewfile hash changes.

