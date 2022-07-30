local neogit = require 'neogit'
local has_diffview, diffview = pcall(require, 'diffview')

if has_diffview then
  diffview.setup {}
end

neogit.setup {
  disable_signs = false,
  disable_hint = false,
  disable_context_highlighting = false,
  disable_commit_confirmation = false,
  -- Neogit refreshes its internal state after specific events, which can be expensive depending on the repository size.
  -- Disabling `auto_refresh` will make it so you have to manually refresh the status after you open it.
  auto_refresh = true,
  disable_builtin_notifications = false,
  use_magit_keybindings = false,
  commit_popup = { kind = 'split' },
  kind = 'tab',
  signs = {
    section = { '>', 'v' },
    item = { '>', 'v' },
    hunk = { '', '' },
  },
  integrations = { diffview = true },
  sections = {
    untracked = { folded = false },
    unstaged = { folded = false },
    staged = { folded = false },
    stashes = { folded = true },
    unpulled = { folded = true },
    unmerged = { folded = false },
    recent = { folded = true },
  },
  mappings = {
    status = {
      ['B'] = 'BranchPopup',
    },
  },
}
