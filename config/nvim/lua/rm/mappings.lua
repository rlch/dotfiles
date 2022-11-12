local g = vim.g

-- Leader bindings
map("n", " ", "<nop>")
g.mapleader = " "
g.maplocalleader = ","

-- ; > :
remap("n", ";", ":")
remap("v", ";", ":")

-- Better movements
remap("n", "H", "^")
remap("v", "H", "^")
remap("n", "L", "$")
remap("v", "L", "$")
remap("n", "Q", "@q")
remap("n", "Y", "y$")

-- Make S/Tab less quirky
map("i", "<Tab>", "<C-i>")
map("i", "<S-Tab>", "<C-d>")
map("n", "<S-Tab>", "<<")
map("v", "<Tab>", ">gv")
map("v", "<S-Tab>", "<gv")
map("v", ">", ">gv")
map("v", "<", "<gv")

-- VSC style shifting
-- mapx("n", "<C-j>", "MoveLine(1)", { silent = true })
-- mapx("n", "<C-k>", "MoveLine(-1)", { silent = true })
remap("v", "J", ":m '>+1<cr>gv=gv")
remap("v", "K", ":m '<-2<cr>gv=gv")

-- Remove highlights
mapx("n", "<leader><leader>", "noh")

-- LSP
map("n", "gd", vim.lsp.buf.definition)
map("n", "gD", vim.lsp.buf.declaration)
map("n", "gi", vim.lsp.buf.implementation)
map("n", "gr", vim.lsp.buf.rename)
map("n", "<leader>lf", vim.lsp.buf.format)
map("n", "<leader>a", vim.lsp.buf.code_action)
mapx("n", "<leader>lr", "LspRestart")
remap("n", "K", vim.lsp.buf.hover)
map("n", "<leader>dh", function()
  vim.diagnostic.open_float(nil, { focusable = false, width = 50 })
end, { silent = true })

-- Jump to next/prev error; prioritizing ERROR severity.
map("n", "<leader>dk", function()
  local errors = vim.diagnostic.get(0, { severity = "ERROR" })
  if #errors == 0 then
    vim.diagnostic.goto_prev()
  else
    vim.diagnostic.goto_prev {
      severity = "ERROR",
    }
  end
end, { silent = true })
map("n", "<leader>dj", function()
  local errors = vim.diagnostic.get(0, { severity = "ERROR" })
  if #errors == 0 then
    vim.diagnostic.goto_next()
  else
    vim.diagnostic.goto_next {
      severity = "ERROR",
    }
  end
end, { silent = true })

-- Open URLs
map("n", "gx", 'viW"ay:!open <C-R>a &<cr>')

-- Packer
mapx("n", "<leader>ss", "PackerSync")
