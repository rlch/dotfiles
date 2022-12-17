vim.o.winwidth = 10
vim.o.winminwidth = 10
vim.o.equalalways = false
require("windows").setup {
  autowidth = {
    enable = false,
  },
}
keymap({
  name = "Windows",
  ["<C-o>"] = { "WindowsMaximize", "Maximize" },
}, { prefix = "<C-w>", cmd = true })
