local null_ls = require 'null-ls'

local sources = {
  -- null_ls.builtins.formatting.prettier.with {
  --   disabled_filetypes = { 'typescript' },
  -- },
  null_ls.builtins.formatting.stylua,
  -- null_ls.builtins.formatting.eslint_d,
  -- null_ls.builtins.code_actions.eslint_d,
  -- null_ls.builtins.diagnostics.eslint_d,
  -- null_ls.builtins.diagnostics.yamllint,
  null_ls.builtins.diagnostics.stylelint,
  -- null_ls.builtins.diagnostics.selene,
  null_ls.builtins.diagnostics.pylint,
  null_ls.builtins.formatting.fnlfmt
}

null_ls.setup { sources = sources }
