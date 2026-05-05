# Dotfiles — agent guide

Personal macOS dotfiles managed by **chezmoi**. Source of truth lives here
(`~/dev/dotfiles`); chezmoi renders/copies into `~`.

## Edit here, not in `~`

Always edit files in this repo. Never edit `~/.config/*`, `~/.claude/*`, etc.
directly — `chezmoi apply` will overwrite them. The flow is:

1. Edit a file under `dot_config/`, `dot_claude/`, or root (`Brewfile`,
   `Brewfile.heavy`, `.chezmoiscripts/...`).
2. `chezmoi apply` to deploy. Use `chezmoi diff` first if you want a preview.
3. Commit + push when stable.

The `dot_` prefix is a chezmoi requirement, not a style choice — files
prefixed `dot_foo` deploy as `~/.foo`, `executable_foo` deploys with mode 755,
`.tmpl` files are templated. Don't try to rename them.

## Repo layout

```
.chezmoi.toml.tmpl          → renders ~/.config/chezmoi/chezmoi.toml on init
.chezmoiignore              → files in this repo NOT to deploy
.chezmoiscripts/            → run-on-change install hooks
Brewfile                    → base packages, installed everywhere
Brewfile.heavy              → installed only when heavyHardware = true
dot_claude/                 → ~/.claude/ (settings.json, notify.sh hook)
dot_config/                 → ~/.config/ (aerospace, fish, ghostty, k9s,
                              lazydocker, starship.toml, tridactyl, zellij)
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
| Multiplexer    | zellij                                              |
| Window manager | aerospace (no yabai/skhd)                           |
| Status bar     | macOS default (sketchybar/jankyborders rejected)    |
| Editor         | Neovim + LazyVim base (**no AI plugins** — pure editor) |
| Prompt         | starship                                            |
| Git TUI        | lazygit                                             |
| AI CLIs        | Claude Code (primary) + Codex CLI + Hermes Agent    |
| Local LLM      | Ollama (heavy hardware only)                        |
| Containers     | OrbStack                                            |
| Secrets        | 1Password CLI                                       |
| Browser        | Firefox + tridactyl                                 |
| Notes          | Obsidian                                            |
| Launcher       | Raycast                                             |

## Conventions / invariants

- **Preserve existing keymaps when porting.** The user has muscle memory in
  aerospace, zellij, nvim, fish abbreviations, and tridactyl. Cosmetic refactors
  fine; keybind changes are not.
- **k9s `config.yaml` is global prefs only**, not cluster state. k9s rewrites
  cluster-specific sections at runtime — keeping them in source pollutes the
  Mac mini and stale-clusters them.
- **Fish does not auto-attach zellij.** This was deliberately dropped from the
  old config; don't re-introduce it.
- **No floating/dropdown Ghostty.** Tried, rejected. Don't propose it.
- **Brewfile and Brewfile.heavy are listed in `.chezmoiignore`** so they aren't
  deployed to `~`. They're consumed only by `brew bundle install` invoked from
  the install script.

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
