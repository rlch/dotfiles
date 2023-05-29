---@diagnostic disable: undefined-field
local notification_line = {}
local ok, ghn = pcall(require, "github-notifications")
if ok then
  notification_line = {
    "branch",
    ghn.statusline_notification_count,
  }
end
local noice = require "noice"
local everforest_theme = require "lualine.themes.everforest"


everforest_theme.normal.c.bg = "NONE"
everforest_theme.insert.c.bg = "NONE"
everforest_theme.visual.c.bg = "NONE"
everforest_theme.replace.c.bg = "NONE"
everforest_theme.command.c.bg = "NONE"
everforest_theme.inactive.c.bg = "NONE"

require("plenary.reload").reload_module("lualine", true)
require("lualine").setup {
  options = {
    theme = everforest_theme,
    icons_enabled = true,
    component_separators = { "।", "।" },
    section_separators = { "", "" },
    disabled_filetypes = {},
  },
  sections = {
    lualine_a = { "mode" },
    lualine_b = notification_line,
    lualine_c = {
      {
        "filename",
        file_status = true,
        path = 1,
      },
      {
        noice.api.status.mode.get,
        cond = function()
          return noice.api.status.mode.has()
            and string.find(noice.api.status.mode.get(), "recording .*")
              ~= nil
        end,
        color = { fg = "#ff9e64" },
      },
    },
    lualine_x = { "filetype" },
    lualine_y = { "progress" },
    lualine_z = { "location" },
  },
  inactive_sections = {
    lualine_a = {},
    lualine_b = {},
    lualine_c = {},
    lualine_x = { "location" },
    lualine_y = {},
    lualine_z = {},
  },
  extensions = {},
}
