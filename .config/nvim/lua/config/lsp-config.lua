local conf = require 'lspconfig'

vim.cmd [[
nnoremap <silent> <leader>dh <cmd>lua vim.diagnostic.open_float(nil, { focusable = false, width = 50 })<CR>
nnoremap <silent> <leader>dk <cmd>lua vim.diagnostic.goto_prev()<CR>
nnoremap <silent> <leader>dj <cmd>lua vim.diagnostic.goto_next()<CR>
]]

-- local lsp_status = require 'lsp-status'
local illuminate_ok, illuminate = pcall(require, 'illuminate')
-- lsp_status.register_progress()

-- lsp_status.config {
--   kind_labels = {
--     Text = '',
--     Method = '',
--     Function = '',
--     Constructor = '',
--     Field = 'ﰠ',
--     Variable = '',
--     Class = '',
--     Interface = '',
--     Module = '',
--     Property = 'ﰠ',
--     Unit = '塞',
--     Value = '',
--     Enum = '',
--     Keyword = '',
--     Snippet = '',
--     Color = '',
--     File = '',
--     Reference = '',
--     Folder = '',
--     EnumMember = '',
--     Constant = '',
--     Struct = 'פּ',
--     Event = '',
--     Operator = '',
--     TypeParameter = '',
--   },
--   indicator_errors = '',
--   indicator_warnings = '',
--   indicator_info = '',
--   indicator_hint = '',
--   status_symbol = '',
-- }

local default_on_attach = function(client, _)
  -- lsp_status.on_attach(client)
  if illuminate_ok then
    illuminate.on_attach(client)
  end
end

local capabilities = require('cmp_nvim_lsp').update_capabilities(vim.lsp.protocol.make_client_capabilities())
-- capabilities = vim.tbl_extend('keep', capabilities, lsp_status.capabilities)

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

conf.yamlls.setup {
  settings = {
    yaml = {
      format = {
        enable = true,
        singleQuote = true,
      },
    },
  },
  on_attach = default_on_attach,
  capabilities = capabilities,
}

conf.pyright.setup {
  on_attach = default_on_attach,
  capabilities = capabilities,
}

conf.tsserver.setup {
  capabilities = capabilities,
  on_attach = function(client, _)
    require('nvim-lsp-ts-utils').setup {
      filter_out_diagnostics_by_code = { 80001, 7016 },
    }
    require('nvim-lsp-ts-utils').setup_client(client)
    default_on_attach(client)
  end,
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
  on_attach = default_on_attach,
  capabilities = capabilities,
}

local pid = vim.fn.getpid()
conf.omnisharp.setup {
  cmd = { omnisharp_bin, '--languageserver', '--hostPID', tostring(pid) },
  root_dir = conf.util.root_pattern('*.csproj', '*.sln'),
  on_attach = default_on_attach,
  capabilities = capabilities,
}

conf.clojure_lsp.setup {}
conf.gopls.setup {}
conf.taplo.setup {}
