# OmniWM

- **OmniWM rewrites `settings.toml` itself** (its Settings window, sorting keys and dropping
  comments), so the file carries no comments. Its source is `dot_config/omniwm/.settings.toml`,
  deployed by `modify_settings.toml.tmpl`, which keeps the live labels of workspaces 4-10 (abyme's
  wm plugin writes them): `chezmoi apply ~/.config/omniwm/settings.toml`. Before applying, diff
  `chezmoi cat ~/.config/omniwm/settings.toml | diff - ~/.config/omniwm/settings.toml`. A change
  made in its UI is copied into `.settings.toml` by hand (`chezmoi cat` against the live file shows
  it); `re-add` cannot take a modify script. The schema is strict: a missing key or a binding used
  twice rejects the whole file, and OmniWM then runs on defaults. Workspace `name`s must be numbers
  ("1".."10"). IPC is on: `omniwmctl` (abyme's window-manager service). The bar is the fork's
  shell, `dot_config/omniwm/shell/shell.toml`: an island, not full width (the operator's setup,
  2026-11-03); its `[profiles.default.workspaceBar]` overrides `settings.toml`'s. Hiding the macOS
  menu bar under it was tried and dropped (2026-11-03). A schema bump (v4 to v5, 2026-11-03)
  migrates the live file once: copy it back into `.settings.toml`, or chezmoi reverts it and
  OmniWM blocks writes once both `settings.toml.pre-v<N>` backups are taken.
- **OmniWM is the operator's fork, not the cask** (2026-11-03): `rlch/OmniWM` branch
  `window-reveal`, cloned at `~/dev/forks/OmniWM`. Sparkle is off (`updateChecksEnabled = false`),
  since an upstream update would replace the fork. To update: rebase `window-reveal` on upstream
  `main`, build in a tart VM with `Scripts/omniwm-fork-build.sh` (it needs a newer Xcode than the
  host's), copy the app out, then run `Scripts/omniwm-fork-install.sh <app>`. That script signs it
  with the Developer ID, checks it, uninstalls the cask if present, swaps `/Applications/OmniWM.app`
  (keeping the previous one in `~/.local/state/omniwm-fork`), links `omniwmctl` and writes its fish
  completion. The first switch from the cask asks for Accessibility and Input Monitoring again.
  The fork stays for `edgeOutset` and `niri.partialColumnPreview` (settings.toml uses both; the
  cask's strict schema rejects them). abyme stopped calling window reveal (abyme 85993b637), so
  its IPC commit (38513a08) can go at the next rebase. It also carries `passthroughBundleIDs` (PR #1, 511adc29):
  ⌥H/J/K/L/S/F/R pass through to abyme.app, which hands focus back at its edge (wm-edge-keys).
- **OmniWM workspaces: two on letters, eight on numbers** (operator, 2026-11-02; ⌥a folded into
  ⌥1, 2026-11-03): ten Niri workspaces. On letters: 1 `web` (Firefox, `⌥w`), 2 `comms` (Slack,
  Gather, Telegram, `⌥m`); `⌥⇧` + the letter moves a window there. 3 `abyme` is `⌥1`, abyme.app's
  main window, repository-agnostic. Only these apps route, by `assignToWorkspace`; other app rules
  only float or size. Workspaces 4-10 are repositories, labelled 2-8 and on `⌥2-8` (`⌥⇧1-8`
  moves): one per repository, its terminal, its abyme window and its browser side by side as
  columns. The labels are the repository's name while abyme holds one there (`wm.setup` in
  init.ts). Pinned (operator, 2026-11-03): ⌥2 abyme, ⌥3 schools (~/dev/tutero), ⌥4 dotfiles; ⌥5-8
  go to any other repository, first free. Displays by each workspace's `monitorAssignment` (all
  fall back to the one display there is). Option is the window layer: `⌥hl` column, `⌥jk` window or next/previous workspace, `⌥⇧hjkl` move,
  `⌥r` width preset, `⌥f` full width, `⌥c` center, `⌥[`/`⌥]` into/out of column, `⌥,` tabbed, `⌥s`
  the chat scratchpad (`⌥⇧s` adds a window: membership ends when OmniWM restarts), `⌥⇧o`
  overview. A window open before a rule change moves with
  `omniwmctl rule apply --pid <pid>`.
