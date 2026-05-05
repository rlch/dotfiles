return {
  "Cannon07/code-preview.nvim",
  event = "VeryLazy",
  cmd = {
    "CodePreviewInstallClaudeCodeHooks",
    "CodePreviewUninstallClaudeCodeHooks",
    "CodePreviewCloseDiff",
    "CodePreviewStatus",
    "CodePreviewToggleVisibleOnly",
  },
  opts = {
    debug = true,
    diff = {
      layout = "vsplit",
    },
    neo_tree = {
      enabled = false,
    },
  },
}
