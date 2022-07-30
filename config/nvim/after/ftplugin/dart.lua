local wk = require 'which-key'
local buf = vim.api.nvim_get_current_buf()

local _ = function(opts)
  local title = opts
  local command = opts
  if type(opts) == 'table' then
    command = opts[1]
    title = opts[2]
  end

  return { '<cmd>Flutter' .. command .. '<cr>', title }
end

wk.register({
  name = 'Flutter',
  r = _ { 'Reload', 'Reload' },
  R = _ { 'Restart', 'Restart' },
  q = _ { 'Quit', 'Quit' },
}, { prefix = '<localleader>', buffer = buf, silent = false })
