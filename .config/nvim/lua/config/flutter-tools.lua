local flutter_utils = require 'utils.flutter'

--[[ local lsp_status = require 'lsp-status'
lsp_status.register_progress() ]]

local capabilities = require('cmp_nvim_lsp').update_capabilities(vim.lsp.protocol.make_client_capabilities())
capabilities.textDocument.completion.completionItem.snippetSupport = true
capabilities.textDocument.completion.completionItem.resolveSupport = {
  properties = {
    'documentation',
    'detail',
    'additionalTextEdits',
  },
}
--[[ local on_capabilities = function(config)
  config.capabiltiies = vim.tbl_extend('keep', config.capabilities or {}, lsp_status.capabilities)
  return config
end ]]

require('flutter-tools').setup {
  ui = {
    -- the border type to use for all floating windows, the same options/formats
    -- used for ":h nvim_open_win" e.g. "single" | "shadow" | {<table-of-eight-chars>}
    border = 'rounded',
  },
  decorations = {
    statusline = {
      -- set to true to be able use the 'flutter_tools_decorations.app_version' in your statusline
      -- this will show the current version of the flutter app from the pubspec.yaml file
      app_version = false,
      -- set to true to be able use the 'flutter_tools_decorations.device' in your statusline
      -- this will show the currently running device if an application was started with a specific
      -- device
      device = false,
    },
  },
  debugger = { -- integrate with nvim dap + install dart code debugger
    enabled = true,
    run_via_dap = false,
  },
  fvm = true,
  -- flutter_path = "$HOME/fvm/default/bin/flutter", -- <-- this takes priority over the lookup
  -- flutter_lookup_cmd = '', -- example "dirname $(which flutter)" or "asdf where flutter"
  widget_guides = {
    enabled = false,
  },
  closing_tags = {
    -- highlight = "FlutterClosingTag", -- highlight for the closing tag
    highlight = 'Comment', -- highlight for the closing tag
    prefix = ' ~ ', -- character to use for close tag e.g. > Widget
    enabled = true, -- set to false to disable
  },
  dev_log = {
    open_cmd = '14new', -- command to use to open the log buffer
    auto_open = true,
  },
  dev_tools = {
    autostart = false, -- autostart devtools server if not detected
    auto_open_browser = false, -- Automatically opens devtools in the browser
  },
  outline = {
    open_cmd = '30vnew', -- command to use to open the outline buffer
    auto_open = false, -- if true this will open the outline automatically when it is first populated
  },
  lsp = {
    color = {
      enabled = true,
      background = false,
      virtual_text = true, -- show the highlight using virtual text
      virtual_text_str = '■', -- the virtual text character to highlight
    },
    -- on_attach = my_custom_on_attach,
    --- OR you can specify a function to deactivate or change or control how the config is created
    --[[ capabilities = function(config)
      config.specificThingIDontWant = false
      return config
    end, ]]
    capabilities = capabilities,
    on_attach = function(_, _)
      -- lsp_status.on_attach(client, bufnr)
      --[[ require('lsp_signature').on_attach({
        bind = true,
        handler_opts = {
          border = 'single',
        },
        hint_enable = false,
        hint_prefix = ': ',
        toggle_key = '<M-x>',
        timer_interval = '50',
      }, bufnr) ]]
    end,
    settings = {
      showTodos = false,
      completeFunctionCalls = true,
      lineLength = flutter_utils.get_line_length(),
      renameFilesWithClasses = 'always',
      analysisExcludedFolders = {
        vim.fn.expand '$HOME/.pub-cache',
        vim.fn.expand '$HOME/fvm/default',
        vim.fn.expand '$HOME/fvm/versions',
      },
    },
  },
}

require('telescope').load_extension 'flutter'

require('lsp-fastaction').setup {
  hide_cursor = true,
  action_data = {
    --- action for filetype dart
    ['dart'] = {
      -- pattern is a lua regex with lower case
      { pattern = 'import library', key = 'i', order = 1 },
      { pattern = 'wrap with widget', key = 'w', order = 2 },
      { pattern = 'wrap with column', key = 'c', order = 3 },
      { pattern = 'wrap with row', key = 'r', order = 3 },
      { pattern = 'wrap with sizedbox', key = 's', order = 3 },
      { pattern = 'wrap with container', key = 'C', order = 4 },
      { pattern = 'wrap with center', key = 'E', order = 4 },
      { pattern = 'padding', key = 'p', order = 4 },
      { pattern = 'wrap with builder', key = 'b', order = 5 },
      { pattern = 'wrap with streambuilder', key = 'S', order = 5 },
      { pattern = 'remove', key = 'd', order = 5 },

      --range code action
      { pattern = "surround with %'if'", key = 'i', order = 2 },
      { pattern = 'try%-catch', key = 't', order = 2 },
      { pattern = 'for%-in', key = 'f', order = 2 },
      { pattern = 'setstate', key = 's', order = 2 },
    },
    ['typescript'] = {
      { pattern = 'to existing import declaration', key = 'a', order = 2 },
      { pattern = 'from module', key = 'i', order = 1 },
    },
  },
}
