---@type vim.lsp.Config
return {
  -- root_dir = function(fname)
  --   local node = vim.fs.root(fname, { "package.json", "node_modules" })
  --   if node then
  --     local deno = vim.fs.root(fname, { "deno.json" })
  --     if not deno or #deno > #node then
  --       return node
  --     end
  --   end
  --   return "."
  -- end,
}
