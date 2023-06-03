require("go").setup {
  lsp_inlay_hints = { enable = false },
  lsp_gofumpt = true,
  lsp_keymaps = false,
  lsp_codelens = false,
  max_line_len = 120,
  lsp_cfg = {
    capabilities = R.lsp.capabilities,
    settings = {
      gopls = {
        buildFlags = { "-tags=tools" },
        analyses = {
          ST1001 = false,
        },
        hints = {
          assignVariableTypes = true,
          compositeLiteralFields = true,
          compositeLiteralTypes = true,
          constantValues = true,
          functionTypeParameters = true,
          parameterNames = true,
          rangeVariableTypes = true,
        },
      },
    },
  },
  luasnip = true,
  lsp_on_attach = function(client, bufnr)
    R.lsp.on_attach(client, bufnr)
    return require("go.lsp").gopls_on_attach(client, bufnr)
  end,
}
