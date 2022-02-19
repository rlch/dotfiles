local ls = require 'luasnip'
local types = require 'luasnip.util.types'

require('luasnip/loaders/from_vscode').lazy_load()

ls.config.set_config {
  history = true,
  updateevents = 'TextChanged,TextChangedI',
  enable_autosnippets = true,
  ext_opts = {
    [types.choiceNode] = {
      active = {
        virt_text = { { '<-', 'Error' } },
      },
    },
  },
}
