local Rule = require 'nvim-autopairs.rule'
local npairs = require 'nvim-autopairs'

npairs.setup {
  check_ts = true,
  ts_config = {
    lua = { 'string' },
    javascript = { 'template_string' },
  },
}
-- press % => %% only while inside a comment or string
local ts_conds = require('nvim-autopairs.ts-conds')
npairs.add_rules {
  Rule('%', '%', 'lua'):with_pair(ts_conds.is_ts_node { 'string', 'comment' }),
  Rule('$', '$', 'lua'):with_pair(ts_conds.is_not_ts_node { 'function' }),
}
