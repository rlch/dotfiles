---@type vim.lsp.Config
return {
  cmd = { "~/fvm/default/bin/dart", "language-server", "--protocol=lsp" },
  filetypes = { "dart" },
  root_dir = function(bufnr, on_dir)
    local fname = vim.api.nvim_buf_get_name(bufnr)
    local dir = require("lspconfig.util").root_pattern("pubspec.yaml")(fname)
    on_dir(dir)
  end,
  init_options = {
    onlyAnalyzeProjectsWithOpenFiles = true,
    suggestFromUnimportedLibraries = true,
    closingLabels = true,
    outline = true,
    flutterOutline = true,
    allowOpenUri = true,
  },
  settings = {
    dart = {
      completeFunctionCalls = false,
      showTodos = true,
      renameFilesWithClasses = "always",
      enableSnippets = false,
      updateImportsOnRename = true,
      inlayHints = true,
    },
  },
}
