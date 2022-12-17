require("go").setup {
  lsp_inlay_hints = {
    enable = false,
  },
  lsp_cfg = {
    capabilities = R.lsp.capabilities,
    settings = {
      gopls = {
        buildFlags = { "-tags=tools" },
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
  lsp_on_attach = function(client, bufnr)
    R.lsp.on_attach(client, bufnr)
    return require("go.lsp").gopls_on_attach(client, bufnr)
  end,
  lsp_keymaps = false,
}
