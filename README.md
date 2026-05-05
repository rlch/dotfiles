# dotfiles

Personal macOS dotfiles managed by [chezmoi](https://chezmoi.io). Source of
truth lives in this repo (`~/dev/dotfiles`); chezmoi renders/copies into `~`.

## Bootstrap a machine

```sh
brew install chezmoi
chezmoi init --apply rlch/dotfiles
```

You'll be prompted once for `role`:

| role   | machine                | extras                                 |
| ------ | ---------------------- | -------------------------------------- |
| `mbp`  | MacBook Pro M5 Max     | `Brewfile.heavy` (Ollama)              |
| `mini` | Mac mini (or anything else) | base `Brewfile` only              |

The role is persisted to `~/.config/chezmoi/chezmoi.toml`. Re-run
`chezmoi init` to be re-prompted.

## Day-to-day

```sh
chezmoi diff              # preview pending changes
chezmoi apply             # deploy
chezmoi cd                # cd into source dir
chezmoi edit ~/.config/foo/bar   # edit source for a deployed file
```

Edit files inside this repo (`dot_config/...`, `dot_claude/...`, `Brewfile`),
not the deployed copies in `~` — the next `chezmoi apply` will overwrite them.

## Stack

| Concern        | Tool                                                |
| -------------- | --------------------------------------------------- |
| Manager        | chezmoi                                             |
| Shell          | fish 4 + fisher                                     |
| Terminal       | Ghostty                                             |
| Multiplexer    | zellij                                              |
| Window manager | AeroSpace                                           |
| Editor         | Neovim (LazyVim base, no AI plugins)                |
| Prompt         | starship                                            |
| History        | atuin                                               |
| Versions       | mise (node, python, go, bun)                        |
| Git TUI        | lazygit                                             |
| Containers     | OrbStack                                            |
| AI CLIs        | Claude Code, Codex, Hermes Agent (heavy hardware)   |
| Local LLM      | Ollama (heavy hardware)                             |
| Browser        | Firefox + tridactyl                                 |
| Notes          | Obsidian                                            |
| Launcher       | Raycast                                             |
| Secrets        | 1Password CLI                                       |

## Layout

```
.chezmoi.toml.tmpl    → renders ~/.config/chezmoi/chezmoi.toml on init
.chezmoiignore        → files in this repo that shouldn't deploy to ~
.chezmoiscripts/      → run-on-change install hooks (brew, fisher)
Brewfile              → base packages, every machine
Brewfile.heavy        → installed only when role = mbp
dot_claude/           → ~/.claude/ (Claude Code settings)
dot_config/           → ~/.config/ (everything else)
```

`dot_` is a chezmoi prefix that maps to a leading `.` in `~`. Other prefixes:
`private_` (0700/0600 perms), `executable_` (0755), `create_` (write once,
never overwrite), `run_onchange_` (script that re-runs when its rendered
content changes).

See [`CLAUDE.md`](./CLAUDE.md) for the agent-oriented deep dive (conventions,
invariants, common tasks).
