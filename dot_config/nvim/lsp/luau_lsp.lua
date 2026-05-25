---@type vim.lsp.Config
return {
  cmd = { vim.fn.expand("~/.local/bin/luau-lsp"), "lsp" },
  filetypes = { "luau" },
  root_dir = function(bufnr, on_dir)
    local fname = vim.api.nvim_buf_get_name(bufnr)
    -- Project root = nearest dir holding `.luaurc` (the Luau standard,
    -- per https://rfcs.luau.org/config-luaurc.html). grift's lives at
    -- the repo root; other Luau projects would too.
    local dir = require("lspconfig.util").root_pattern(".luaurc", ".luau-lsp.json")(fname)
    on_dir(dir)
  end,
  -- LSP-server settings sent via workspace/configuration. `platform.type`
  -- defaults to "roblox" which loads the Roblox global namespace and
  -- silently shadows custom `engine.*` definitions — must be "standard"
  -- for grift. `definitionFiles` is workspace-relative once `root_dir`
  -- resolves above. New solver is the better type-checker as of 1.68+;
  -- old solver missed several structural checks (see grift's audit).
  settings = {
    ["luau-lsp"] = {
      platform = { type = "standard" },
      types = { definitionFiles = { "assets/luau-defs/grift.d.luau" } },
      fflags = { enableNewSolver = true },
    },
  },
}
