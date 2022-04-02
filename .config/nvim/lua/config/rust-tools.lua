-- local lsp_status = require 'lsp-status'
local illuminate_ok, illuminate = pcall(require, 'illuminate')

local default_on_attach = function(client, _)
  if illuminate_ok then
    illuminate.on_attach(client)
  end
  -- lsp_status.on_attach(client)
end

local capabilities = require('cmp_nvim_lsp').update_capabilities(vim.lsp.protocol.make_client_capabilities())
-- capabilities = vim.tbl_extend('keep', capabilities, lsp_status.capabilities)

require('rust-tools').setup {
  server = {
    on_attach = default_on_attach,
    capabilities = capabilities,
    standalone = true,
    settings = {
      ['rust-analyzer'] = {
        procMacro = {
          enable = true,
        },
        checkOnSave = {
          enable = true,
          command = 'clippy',
        },
        diagnostics = {
          enable = true,
          disabled = { 'unresolved-proc-macro', 'missing-unsafe' },
          enableExperimental = true,
          warningsAsHint = {},
        },
      },
    },
  },
}
