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
   For fish/herdr/etc. that have a running daemon, also reload (e.g.
   `exec fish`, `herdr server reload-config`).
3. Commit + push when stable.

**Don't end a task assuming the user will apply later.** If you've changed
files under this repo, run `chezmoi apply` (or scope it: `chezmoi apply
~/.config/fish`) before reporting done — otherwise nothing you wrote is
actually in effect, and any "verification" you do is verifying the source
copy, not the live one.

The `dot_` prefix is a chezmoi requirement, not a style choice — files
prefixed `dot_foo` deploy as `~/.foo`, `executable_foo` deploys with mode 755,
`.tmpl` files are templated. Don't try to rename them.

## Repo layout

```
.chezmoi.toml.tmpl          → renders ~/.config/chezmoi/chezmoi.toml on init
.chezmoiignore.tmpl         → files NOT to deploy (templated by role)
.chezmoiscripts/            → run-on-change install hooks
.chezmoitemplates/          → shared partials referenced by `{{ template ... }}`
                              (e.g. obsidian-shared/ — see "Obsidian vaults" below)
Brewfile                    → packages, installed everywhere
Brewfile.heavy              → installed only when heavyHardware = true
dot_claude/                 → ~/.claude/ (settings.json, hooks)
dot_config/                 → ~/.config/ (aerospace, fish, ghostty, k9s,
                              lazydocker, starship.toml, cmux, herdr, tridactyl)
Knowledge/dot_obsidian/     → ~/Knowledge/.obsidian/ (notes vault config)
dev/trading/                → ~/dev/trading/.obsidian/ (per-project vault — vault root is the repo root, all .md across the repo become wikilinkable)
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
| Terminal       | Ghostty (auto-launches herdr; theme/font from Ghostty config) |
| Multiplexer    | herdr (daily driver; workspaces/tabs/panes); cmux retired as daily driver |
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
  aerospace, cmux (vim-style modal, below), nvim, fish abbreviations, and
  tridactyl. Cosmetic refactors fine; keybind changes are not.
- **k9s `config.yaml` is global prefs only**, not cluster state. k9s rewrites
  cluster-specific sections at runtime — keeping them in source pollutes the
  Mac mini and stale-clusters them.
- **tmux is fully removed (2026-07-01).** The user went cmux-native
  (2026-06-25) and then deleted the tmux config, packages, TPM, and all fish
  tmux helpers outright. Don't re-suggest tmux as the answer to multiplexing,
  and don't re-introduce fish tmux auto-attach. herdr (daily driver, since
  2026-07-01) owns multiplexing; cmux config is retained but is no longer the
  daily driver. Ghostty auto-launches herdr via `command = fish -l -C herdr`
  (detach with ⌃s q to fall back to a plain fish in the same window).
- **herdr keymap is canonical** — config at `dot_config/herdr/config.toml`,
  a matched pair with the ghostty ⌘-forwarding block (`dot_config/ghostty/config`);
  edit the two together. It mirrors the old cmux vim-modal keymap.
- **herdr worktrees — one workspace per branch.** Idiom: instead of running
  several agents in one shared `~`/`~/dev`-rooted workspace (which isn't a git
  work tree, so worktree actions warn), give each branch/task/agent its own
  isolated worktree-workspace. Two tiers, kept distinct by the push-guard:
  - `~/.herdr/worktrees/<repo>/<slug>` — **your** branches (interactive or
    supervised-agent). Pushable with the normal per-instance approval.
  - `<repo>/.claude/worktrees/*` — CC autonomous `isolation:"worktree"` dispatch;
    land via parent, push hard-denied by `git-push-guard.sh`.
  Drivers: the g-cluster keybinds (`⌃s ⇧g` new · `⌃s g` open/switch · `⌃s ⌃g`
  remove) for ad-hoc interactive worktrees, and — for the main use case,
  **implementing an OpenSpec change on its own branch** — the `rjm:opsx-worktree`
  skill (`~/dev/skills/plugins/rjm/skills/opsx-worktree/`), which creates the
  worktree off `main`, runs the standard `/opsx:apply` loop inside it, commits
  per task-group, and hands back a ready-to-PR branch. (The old `wt` fish helper
  was removed 2026-07-01 — the skill supersedes it for the agent flow; the raw
  `herdr worktree {create,remove}` CLI covers scripting.) Freeform slug = branch
  name (change name); add the conventional-commit prefix at squash-PR time. Base
  is local `main` (mind the origin/main-drift caveat). Note that herdr's remove
  leaves the branch dangling — delete it with `git -C <repo> branch -d <slug>`.
  Path-leak note: a Claude agent in a linked worktree can have Edit/Read/Write
  rerouted to the parent checkout for **relative/project-rooted** paths — the
  tools require absolute paths anyway, which are honored, so supervised agents
  are fine; reserve `.claude/worktrees` isolation for fully-autonomous fan-out.
- **cmux keymap** (retained, non-daily-driver) — config at `dot_config/cmux/cmux.json`
  (`shortcuts.bindings`). vim-style modal-mirror, carried over from the old
  zellij→tmux muscle memory. Each ctrl-letter prefix steals that key globally;
  don't "fix" that. Don't restructure without checking with
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
- **No floating/dropdown Ghostty.** Tried, rejected. Don't propose it.
- **Ghostty config has NO inline/trailing comments.** A `#` on the same line as
  a directive is parsed as part of the *value*, not stripped. This is silent and
  nasty for keybinds: `keybind = cmd+j=csi:106;9u   # ...` makes Ghostty send the
  CSI-u sequence **plus** the comment text as literal keystrokes — herdr eats the
  `ESC[…u` and the rest (`# herdr next_workspace …`) prints into the shell on every
  press (bit us 2026-07-01, the whole ⌘-forward block). Put every comment on its
  **own line above** the directive. Same rule for `text:`/`csi:` action payloads
  generally — whitespace and `#` after the value are not trimmed. After editing
  `dot_config/ghostty/config`, `chezmoi apply` then reload Ghostty (**⌘⇧,**) —
  keybind changes don't take effect until the config is reloaded.
- **`Brewfile` and `Brewfile.heavy` are listed in `.chezmoiignore`** so they
  aren't deployed to `~`. They're consumed only by `brew bundle install` from
  the install script (which hashes the Brewfile so external edits retrigger it).

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

