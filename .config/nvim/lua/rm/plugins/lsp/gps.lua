local icons = R.icons

local space = ''
if vim.fn.has 'mac' == 1 then
  space = ' '
end

local hl = function(group, icon)
  return '%#' .. group .. '#' .. icon .. '%*' .. space
end

require('nvim-gps').setup {
  icons = {
    ['class-name'] = hl('CmpItemKindClass', icons.lsp.Class),
    ['function-name'] = hl('CmpItemKindFunction', icons.lsp.Function),
    ['method-name'] = hl('CmpItemKindMethod', icons.lsp.Method),
    ['container-name'] = hl('CmpItemKindProperty', icons.lsp.Module),
    ['tag-name'] = hl('CmpItemKindKeyword', icons.lsp.Snippet),
    ['mapping-name'] = hl('CmpItemKindProperty', ''),
    ['sequence-name'] = hl('CmpItemKindProperty', ''),
    ['null-name'] = hl('CmpItemKindField', ''),
    ['boolean-name'] = hl('CmpItemKindValue', 'ﰰﰴ'),
    ['integer-name'] = hl('CmpItemKindValue', '#'),
    ['number-name'] = hl('CmpItemKindValue', icons.lsp.Constant),
    ['float-name'] = hl('CmpItemKindValue', icons.lsp.Constant),
    ['string-name'] = hl('CmpItemKindValue', icons.lsp.Constant),
    ['array-name'] = hl('CmpItemKindProperty', ''),
    ['object-name'] = hl('CmpItemKindProperty', icons.lsp.Class),
    ['table-name'] = hl('CmpItemKindProperty', icons.ui.Table),
    ['date-name'] = hl('CmpItemKindValue', icons.ui.Calendar),
    ['date-time-name'] = hl('CmpItemKindValue', icons.ui.Table),
    ['inline-table-name'] = hl('CmpItemKindProperty', icons.ui.Calendar),
    ['time-name'] = hl('CmpItemKindValue', ''),
    ['module-name'] = hl('CmpItemKindModule', icons.lsp.Module),
  },
  languages = {},
  depth = 0,
  separator = ' ' .. icons.ui.ChevronRight .. ' ',
  depth_limit_indicator = '..',
  text_hl = 'LineNr',
}
