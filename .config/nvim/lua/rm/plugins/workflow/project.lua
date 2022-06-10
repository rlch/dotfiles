require('project_nvim').setup {
  -- Manual mode doesn't automatically change your root directory, so you have
  -- the option to manually do so using `:ProjectRoot` command.
  manual_mode = false,
  detection_methods = { 'pattern', 'lsp' },
  patterns = {
    'pubspec.yaml',
    'melos.yaml',
    'cargo.toml',
    '_darcs',
    '.hg',
    '.bzr',
    '.svn',
    'Makefile',
    'package.json',
    'go.mod',
  },
  ignore_lsp = {},
  exclude_dirs = {},
  show_hidden = false,
  silent_chdir = true,
  datapath = vim.fn.stdpath 'data',
}

require('telescope').load_extension 'projects'
