require('neo-tree').setup {
  popup_border_style = 'rounded',
  enable_git_status = true,
  enable_diagnostics = true,
  filesystem = {
    filters = { --These filters are applied to both browsing and searching
      show_hidden = false,
      respect_gitignore = true,
    },
    follow_current_file = true, -- This will find and focus the file in the
    -- active buffer every time the current file is changed while the tree is open.
    use_libuv_file_watcher = true, -- This will use the OS level file watchers
    -- to detect changes instead of relying on nvim autocmd events.
    window = {
      position = 'left',
      width = 40,
      mappings = {
        ['<2-LeftMouse>'] = 'open',
        ['<cr>'] = 'open',
        ['s'] = 'open_split',
        ['v'] = 'open_vsplit',
        ['C'] = 'close_node',
        ['<bs>'] = 'navigate_up',
        ['.'] = 'set_root',
        ['H'] = 'toggle_hidden',
        ['I'] = 'toggle_gitignore',
        ['R'] = 'refresh',
        ['/'] = 'filter_as_you_type',
        --["/"] = "none" -- Assigning a key to "none" will remove the default mapping
        ['f'] = 'filter_on_submit',
        ['<c-x>'] = 'clear_filter',
        ['a'] = 'add',
        ['d'] = 'delete',
        ['r'] = 'rename',
        ['c'] = 'copy_to_clipboard',
        ['x'] = 'cut_to_clipboard',
        ['p'] = 'paste_from_clipboard',
        ['bd'] = 'buffer_delete',
      },
    },
  },
  buffers = {
    show_unloaded = true,
    window = {
      position = 'left',
      mappings = {
        ['<2-LeftMouse>'] = 'open',
        ['<cr>'] = 'open',
        ['s'] = 'open_split',
        ['v'] = 'open_vsplit',
        ['<bs>'] = 'navigate_up',
        ['.'] = 'set_root',
        ['R'] = 'refresh',
        ['a'] = 'add',
        ['d'] = 'delete',
        ['r'] = 'rename',
        ['c'] = 'copy_to_clipboard',
        ['x'] = 'cut_to_clipboard',
        ['p'] = 'paste_from_clipboard',
      },
    },
  },
  git_status = {
    window = {
      position = 'float',
      mappings = {
        ['<2-LeftMouse>'] = 'open',
        ['<cr>'] = 'open',
        ['s'] = 'open_split',
        ['v'] = 'open_vsplit',
        ['C'] = 'close_node',
        ['R'] = 'refresh',
        ['d'] = 'delete',
        ['r'] = 'rename',
        ['c'] = 'copy_to_clipboard',
        ['x'] = 'cut_to_clipboard',
        ['p'] = 'paste_from_clipboard',
        ['A'] = 'git_add_all',
        ['gu'] = 'git_unstage_file',
        ['ga'] = 'git_add_file',
        ['gr'] = 'git_revert_file',
        ['gc'] = 'git_commit',
        ['gp'] = 'git_push',
        ['gg'] = 'git_commit_and_push',
      },
    },
  },
}
