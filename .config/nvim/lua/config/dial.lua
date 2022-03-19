local augend = require 'dial.augend'

local default = {
  augend.integer.alias.decimal,
  augend.integer.alias.hex,
  augend.date.alias['%Y/%m/%d'],
  augend.constant.alias.bool,
  augend.constant.new {
    elements = { 'and', 'or' },
    word = true, -- if false, "sand" is incremented into "sor", "doctor" into "doctand", etc.
    cyclic = true, -- "or" is incremented into "and".
  },
  augend.constant.new {
    elements = { '&&', '||' },
    word = false,
    cyclic = true,
  },
}

require('dial.config').augends:register_group {
  default = default,
  typescript = {
    augend.integer.alias.decimal,
    augend.integer.alias.hex,
    augend.constant.new { elements = { 'let', 'const' } },
  },
  dart = vim.tbl_extend('force', default, {}),
  yaml = {
    augend.integer.alias.decimal,
    augend.semver.alias.semver,
    augend.constant.alias.bool,
  },
  visual = {
    augend.integer.alias.decimal,
    augend.integer.alias.hex,
    augend.date.alias['%Y/%m/%d'],
    augend.constant.alias.alpha,
    augend.constant.alias.Alpha,
  },
}

vim.api.nvim_set_keymap('n', '<C-a>', require('dial.map').inc_normal(), { noremap = true })
vim.api.nvim_set_keymap('n', '<C-x>', require('dial.map').dec_normal(), { noremap = true })
vim.api.nvim_set_keymap('v', '<C-a>', require('dial.map').inc_visual(), { noremap = true })
vim.api.nvim_set_keymap('v', '<C-x>', require('dial.map').dec_visual(), { noremap = true })
vim.api.nvim_set_keymap('v', 'g<C-a>', require('dial.map').inc_gvisual(), { noremap = true })
vim.api.nvim_set_keymap('v', 'g<C-x>', require('dial.map').dec_gvisual(), { noremap = true })
