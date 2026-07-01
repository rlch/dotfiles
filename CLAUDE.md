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
.chezmoidata.yaml           → module defaults (all on); forks override in their config
.chezmoiignore.tmpl         → files NOT to deploy (templated by role + modules)
.chezmoiscripts/            → run-on-change install hooks
.chezmoitemplates/          → shared partials referenced by `{{ template ... }}`
                              (e.g. obsidian-shared/ — see "Obsidian vaults" below)
Brewfile                    → CORE packages, installed everywhere
Brewfile.d/<module>         → opt-in module packages (bundled when that module is on)
Brewfile.personal           → machine-local extras (gitignored; copy the .example)
Brewfile.heavy              → installed only when heavyHardware = true
dot_claude/                 → ~/.claude/ (settings.json, hooks)
dot_config/                 → ~/.config/ (aerospace, fish, ghostty, k9s,
                              lazydocker, starship.toml, cmux, tmux, tridactyl)
Knowledge/dot_obsidian/     → ~/Knowledge/.obsidian/ (notes vault config)
dev/trading/                → ~/dev/trading/.obsidian/ (per-project vault — vault root is the repo root, all .md across the repo become wikilinkable)

~/dev/dotfiles-private/     → PRIVATE overlay (separate repo, NOT here): owner
                              secrets/host/personal config, applied on top. See
                              "Module system & fork model" below.
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

## Module system & fork model (team-installable)

This repo is **public** and meant to be **forked**: a teammate forks it,
customises freely, and `git pull`s upstream updates *without conflicts*. Two
mechanisms make that work — keep both intact when editing.

### Core + private overlay

- **This repo = public core.** De-identified, shareable. **Never add secrets,
  host names, Tailscale IPs, or personal-project specifics here** — on a public
  repo, gating hides from *deploy*, not from *git history*.
- **`~/dev/dotfiles-private` = private overlay** (separate local repo, no public
  remote). Owner-only: SSH/host config, self-hosted services, trading infra,
  personal AI tooling, owner-only fish fns, the full owner `~/.claude/settings.json`,
  and owner-only brew packages (its own `Brewfile`). Applied as a **second chezmoi
  source on top** of the public apply (`chezmoi apply --source ~/dev/dotfiles-private`;
  last-write-wins → overlay overrides core).
- **Rule of thumb:** secret / host-specific / personal-only → overlay. Shareable
  → here.

### Modules (opt-in; conflict-free opt-out)

Optional functionality is grouped into **modules**, each a boolean flag:

- **Defaults** live in `.chezmoidata.yaml` (`modules:` map, all `true` = the full
  upstream setup, so a fresh checkout / your own machine gets everything).
- **A fork opts OUT** by setting a module `false` under `[data.modules]` in its
  OWN `~/.config/chezmoi/chezmoi.toml` — **never by editing repo files**. Git only
  conflicts on shared-file edits, so this keeps upstream pulls clean.
- **Config dirs** are gated in `.chezmoiignore.tmpl`:
  `{{ if not .modules.X }} .config/foo {{ end }}` → skipped when off.
- **Packages** are gated by the installer: each module's brews live in
  `Brewfile.d/<module>.brewfile`, bundled by
  `run_onchange_install-packages.sh.tmpl` only when the flag is on.

Modules today: `multiplexer windowmanager keybindings containers rustdev webdev
gitui aistack cloud datascience diagrams browsers remote notes`. **Core** (always
installed) is everything not in a module.

### Fork-conflict discipline (the key invariant)

Upstream pulls stay clean **only if personal changes never touch upstream-owned
files.** So every customisation has a home that isn't a shared file — and when
you add config to the base, prefer **drop-in dirs / include directives** over
monolithic single files:

| Customisation | Goes in (never edit the shared file) |
| --- | --- |
| identity (name/email) | chezmoi config `[data]` → templated into gitconfig |
| turn a tool off | `[data.modules].X = false` in the fork's config |
| add packages | `Brewfile.personal` (gitignored) |
| add fish aliases/fns | `conf.d/*.fish`, `functions/*.fish` (drop-in) |
| add nvim plugins | `lua/plugins/local-*.lua` (LazyVim drop-in spec) |
| override git | `[include] ~/.gitconfig.local` |

### Recipes

- **Add a module `foo`:** add `foo: true` to `.chezmoidata.yaml`; gate its config
  dirs in `.chezmoiignore.tmpl`; drop a `Brewfile.d/foo.brewfile`. The installer
  picks it up automatically — nothing else to wire.
- **Make something owner-only:** move the file(s) into `~/dev/dotfiles-private/`
  (same `dot_`/`private_` layout); move owner-only brews to the overlay's `Brewfile`.
- **Forker opts out of `foo`:** they add `[data.modules] foo = false` to their own
  `~/.config/chezmoi/chezmoi.toml`. Zero repo edits.

