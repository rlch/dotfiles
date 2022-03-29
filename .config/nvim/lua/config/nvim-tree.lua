local g = vim.g

g.nvim_tree_respect_buf_cwd = 1

require('nvim-tree').setup {
  diagnostics = {
    enable = true,
    show_on_dirs = true,
    icons = {
      hint = '',
      info = '',
      warning = '',
      error = '',
    },
  },
  actions = {
    open_file = {
      window_picker = {
        exclude = {
          filetype = {
            'notify',
            'packer',
            'qf',
            'log',
            '__FLUTTER_DEV_LOG__',
          },
          buftype = {
            'log',
            '__FLUTTER_DEV_LOG__',
          },
        },
      },
    },
  },
  auto_close = false,
  view = {
    width = 35,
    auto_resize = true,
    preserve_window_proportions = true,
    mappings = {
      custom_only = true,
      list = {
        { key = { '<CR>', 'o', '<2-LeftMouse>' }, action = 'edit' },
        { key = { 'O' }, action = 'edit_no_picker' },
        { key = { '<2-RightMouse>', '<C-]>' }, action = 'cd' },
        { key = '<C-v>', action = 'vsplit' },
        { key = '<C-x>', action = 'split' },
        { key = '<C-t>', action = 'tabnew' },
        { key = '<', action = 'prev_sibling' },
        { key = '>', action = 'next_sibling' },
        { key = 'P', action = 'parent_node' },
        { key = '<BS>', action = 'close_node' },
        { key = '<Tab>', action = 'preview' },
        { key = 'K', action = 'first_sibling' },
        { key = 'J', action = 'last_sibling' },
        { key = 'I', action = 'toggle_ignored' },
        { key = 'H', action = 'toggle_dotfiles' },
        { key = 'R', action = 'refresh' },
        { key = 'a', action = 'create' },
        { key = 'd', action = 'remove' },
        { key = 'D', action = 'trash' },
        { key = 'r', action = 'rename' },
        { key = '<C-r>', action = 'full_rename' },
        { key = 'x', action = 'cut' },
        { key = 'c', action = 'copy' },
        { key = 'p', action = 'paste' },
        { key = 'y', action = 'copy_name' },
        { key = 'Y', action = 'copy_path' },
        { key = 'gy', action = 'copy_absolute_path' },
        { key = '[c', action = 'prev_git_item' },
        { key = ']c', action = 'next_git_item' },
        { key = '-', action = 'dir_up' },
        { key = 's', action = 'system_open' },
        { key = 'q', action = 'close' },
        { key = 'g?', action = 'toggle_help' },
        { key = 'W', action = 'collapse_all' },
        { key = 'S', action = 'search_node' },
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

g.nvim_tree_special_files = {
  ['pubspec.yaml'] = true,
  ['Cargo.toml'] = true,
  Makefile = true,
  ['README.md'] = true,
  ['readme.md'] = true,
  ['go.mod'] = true,
}

vim.cmd [[highlight NvimTreeSpecialFile guifg=#d8a657 gui=bold]]
