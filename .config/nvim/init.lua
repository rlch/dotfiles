local g = vim.g
local o_s = vim.o

g.os = vim.loop.os_uname().sysname
g.open_command = g.os == 'Darwin' and 'open' or 'xdg-open'

--------------
-- Settings --
--------------

g.mapleader = [[ ]]
g.localmapleader = [[\\]]
g.termguicolors = true
vim.opt.termguicolors = true

local function opt(o, v, scopes)
  scopes = scopes or { o_s }
  for _, s in ipairs(scopes) do
    s[o] = v
  end
end

opt('hidden', true)
opt('encoding', 'utf-8')
opt('pumheight', 10)
opt('fileencoding', 'utf-8')
opt('ruler', true)
opt('cmdheight', 1)
opt('mouse', 'a')
opt('splitbelow', true)
opt('splitright', true)
opt('conceallevel', 0)
opt('tabstop', 2)
opt('shiftwidth', 2)
opt('smarttab', true)
opt('expandtab', true)
opt('smartindent', true)
opt('autoindent', true)
opt('laststatus', 2)
opt('background', 'dark')
opt('updatetime', 300)
opt('clipboard', 'unnamedplus')
opt('mmp', 2000)
opt('foldmethod', 'syntax')
opt('foldlevelstart', 20)
opt('autoread', true)
opt('wrap', false)
opt('termguicolors', true)

vim.cmd [[ 
set updatetime=300
set shell=/bin/bash
set iskeyword+=-
set formatoptions+=tr
set formatoptions-=o
set t_Co=256
set nu rnu
set nowritebackup
set noea
set title titlestring=
filetype plugin on
tnoremap <Esc> <C-\\><C-n>
]]

vim.cmd [[
command! PackerInstall packadd packer.nvim | lua require('plugins').install()
command! PackerUpdate packadd packer.nvim | lua require('plugins').update()
command! PackerSync packadd packer.nvim | lua require('plugins').sync()
command! PackerClean packadd packer.nvim | lua require('plugins').clean()
command! PackerCompile packadd packer.nvim | lua require('plugins').compile()
]]

vim.api.nvim_exec([[  ]], false)
vim.cmd [[
autocmd BufWritePre *.go :silent! lua require('go.format').goimport()
]]

-- au BufWritePre * lua vim.lsp.buf.formatting()

vim.cmd [[
augroup packer_user_config
autocmd!
autocmd BufWritePost plugins.lua so % | PackerCompile
augroup end

autocmd BufNewFile,BufRead,FileType * setlocal formatoptions-=o

autocmd FileType __FLUTTER_DEV_LOG__ ColorHighlight
]]

local ok, reload = pcall(require, 'plenary.reload')
local RELOAD = ok and reload.reload_module or function(...)
  return ...
end
function R(name)
  RELOAD(name)
  return require(name)
end

R 'plugins'
