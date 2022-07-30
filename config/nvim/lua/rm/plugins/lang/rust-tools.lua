require('rust-tools').setup {
  server = {
    on_attach = R.lsp.on_attach,
    capabilities = R.lsp.capabilities,
    standalone = true,
    settings = {
      ['rust-analyzer'] = {
        procMacro = { enable = true },
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
