local wk = require 'which-key'
local buf = vim.api.nvim_get_current_buf()

local _ = function(opts)
  local title = opts
  local command = opts
  if type(opts) == 'table' then
    command = opts[1]
    title = opts[2]
  end

  return { '<cmd>Go' .. command .. '<cr>', title }
end

local ginkgo = function(pane_identifier)
  return function()
    local buf_dir = vim.fn.expand '%:p:h'
    -- TODO(harpoon): Support pane creation from `gotoTerminal(pane_identifier)`
    require('harpoon.tmux').sendCommand(pane_identifier, 'clear;cd ' .. buf_dir .. ';ginkgo -p\r')
  end
end

wk.register({
  name = 'Go',
  a = {
    name = 'Auto fill',
    c = _ { 'FillStruct', 'struct' },
    s = _ { 'FillSwitch', 'switch' },
    i = _ { 'IfErr', 'if err' },
    p = _ { 'FixPlurals', 'plurals' },
  },
  b = _ { 'Build', 'Build' },
  c = _ 'Cmt',
  f = _ { 'Fmt', 'Format' },
  g = _ { 'Generate', 'Generate' },
  l = _ { 'Lint', 'Lint' },
  m = _ { 'Make', 'make' },
  r = _ { 'Run', 'Run' },
  q = _ { 'Stop', 'Stop' },
  o = {
    name = 'Open associated test',
    w = _ { 'Alt!', 'Replace window' },
    s = _ { 'AltS!', 'Horizontal split' },
    v = _ { 'AltV!', 'Vertical split' },
  },
  t = {
    name = 'Run ginkgo in',
    v = { ginkgo '{right}', 'vertical tmux pane' },
    s = { ginkgo '{bottom}', 'horizontal tmux pane' },
  },
}, { prefix = '<localleader>', buffer = buf, silent = false })
