vim.o.winwidth = 10
vim.o.winminwidth = 10
vim.o.equalalways = false
map("n", "<C-w>o", "<Cmd>WindowsMaximize<CR>", {})
map("n", "<C-w><C-o>", "<Cmd>WindowsMaximize<CR>", {})
map("n", "<C-w>O", "<C-w>o", {})
require("windows").setup {
  autowidth = {
    enable = false,
  },
}
