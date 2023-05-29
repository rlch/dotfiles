local null_ls = require "null-ls"
local format = null_ls.builtins.formatting
local diag = null_ls.builtins.diagnostics

null_ls.setup {
  sources = {
    format.stylua,
    format.fnlfmt,
    format.black,
    format.prettierd.with {
      extra_filetypes = { "graphqls", "graphql" },
      runtime_condition = function(params)
        return not params.bufname:match ".*templates/[^/]*%.yaml"
      end,
    },
    format.clang_format.with {
      extra_filetypes = { "proto" },
    },
    format.sqlfluff.with {
      extra_args = { "--dialect", "postgres" },
    },
    diag.sqlfluff.with {
      extra_args = { "--dialect", "postgres" },
    },
    diag.stylelint,
    diag.pylint,
    diag.protolint,
    format.terraform_fmt,
    diag.golangci_lint,
    -- diag.mdl,
  },
  on_attach = function(client, bufnr)
    vim.api.nvim_buf_set_option(bufnr, "formatexpr", "")
    local filetype = vim.api.nvim_buf_get_option(bufnr, "filetype")
    if filetype == "markdown" then
      client.server_capabilities.documentFormattingProvider = false
      client.server_capabilities.documentRangeFormattingProvider = false
    end
  end,
}
