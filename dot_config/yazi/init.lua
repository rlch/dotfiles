-- Yazi entry point. Plugins are installed declaratively from
-- package.toml via `ya pkg install` (run by the chezmoi post-install script).

-- Persistent full-width borders (toggle with `Z`).
require("full-border"):setup()

-- Git status indicators in the file list (uses the prepend_fetcher
-- declared in yazi.toml).
require("git"):setup()

-- Replace yazi's path display in the status bar with starship.
require("starship"):setup()

-- Persistent bookmarks via yamb (yet another mini bookmarks).
-- Storage: ~/.config/yazi/bookmark (plain file, easy to inspect / sync).
-- Bindings live in keymap.toml under the `b` prefix.
require("yamb"):setup({
  cli         = "fzf",  -- jump_by_fzf / delete_by_fzf / rename_by_fzf use fzf
  jump_notify = true,
  keys        = "abcdefghijklmnopqrstuvwxyz0123456789",
  path        = (os.getenv("HOME") or "") .. "/.config/yazi/bookmark",
})

-- Easymotion-style label jumping to filenames in current pane (catppuccin
-- macchiato palette so it doesn't fight the flavor).
require("searchjump"):setup({
  unmatch_fg               = "#6e738d",  -- overlay0
  match_str_fg             = "#24273a",  -- base
  match_str_bg             = "#a6da95",  -- green
  first_match_str_fg       = "#24273a",
  first_match_str_bg       = "#eed49f",  -- yellow
  label_fg                 = "#24273a",
  label_bg                 = "#f5a97f",  -- peach
  only_current             = false,
  show_search_in_statusbar = true,
  auto_exit_when_unmatch   = true,
  enable_capital_label     = true,
})
