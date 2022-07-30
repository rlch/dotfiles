local opt = vim.opt

opt.termguicolors = true
opt.timeoutlen = 300
opt.hidden = true
opt.encoding = 'utf-8'
opt.fileencoding = 'utf-8'
opt.pumheight = 10
opt.ruler = true
opt.cmdheight = 1
opt.mouse = 'a'
opt.splitbelow = true
opt.splitright = true
opt.conceallevel = 0
opt.tabstop = 2
opt.shiftwidth = 2
opt.expandtab = true
opt.smarttab = true
opt.smartindent = true
opt.autoindent = true
opt.laststatus = 3
opt.background = 'dark'
opt.updatetime = 300
opt.clipboard = 'unnamedplus'
opt.mmp = 2000
opt.autoread = true
opt.wrap = false
opt.shell = '/bin/bash'
opt.wb = false
opt.ea = false
opt.number = true
opt.relativenumber = true
opt.cursorline = true
opt.completeopt = 'menu,menuone,preview,noselect,longest'

opt.foldlevelstart = 99
vim.wo.foldcolumn = '0'
vim.wo.foldenable = true
vim.wo.foldmethod = 'manual'

-- disable netrw
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- lua filetypes
vim.g.did_load_filetypes = 0
vim.g.do_filetype_lua = 1

vim.cmd [[
set formatoptions+=tr
set formatoptions-=o
set title titlestring=
filetype plugin on
]]
