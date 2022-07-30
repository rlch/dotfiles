require('go').setup {
  --   lsp_cfg = {settings={gopls={matcher='CaseInsensitive', ['local'] = 'your_local_module_path', gofumpt = true }}}
  lsp_cfg = {
    capabilities = R.lsp.capabilities,
    settings = {
      gopls = {
        buildFlags = { '-tags=tools' },
      },
    },
  },
  lsp_on_attach = function(client, bufnr)
    R.lsp.on_attach(client, bufnr)
    return require('go.lsp').gopls_on_attach(client, bufnr)
  end,
  lsp_keymaps = false,
}
