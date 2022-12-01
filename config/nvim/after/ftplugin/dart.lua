local buf = vim.api.nvim_get_current_buf()

keymap({
  name = "Flutter",
  r = { "Reload", "Reload" },
  R = { "Restart", "Restart" },
  q = { "Quit", "Quit" },
}, {
  prefix = "<localleader>",
  buffer = buf,
  silent = false,
  mapping_prefix = "Flutter",
  cmd = true,
})
