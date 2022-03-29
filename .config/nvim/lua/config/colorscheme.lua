local g = vim.g

g.gruvbox_material_background = 'hard'
g.gruvbox_material_palette = 'original'

g.everforest_background = 'hard'
g.sonokai_style = 'atlantis'
vim.g.nord_contrast = true
vim.g.nord_borders = true

vim.cmd 'colorscheme everforest'

local signs = {
  Error = '',
  Warning = '',
  Warn = '',
  Hint = '',
  Information = '',
  Info = '',
}

for type, icon in pairs(signs) do
  local hl = 'DiagnosticSign' .. type
  vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = hl })
end
