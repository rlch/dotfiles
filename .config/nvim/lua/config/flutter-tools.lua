local flutter_utils = require 'utils.flutter'

local illuminate_ok, illuminate = pcall(require, 'illuminate')
-- local lsp_status = require 'lsp-status'

local default_on_attach = function(client, _)
  if illuminate_ok then
    illuminate.on_attach(client)
  end
  -- lsp_status.on_attach(client)
end

local capabilities = require('cmp_nvim_lsp').update_capabilities(vim.lsp.protocol.make_client_capabilities())
-- capabilities = vim.tbl_extend('keep', capabilities, lsp_status.capabilities)

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
  debugger = { -- integrate with nvim dap + install dart code debugger
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
    capabilities = capabilities,
    on_attach = default_on_attach,
    settings = {
      showTodos = false,
      completeFunctionCalls = true,
      lineLength = flutter_utils.get_line_length(),
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

