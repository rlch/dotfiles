local g = vim.g
local cmd = vim.cmd
local o_s = vim.o

g.os = vim.loop.os_uname().sysname
g.open_command = g.os == 'Darwin' and 'open' or 'xdg-open'

--------------
-- Settings --
--------------

g.mapleader = [[ ]]
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

cmd [[ 
  set shell=/bin/bash
  set iskeyword+=-
  set formatoptions+=t
  set formatoptions-=o
  set t_Co=256
  set nu rnu
  set nowritebackup
  set noea
  set title titlestring=
  filetype plugin on
]]

cmd [[command! PackerInstall packadd packer.nvim | lua require('plugins').install()]]
cmd [[command! PackerUpdate packadd packer.nvim | lua require('plugins').update()]]
cmd [[command! PackerSync packadd packer.nvim | lua require('plugins').sync()]]
cmd [[command! PackerClean packadd packer.nvim | lua require('plugins').clean()]]
cmd [[command! PackerCompile packadd packer.nvim | lua require('plugins').compile()]]

cmd [[
augroup packer_user_config
autocmd!
autocmd BufWritePost plugins.lua so % | PackerCompile
augroup end

au BufWritePre * lua vim.lsp.buf.formatting()
autocmd BufNewFile,BufRead,FileType * setlocal formatoptions-=o
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
