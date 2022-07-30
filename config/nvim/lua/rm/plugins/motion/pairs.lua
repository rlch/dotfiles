local Rule = require 'nvim-autopairs.rule'
local npairs = require 'nvim-autopairs'

npairs.setup {
  check_ts = true,
  ts_config = {
    lua = { 'string' },
    javascript = { 'template_string' },
  },
}
local ts_conds = require 'nvim-autopairs.ts-conds'

-- press % => %% only while inside a comment or string
npairs.add_rules {
  Rule('%', '%', 'lua'):with_pair(ts_conds.is_ts_node { 'string', 'comment' }),
  Rule('$', '$', 'lua'):with_pair(ts_conds.is_not_ts_node { 'function' }),
}

local has_cmp, cmp = pcall(require, 'cmp')
if has_cmp then
  local cmp_autopairs = require 'nvim-autopairs.completion.cmp'
  cmp.event:on('confirm_done', cmp_autopairs.on_confirm_done { map_char = { tex = '' } })
end
