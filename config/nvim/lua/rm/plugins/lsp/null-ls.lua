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
      condition = function(utils)
        return not utils.root_matches ".*templates/[^/]*%.yaml"
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
    -- diag.golangci_lint,
  },
}
