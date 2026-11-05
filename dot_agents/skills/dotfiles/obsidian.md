# Obsidian vaults

Several vaults (the main `~/Knowledge/`, plus per-project vaults whose root is the repo root, e.g.
`~/dev/trading/`) share one canonical config, so plugins, themes, hotkeys and snippets behave the
same everywhere. Plain chezmoi, no custom script:

- Canonical content lives in `.chezmoitemplates/obsidian-shared/`, never deployed to a literal path.
- Per-vault wrappers live at `<vault-source-path>/dot_obsidian/<file>.tmpl`, each a single
  `{{- template "obsidian-shared/<file>" . -}}` line, so `chezmoi diff` shows real per-file diffs.
- Plugin and theme symlinks are `symlink_<name>.tmpl` files whose content is the target (usually
  `{{ .chezmoi.homeDir }}/dev/plugins/obsidian/<plugin>`; for Catppuccin, the Knowledge vault's
  themes dir, the one real copy).

Copy JSON but symlink themes and plugins: Obsidian writes JSON config without re-reading it, so
shared JSON symlinks get clobbered between vaults (pjeby/obsidian-symlinks). Read-only assets are
safe to symlink.

Add a vault: `cp -r ~/dev/dotfiles/Knowledge/dot_obsidian ~/dev/dotfiles/<source-path>/dot_obsidian`
(home-relative, `dot_` for leading dots), decide whether it needs `themes/symlink_Catppuccin.tmpl`,
then `chezmoi apply <vault>/.obsidian`. A setting for every vault: edit
`.chezmoitemplates/obsidian-shared/<file>` and apply.
