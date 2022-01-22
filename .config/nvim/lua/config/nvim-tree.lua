local g = vim.g
local tree_cb = require('nvim-tree.config').nvim_tree_callback

g.nvim_tree_respect_buf_cwd = 1

require('nvim-tree').setup {
  diagnostics = {
    enable = true,
    show_on_dirs = true,
  },
  auto_close = false,
  view = {
    width = 35,
    auto_resize = true,
    mappings = {
      custom_only = false,
      list = {
        { key = { '<CR>', 'o' }, cb = tree_cb 'edit', mode = 'n' },
      },
    },
  },
  hijack_cursor = true,
  update_cwd = true,
  update_focused_file = {
    enable = true,
    update_cwd = true,
  },
  -- update_to_buf_dir = { enable = true },
}

g.nvim_tree_show_icons = {
  files = 1,
}

g.nvim_tree_highlight_opened_files = 3

-- g.nvim_tree_disable_window_picker = 1
g.nvim_tree_window_picker_exclude = {
  filetype = {
    'notify',
    'packer',
    'qf',
    'log',
  },
  buftype = {
    'log',
    '__FLUTTER_DEV_LOG__',
  },
}

g.nvim_tree_special_files = {
  ['pubspec.yaml'] = true,
  ['Cargo.toml'] = true,
  Makefile = true,
  ['README.md'] = true,
  ['readme.md'] = true,
}

vim.cmd [[highlight NvimTreeSpecialFile guifg=#d8a657 gui=bold]]
