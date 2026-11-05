# herdr

Config: `dot_config/herdr/config.toml`, a matched pair with the ghostty ⌘-forwarding block
(`dot_config/ghostty/config`); edit the two together. The toml carries the full rationale. Reload
with `herdr server reload-config` (or `⌃s ⇧r`). Ghostty launches it with `command = fish -l -C
herdr`; detach with `⌃s q` to fall back to a plain fish in the same window. Its `⌘` chords reach it
only because Ghostty forwards them as CSI-u super sequences.

## Keymap (canonical; don't restructure without the operator)

Direct chords, exactly 2 keys, one-shot, no sticky modes. Each ctrl-letter prefix steals that key
globally; don't "fix" that.

- `⌃hjkl` focus panes (no prefix, repeatable). Deliberately shadows LazyVim's `⌃hjkl` window-nav
  in an nvim pane → use `⌃W hjkl` in nvim. Also eats readline `⌃K`/`⌃L` in shells (`⌘⇧K` clears).
- `⌘hjkl` navigate containers: `H/L` prev/next tab, `K/J` prev/next workspace. `⌘H` shadows macOS
  Hide; `⌘L` shadows browser address-bar focus (browser windows only). `⌘[` / `⌘]` focus
  prev/next agent.
- `⌃\` scroll/copy mode. `⌃S` is the single sub-prefix (workspace ops fold onto it; herdr has one
  prefix): `⌃s f` zoom · `⌃s ,` rename tab · `⌃s x` close workspace · `⌃s ⇧x` close tab · `⌃s ⇧w`
  rename workspace · `⌃s ⇧r` reload-config · `⌃s q` detach · `⌃s e` edit scrollback · `⌃s ⇧g`/`g`/`⌃g`
  worktree new/open/remove.
- Create / split / close on `⌘`: `⌘T` new tab · `⌘N` new workspace · `⌘D` split right · `⌘⇧D`
  split down · `⌘W` close focused pane · `⌘B` sidebar · `⌘P` workspace picker · `⌘E` resize mode.
  Direct pane swap: `⌃⌥hjkl`. Numeric jump: `⌃1-9` tab · `⌘1-9` agent (Nth entry in the agent
  panel; no numeric workspace jump, use `⌘K/J` or `⌘P`). There is no equalize action, so the
  Karabiner Left-Option-tap gesture only does zoom.

## Worktrees

`⌃s ⇧g` / `⌃s g` / `⌃s ⌃g` make, open and remove an ad-hoc worktree workspace under
`~/.herdr/worktrees/<repo>/<slug>`; the raw `herdr worktree {create,remove}` CLI covers scripting.
herdr's remove leaves the branch dangling: `git -C <repo> branch -d <slug>`.

## UI chrome

Themed Tokyo Night with Catppuccin Mocha token overrides (`config.toml [theme]`/`[ui]`):
transparent tab-bar/panels over the terminal bg, mauve accent, Surface0/2 for selection and
dividers. Terminal content colours and font remain Ghostty's (`theme = "Catppuccin Mocha"`).
