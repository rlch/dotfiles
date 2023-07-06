require("rust-tools").setup {
  server = {
    cmd = { "/usr/local/bin/rust-analyzer" },
    on_attach = R.lsp.on_attach,
    capabilities = R.lsp.capabilities,
    -- standalone = true,
    settings = {
      ["rust-analyzer"] = {
        procMacro = { enable = true },
        checkOnSave = {
          enable = true,
          command = "clippy",
        },
        diagnostics = {
          enable = true,
          disabled = {
            "unresolved-proc-macro",
            "unresolved-macro-call",
            "missing-unsafe",
            "inactive-code",
          },
          enableExperimental = true,
          warningsAsHint = {},
        },
      },
    },
  },
}
