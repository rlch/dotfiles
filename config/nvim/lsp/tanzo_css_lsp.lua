---@type vim.lsp.Config
return {
  cmd = { "tanzo-css-lsp" },
  filetypes = { "css" },
  root_dir = function(bufnr, on_dir)
    local fname = vim.api.nvim_buf_get_name(bufnr)
    -- Tanzo.toml marks the workspace root the LSP indexes against.
    -- Cargo.toml fallback so editing CSS in a sub-crate still hands
    -- the server a real root rather than parse-only mode.
    local dir = vim.fs.root(fname, { "Tanzo.toml", "Cargo.toml" })
    on_dir(dir)
  end,
}
