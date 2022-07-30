require('flutter-tools').setup {
  ui = {
    border = 'rounded',
  },
  decorations = {
    statusline = {
      app_version = false,
      device = false,
    },
  },
  debugger = {
    enabled = true,
    run_via_dap = false,
  },
  fvm = true,
  widget_guides = {
    enabled = false,
  },
  closing_tags = {
    highlight = 'Comment',
    prefix = ' ~ ',
    enabled = true,
  },
  dev_log = {
    open_cmd = '14new',
    auto_open = true,
  },
  dev_tools = {
    autostart = false,
    auto_open_browser = false,
  },
  outline = {
    open_cmd = '30vnew',
    auto_open = false,
  },
  lsp = {
    color = {
      enabled = true,
      background = false,
      virtual_text = true,
      virtual_text_str = '■',
    },
    capabilities = R.lsp.capabilities,
    on_attach = R.lsp.on_attach,
    settings = {
      showTodos = false,
      completeFunctionCalls = true,
      lineLength = (function()
        return vim.fn.expand('%:p'):find '^/Users/rjm/Coding/Tutero/' and 100 or 80
      end)(),
      automaticCommentSlashes = 'all',
      renameFilesWithClasses = 'always',
      onlyAnalyzeProjectsWithOpenFiles = true,
      analysisExcludedFolders = {
        vim.fn.expand '$HOME/.pub-cache/',
        vim.fn.expand '$HOME/fvm/versions/*',
        vim.fn.expand '$HOME/fvm/versions/*/packages/*',
        vim.fn.expand '$HOME/.pub-cache/*',
        vim.fn.expand '$HOME/fvm/*/.pub-cache/hosted/*',
      },
    },
  },
}

require('telescope').load_extension 'flutter'
