require('lsp-fastaction').setup {
  hide_cursor = true,
  action_data = {
    ['dart'] = {
      { pattern = 'import library', key = 'i', order = 1 },
      { pattern = 'wrap with widget', key = 'w', order = 2 },
      { pattern = 'wrap with column', key = 'c', order = 3 },
      { pattern = 'wrap with row', key = 'r', order = 3 },
      { pattern = 'wrap with sizedbox', key = 's', order = 3 },
      { pattern = 'wrap with container', key = 'C', order = 4 },
      { pattern = 'wrap with center', key = 'E', order = 4 },
      { pattern = 'padding', key = 'p', order = 4 },
      { pattern = 'wrap with builder', key = 'b', order = 5 },
      { pattern = 'wrap with streambuilder', key = 'S', order = 5 },
      { pattern = 'remove', key = 'd', order = 5 },

      -- range
      { pattern = "surround with %'if'", key = 'i', order = 2 },
      { pattern = 'try%-catch', key = 't', order = 2 },
      { pattern = 'for%-in', key = 'f', order = 2 },
      { pattern = 'setstate', key = 's', order = 2 },
    },
    ['typescript'] = {
      { pattern = 'to existing import declaration', key = 'a', order = 2 },
      { pattern = 'from module', key = 'i', order = 1 },
    },
  },
}

map('n', '<leader>a', function()
  require('lsp-fastaction').code_action()
end)
map('v', '<leader>a', function()
  require('lsp-fastaction').range_code_action()
end)
