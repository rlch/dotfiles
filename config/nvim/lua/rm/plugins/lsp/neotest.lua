-- TODO: setup neotest
local map_t = function(key, test)
  map('n', '<leader>t' .. key, function()
    test(require 'neotest')
  end)
end

map_t('f', function(t)
  t.run.run(vim.fn.expand '%')
end)
map_t('d', function(t)
  t.run.run { strategy = 'dap' }
end)
map_t('n', function(t)
  t.run.run()
end)
map_t('h', function(t)
  t.output.open { enter = true }
end)
map_t('s', function(t)
  t.summary.open { enter = true }
end)
map_t('q', function(r)
  r.run.stop()
end)

require('neotest').setup {
  adapters = {
    require 'neotest-vim-test' {
      ignore_file_types = { 'python', 'vim', 'lua', 'go' },
    },
    require 'neotest-go',
  },
}
