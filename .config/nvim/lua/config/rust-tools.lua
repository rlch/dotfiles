local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities = require('cmp_nvim_lsp').update_capabilities(capabilities)

require('rust-tools').setup {
  server = {
    capabilities = capabilities,
    on_attach = function(_, _)
      --[[ require "lsp_signature".setup({
        bind = true,
        handler_opts = {
          border = "single"
        },
        hint_enable = false,
        doc_lines = 3,
        max_width = 100,
        -- use_lspsaga = true,
      }, bufnr) ]]
    end,
    settings = {
      ['rust-analyzer'] = {
        checkOnSave = {
          enable = true,
          command = 'clippy',
        },
      },
    },
  },
}
