local g = vim.g

g.gruvbox_material_background = 'hard'
g.gruvbox_material_palette = 'original'

g.everforest_background = 'hard'
g.sonokai_style = 'atlantis'

vim.cmd 'colorscheme everforest'
vim.cmd [[
highlight ErrorBetterComments guifg=#e67e80
highlight HighlightBetterComments guifg=#83c092
highlight QuestionBetterComments guifg=#d699b6
highlight StrikeoutBetterComments guifg=#7a8478
highlight TodoBetterComments guifg=#e69875
]]

local signs = {
  Error = ' ',
  Warning = ' ',
  Warn = ' ',
  Hint = ' ',
  Information = ' ',
  Info = ' ',
}

for type, icon in pairs(signs) do
  local hl = 'DiagnosticSign' .. type
  vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = hl })
end
