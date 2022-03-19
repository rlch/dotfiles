-- local tokyonight = require'lualine.themes.tokyonight'
-- local config = require("tokyonight.config")
-- local colors = require("tokyonight.colors").setup(config)

--[[ tokyonight.normal.c.bg = colors.bg
tokyonight.inactive = {
  a = { bg = colors.bg, fg = colors.blue },
  b = { bg = colors.bg, fg = colors.fg_gutter, gui = "bold" },
  c = { bg = colors.bg, fg = colors.fg_gutter },
} ]]

require('plenary.reload').reload_module('lualine', true)
require('lualine').setup {
  options = {
    theme = 'everforest',
    icons_enabled = true,
    --[[ component_separators = {'', ''},
    section_separators = {'', ''}, ]]
    component_separators = { '।', '।' },
    section_separators = { '', '' },
    disabled_filetypes = {},
  },
  sections = {
    lualine_a = { 'mode' },
    lualine_b = { 'branch', require('github-notifications').statusline_notification_count },
    --[[ lualine_c = {
      {
        'filename',
        path = 1,
      },
      {
        'diagnostics',
        sources = {
          'nvim_lsp',
        },
        sections = {
          'error',
          'warn',
          'info',
        },
        always_visible = false,
        colored = false,
      },
    }, ]]
    lualine_x = {
      function()
        return require('lsp-status').status()
      end,
      'filetype',
    },
    lualine_y = { 'progress' },
    lualine_z = { 'location' },
  },
  inactive_sections = {
    lualine_a = {},
    lualine_b = {},
    lualine_c = {},
    lualine_x = { 'location' },
    lualine_y = {},
    lualine_z = {},
  },
  -- tabline = {
  --   lualine_b = {'filename'},
  --,   lualine_c = {'filetype'},
  -- },
  extensions = {},
}