## Stack

Locked-in tool choices (don't re-litigate without checking with the user):

| Concern        | Tool                                                |
| -------------- | --------------------------------------------------- |
| Manager        | chezmoi                                             |
| Shell          | fish 4.x + fisher                                   |
| Terminal       | cmux (Ghostty-based; colors/font still from Ghostty config) |
| Multiplexer    | cmux-native (workspaces/surfaces/splits) — tmux retired in-pane |
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
  aerospace, cmux (vim/tmux-style, below), nvim, fish abbreviations, and
  tridactyl. Cosmetic refactors fine; keybind changes are not.
- **k9s `config.yaml` is global prefs only**, not cluster state. k9s rewrites
  cluster-specific sections at runtime — keeping them in source pollutes the
  Mac mini and stale-clusters them.
- **Fish does not auto-attach tmux.** This was deliberately dropped from the
  zellij config and stays dropped; don't re-introduce it.
- **cmux is the daily driver; tmux is retired in-pane.** The user went
  cmux-native (2026-06-25) — cmux's own workspaces/surfaces/splits replace
  what tmux used to do. The `tmux/` config still ships but isn't the daily
  multiplexer; don't re-suggest tmux as the answer to multiplexing.
- **cmux keymap is canonical** — config at `dot_config/cmux/cmux.json`
  (`shortcuts.bindings`). vim/tmux modal-mirror, ported from the old zellij→tmux
  muscle memory. Each ctrl-letter prefix steals that key globally (same as the
  old modal tmux); don't "fix" that. Don't restructure without checking with
  the user. **cmux chords are exactly 2 keys, one-shot — no sticky modes.**
  - `⌃ hjkl` — focus panes (no prefix, repeatable). Deliberately **shadows
    LazyVim's `⌃hjkl` window-nav** while in an nvim pane (cmux has no
    vim-aware passthrough) → use `⌃W hjkl` in nvim. Also eats readline
    `⌃K`/`⌃L` in shells (`⌘⇧K` clears).
  - `⌘ hjkl` — navigate containers (moved off `⌃⌥hjkl`): `H/L` prev/next tab
    (surface), `K/J` prev/next workspace (sidebar is vertical). `⌘H` shadows
    macOS Hide; `⌘L` shadows browser address-bar focus (browser panes only).
  - `⌃\` scroll/copy mode (moved off `⌃B`, which now passes through to the
    shell as readline backward-char) · `⌃S` prefix — `f` zoom, `=` equalize,
    `,` rename tab · `⌃Q` workspace prefix (`,` rename, `x` close). `⌃A`
    left free → readline beginning-of-line.
  - Create / split / close live on `⌘` keys (reworked 2026-06-26): `⌘T` new
    tab (cmux `newSurface`, the horizontal bar) · `⌘N` new tab / right-sidebar
    entry (cmux `newTab`) · `⌘D` split right · `⌘⇧D` split down (cmux/iTerm2
    default — keeps `⌘V` paste / `⌘S` save) · `⌘W` close (cmux `closeTab`).
    `newWindow` unbound; `⌘⇧N` free.
  - Kept on cmux defaults: `⌘1-9` jump workspace · `⌘P` switcher ·
    `⌃1-9` jump surface · `⌘⇧K` clear · `⌘⇧P` palette.
- **cmux UI chrome is themed to Catppuccin Mocha** to match the Ghostty
  terminal theme: `app.appearance=dark`, sidebar tracks terminal bg + faint
  mauve wash, workspace rail palette = Catppuccin Mocha named swatches.
  Terminal *content* colors/font remain Ghostty's job (`theme = "Catppuccin
  Mocha"`), not cmux's.
- **`⌃-e`** is herdr's prefix — left unbound in cmux so it passes through to
  whatever's in the focused pane (herdr in herdr panes; fish's end-of-line
  elsewhere).
- **Window names auto-slugify to ≤10 chars** via `~/.config/tmux/slugify-title.py`
  on the `window-renamed` hook. Claude Code's OSC titles get NLP-picked salient
  tokens (proper nouns / ALLCAPS preferred); paths get basenamed; long words
  get vowel-dropped. Idempotent.
- **No floating/dropdown Ghostty.** Tried, rejected. Don't propose it.
- **All `Brewfile*` (core, `Brewfile.d/`, `.heavy`, `.personal`) are ignored via
  the `Brewfile*` entry in `.chezmoiignore`** so they aren't deployed to `~`.
  They're consumed only by `brew bundle install` from the install script, which
  bundles core + each enabled module fragment + `Brewfile.personal`.

## Obsidian vaults

Multiple Obsidian vaults live across the filesystem (the main `~/Knowledge/`
plus per-project vaults where the vault root is the project repo root, e.g. `~/dev/trading/` with `.obsidian/` at the repo root). They all share **one
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

