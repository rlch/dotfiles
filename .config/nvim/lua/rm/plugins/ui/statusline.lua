require('plenary.reload').reload_module('lualine', true)
require('lualine').setup {
  options = {
    theme = 'everforest',
    icons_enabled = true,
    component_separators = { '।', '।' },
    section_separators = { '', '' },
    disabled_filetypes = {},
  },
  sections = {
    lualine_a = { 'mode' },
    lualine_b = { 'branch', require('github-notifications').statusline_notification_count },
    lualine_c = {
      {
        'filename',
        file_status = true,
        path = 1,
      },
    },
    lualine_x = { 'filetype' },
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
  extensions = {},
}
