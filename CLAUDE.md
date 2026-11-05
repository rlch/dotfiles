# Dotfiles — agent guide

Personal macOS dotfiles managed by **chezmoi**. Source of truth lives here (`~/dev/dotfiles`);
chezmoi renders/copies into `~`. How-to (drift, prefixes, adding a tool, reloads) is the
`dotfiles` skill; this file holds what must stay true.

## Edit here, not in `~`

Never edit `~/.config/*`, `~/.claude/*`, etc. directly: `chezmoi apply` overwrites them.

1. Edit a file under `dot_config/`, `dot_claude/`, `dot_agents/`, or root (`Brewfile`,
   `Brewfile.heavy`, `.chezmoiscripts/...`).
2. **Always run `chezmoi apply`** (scoped to the path when other targets drift), and reload the
   tool's daemon if it has one. Don't end a task assuming the user will apply later: until then
   nothing you wrote is in effect, and any check verifies only the source.
3. Commit + push when stable.

**Parse-check `dot_config/abyme/init.ts` before every `chezmoi apply`** (`npx -y esbuild
dot_config/abyme/init.ts`), and check abyme's config for `threw` afterwards. A syntax error there
(a `"` inside a double-quoted preset string, 2026-10-24) drops every preset after it. A config
line that needs abyme code not yet promoted stays out of this tree, on a branch, until that code
is live: any `chezmoi apply`, promote's own included, deploys the working tree, committed or not.
Keep a stop-gap in the abyme config (vim off on the phone) until its replacement is proven on the
operator's real device.

`rlch/dotfiles` is public and the one source: one `chezmoi apply`, no private overlay or second
source (tried and dropped, 2026-07-01). Secrets stay out (`.gitignore`).

The `dot_` / `executable_` / `private_` / `symlink_` prefixes and `.tmpl` suffix are chezmoi's,
not style: don't rename them away.

## Repo layout

```
.chezmoi.toml.tmpl     → ~/.config/chezmoi/chezmoi.toml on init (the role prompt)
.chezmoiignore.tmpl    → files NOT to deploy (templated by role; Brewfiles are here)
.chezmoiscripts/       → run-on-change install hooks
.chezmoitemplates/     → shared partials (agent-instructions/, obsidian-shared/)
Brewfile, Brewfile.heavy → packages (heavy only when heavyHardware)
dot_claude/            → ~/.claude/ (settings.json, hooks: pretool.sh → guard.py)
dot_agents/skills/     → ~/.agents/skills/ (this repo's skill, with the per-tool notes)
dot_config/            → ~/.config/ (abyme, omniwm, fish, ghostty, herdr, k9s, …)
Knowledge/dot_obsidian/, dev/trading/ → Obsidian vault configs
```

## Multi-host

An MBP M5 Max and a Mac mini share this repo, diverging on one `role`, prompted on `chezmoi init`
and kept in `~/.config/chezmoi/chezmoi.toml` (`role = "mbp"|"mini"`, `heavyHardware` true iff
mbp). `Brewfile.heavy` (Ollama) installs only on heavy hardware. Per-file divergence: `foo` →
`foo.tmpl` with `{{ if eq .role "mini" }}`; skip a file on one host with a templated
`.chezmoiignore` entry. Mini bootstrap: `brew install chezmoi && chezmoi init --apply rlch/dotfiles`,
answer "mini".

## Stack

Locked-in choices (don't re-litigate without checking with the user):

| Concern        | Tool                                                |
| -------------- | --------------------------------------------------- |
| Manager        | chezmoi                                             |
| Shell          | fish 4.x + fisher                                   |
| Terminal       | Ghostty (auto-launches herdr; theme/font from Ghostty config) |
| Multiplexer    | herdr (daily driver; workspaces/tabs/panes)         |
| IDE            | abyme, the only one (operator, 2026-11-05)          |
| Window manager | OmniWM                                              |
| Editor         | Neovim + LazyVim base (**no AI plugins** — pure editor) |
| Prompt         | starship                                            |
| Git TUI        | lazygit                                             |
| AI CLIs        | Claude Code + OpenCode + Codex CLI + Hermes Agent   |
| Local LLM      | Ollama (heavy hardware only)                        |
| Containers     | OrbStack                                            |
| Secrets        | 1Password CLI                                       |
| Browser        | Firefox (daily) + Chrome (secondary) + Brave (Gather PWA only, off Chrome's process tree) |
| Notes          | Obsidian                                            |
| Launcher       | Raycast                                             |

## Invariants

- **Preserve existing keymaps when porting.** The user has muscle memory in OmniWM (option
  layer), herdr (vim-style modal), nvim, fish abbreviations and tridactyl. Cosmetic refactors
  fine; keybind changes are not.
- k9s `config.yaml` is global prefs only, not cluster state: k9s rewrites cluster sections at
  runtime, and keeping them in source stale-clusters the Mac mini.

## Per-tool notes

Read the one for a tool before touching it (in `dot_agents/skills/dotfiles/`, deployed to
`~/.agents/skills/dotfiles/`):

- `herdr.md`: the canonical keymap, worktrees, UI chrome; a matched pair with Ghostty's ⌘ block.
- `omniwm.md`: settings.toml's modify script, the fork, the workspace layout and option layer.
- `ghostty.md`: no inline comments, reloads.
- `karabiner.md`: it rewrites its own json.
- `agents.md`: shared agent instructions and skills, Claude hooks, abyme's config.
- `nerd-fonts.md`: three-byte glyphs vanish from an Edit.
- `obsidian.md`: one shared config across vaults.
