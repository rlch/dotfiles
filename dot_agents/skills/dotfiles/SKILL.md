---
name: dotfiles
description: >-
  Edit the user's chezmoi-managed macOS dotfiles in ~/dev/dotfiles. Use whenever
  changing fish, Ghostty, OmniWM, Starship,
  Claude, Karabiner, Homebrew, ~/.config, ~/.claude, or another
  home-rooted configuration; also use when installing a tool, bootstrapping a
  machine, or making a setting persist. Always edit the source repository, run
  chezmoi apply, preserve the established stack and keymaps, and inspect similar
  existing config before writing.
---

# Dotfiles

The operator's macOS dotfiles live in `~/dev/dotfiles` (chezmoi, GitHub `rlch/dotfiles`, public).
Everything under `~/.config/`, `~/.claude/`, `~/.agents/`, the home-rooted dotfiles, `Brewfile*`
and the install scripts deploys from there. Read the repo's `CLAUDE.md` first: it holds the
invariants (stack, keymaps, multi-host, the init.ts parse-check). This skill holds the how-to.

## Edit source, then apply

1. Find the source under `~/dev/dotfiles/` (`chezmoi source-path <target>`, or the prefixes
   below). For a deployed skill or other link, resolve it with `realpath` first; if `chezmoi
   source-path <realpath>` reports a managed source, edit that, else edit the real source directly.
2. Edit it, in the voice of what is near it: look at 2-3 analogous entries first (`rg -n
   '<pattern>' dot_config/ dot_claude/`) and match their comments, naming and where the "why" goes.
3. `chezmoi apply` (or scoped: `chezmoi apply ~/.config/fish`).
4. Reload the live process:
   - fish: `exec fish` (or a new pane).
   - OmniWM: `chezmoi apply ~/.config/omniwm/settings.toml` (diff first, omniwm.md); it reloads
     the file itself.
   - Karabiner: picks it up itself.
   - Ghostty: ⌘⇧, (keybinds need it).
   - abyme (`dot_config/abyme/`): parse-check with `npx -y esbuild` before applying; abymed
     reloads, then `curl -s localhost:4477/api/config` shows `problems` and `threw`.
   - Claude Code `settings.json`: next turn or restart, by setting.
5. Commit and push when stable: `type(scope): subject`.

Don't end a task assuming the operator will apply later.

### When `chezmoi apply` blocks on drift

"X has changed since chezmoi last wrote it" means a deployed file drifted (a tool rewrote it, or a
build artifact). Either apply just your path (`chezmoi apply ~/.config/fish/config.fish`), or, when
the drift is the operator's own, `chezmoi re-add <target>`; `--force <target>` only when the source
already keeps it. A build artifact (`__pycache__`, a regenerated lockfile) goes in
`.chezmoiignore`. A file with a modify script (OmniWM) can't be re-added: copy the change in by hand.

## Prefixes

| In the repo                      | Deploys as              | Example |
| :------------------------------- | :---------------------- | :------ |
| `dot_foo`                        | `~/.foo`                | `dot_claude/` → `~/.claude/` |
| `executable_foo`                 | `foo`, mode 755         | `dot_claude/executable_pretool.sh` |
| `private_dot_foo`                | `~/.foo`, mode 600      | `private_dot_gitconfig` |
| `symlink_foo.tmpl`               | a link to its content   | `dot_claude/skills/symlink_rjm.tmpl` |
| `modify_foo.tmpl`                | `foo`, rewritten from the live copy | `dot_config/omniwm/modify_settings.toml.tmpl` |
| `foo.tmpl`                       | a Go template, rendered | `.chezmoi.toml.tmpl` |
| `run_onchange_*.sh.tmpl`         | runs when its hash changes | `.chezmoiscripts/run_onchange_install-packages.sh.tmpl` |

Agent instructions: a rule for every client goes in `.chezmoitemplates/agent-instructions/common.md`,
a Claude-only one in `dot_claude/CLAUDE.md.tmpl` (agents.md). "This repo's CLAUDE.md" is `~/dev/dotfiles/CLAUDE.md`,
not deployed; another project's CLAUDE.md is not a dotfiles edit.

## Multi-host

Ask whether a change applies on both machines. If not, encode it in source: `foo.tmpl` with
`{{ if eq .role "mini" }}`, a templated `.chezmoiignore` entry, or `Brewfile.heavy`. Never skip it
on the deploy side.

## Adding a tool

1. Add it to `Brewfile` (or `Brewfile.heavy` if heavy-hardware-only). Ask before installing.
2. Config under `dot_config/<tool>/` (or `dot_<tool>/` for home-rooted).
3. `chezmoi apply`: the install script hashes the Brewfiles, so it reruns on a change.
4. `brew bundle check --file=Brewfile`.

A tool needing its own installer (cargo, curl|sh) gets a
`.chezmoiscripts/run_onchange_install-<tool>.sh.tmpl` modelled on the existing ones (skip if the
version matches, log why, gate on `chezmoi.os == darwin`).

## Cheat sheet

```sh
chezmoi diff                              # preview (redact secrets before showing it)
chezmoi apply ~/.config/fish/config.fish  # scoped deploy
chezmoi source-path ~/.config/foo/bar     # the source of a deployed file
chezmoi re-add ~/.config/foo/bar          # absorb a deployed-side change
chezmoi managed | grep foo                # is it managed?
brew bundle check --file=Brewfile.heavy
```

## When to ask

Ask before changing keybindings in use, re-opening a locked-in stack choice, adding a heavy
package to the base Brewfile, or anything on the mini you can't test here. Everything else (a fish
function, an OmniWM rule, a Claude hook, a starship segment):
research the pattern and ship it.

## Per-tool notes

Read the one for the tool before touching it, beside this file:

- `omniwm.md`: settings.toml's modify script, the fork and its update, workspaces and the option layer.
- `ghostty.md`: no inline comments, reloads.
- `karabiner.md`: it rewrites its own json.
- `agents.md`: shared agent instructions, skills, Claude hooks, abyme's config.
- `nerd-fonts.md`: three-byte glyphs vanish from an Edit or Write.
