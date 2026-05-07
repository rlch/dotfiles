return {
  dir = "/Users/rjm/dev/nvim/patchwork.nvim",
  name = "patchwork",
  event = "VeryLazy",
  cmd = { "PatchworkStart", "PatchworkStop", "PatchworkStatus", "PatchworkSend" },
  opts = {
    log_level = "warn",
    diff_opts = {
      layout = "inline",
    },
  },
}
