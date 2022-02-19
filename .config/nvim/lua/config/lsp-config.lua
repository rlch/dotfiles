local conf = require 'lspconfig'
--[[ local lsp_status = require 'lsp-status'
lsp_status.register_progress() ]]

--[[ lsp_status.config {
  kind_labels = {
    Text = '',
    Method = '',
    Function = '',
    Constructor = '',
    Field = 'ﰠ',
    Variable = '',
    Class = '',
    Interface = '',
    Module = '',
    Property = 'ﰠ',
    Unit = '塞',
    Value = '',
    Enum = '',
    Keyword = '',
    Snippet = '',
    Color = '',
    File = '',
    Reference = '',
    Folder = '',
    EnumMember = '',
    Constant = '',
    Struct = 'פּ',
    Event = '',
    Operator = '',
    TypeParameter = '',
  },
  indicator_errors = '',
  indicator_warnings = '',
  indicator_info = '',
  indicator_hint = '',
  status_symbol = '',
} ]]

local HOME = vim.fn.expand '$HOME'
local platform = ''
if vim.fn.has 'mac' == 1 then
  platform = 'macOS'
elseif vim.fn.has 'unix' == 1 then
  platform = 'Linux'
end

local sumneko_root_path = HOME .. '/.config/lua-language-server'
local sumneko_binary = HOME .. '/.config/lua-language-server/bin/' .. platform .. '/lua-language-server'
local omnisharp_bin = HOME .. '/.config/omnisharp/run'

--[[ vim.lsp.handlers["textDocument/publishDiagnostics"] = vim.lsp.with(
  vim.lsp.diagnostic.on_publish_diagnostics, {
    update_in_insert = true,
  }
) ]]
local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities = require('cmp_nvim_lsp').update_capabilities(capabilities)
-- capabilities = vim.tbl_extend('keep', capabilities, lsp_status.capabilities)

conf.yamlls.setup {
  settings = {
    yaml = {
      format = {
        enable = true,
        singleQuote = true,
      },
    },
  },
  -- on_attach = lsp_status.on_attach,
  capabilities = capabilities,
}

conf.pyright.setup {
  -- on_attach = lsp_status.on_attach,
  capabilities = capabilities,
}

-- conf.jsonls.setup {
--   commands = {
--     Format = {
--       function()
--         vim.lsp.buf.range_formatting({}, { 0, 0 }, { vim.fn.line '$', 0 })
--       end,
--     },
--   },
--   on_attach = function(client)
--     client.resolved_capabilities.document_formatting = false
--     client.resolved_capabilities.document_range_formatting = false
--   end,
--   capabilities = capabilities,
-- }

conf.tsserver.setup {
  on_attach = function(_)
    -- client.resolved_capabilities.document_formatting = false
    -- client.resolved_capabilities.document_range_formatting = false
  end,
  capabilities = capabilities,
}

conf.sumneko_lua.setup {
  cmd = { sumneko_binary, '-E', sumneko_root_path .. '/main.lua' },
  settings = {
    Lua = {
      runtime = {
        -- Tell the language server which version of Lua you're using (most likely LuaJIT in the case of Neovim)
        version = 'LuaJIT',
        -- Setup your lua path
        path = vim.split(package.path, ';'),
      },
      diagnostics = {
        -- Get the language server to recognize the `vim` global
        globals = { 'vim' },
      },
      workspace = {
        -- Make the server aware of Neovim runtime files
        library = {
          [vim.fn.expand '$VIMRUNTIME/lua'] = true,
          [vim.fn.expand '$VIMRUNTIME/lua/vim/lsp'] = true,
        },
      },
    },
  },
  -- on_attach = lsp_status.on_attach,
  capabilities = capabilities,
}

local pid = vim.fn.getpid()
conf.omnisharp.setup {
  cmd = { omnisharp_bin, '--languageserver', '--hostPID', tostring(pid) },
  root_dir = conf.util.root_pattern('*.csproj', '*.sln'),
  -- on_attach = lsp_status.on_attach,
  capabilities = capabilities,
}

require('lspconfig').gopls.setup {}

--[[ conf.efm.setup {
    init_options = {documentFormatting = true},
    filetypes = {"lua"},
    settings = {
        rootMarkers = {".git/"},
        languages = {
            lua = {
                {
                    formatCommand = "lua-format -i --no-keep-simple-function-one-line --no-break-after-operator --column-limit=150 --break-after-table-lb",
                    formatStdin = true
                }
            }
        }
    }
} ]]

--[[ conf.rust_analyzer.setup {
  capabilities = require('cmp_nvim_lsp').update_capabilities(vim.lsp.protocol.make_client_capabilities())
} ]]
