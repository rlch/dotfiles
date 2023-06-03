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

local colors = {
  bg0 = "#323d43",
  bg1 = "#3c474d",
  bg3 = "#505a60",
  fg = "#d8caac",
  aqua = "#87c095",
  green = "#a7c080",
  orange = "#e39b7b",
  purple = "#d39bb6",
  red = "#e68183",
  grey1 = "#868d80",
  none = "NONE",
}

local theme = {
  normal = {
    a = { bg = colors.green, fg = colors.bg0, gui = "bold" },
    b = { bg = colors.bg3, fg = colors.fg },
    c = { bg = colors.none, fg = colors.fg },
  },
  insert = {
    a = { bg = colors.fg, fg = colors.bg0, gui = "bold" },
    b = { bg = colors.bg3, fg = colors.fg },
    c = { bg = colors.none, fg = colors.fg },
  },
  visual = {
    a = { bg = colors.red, fg = colors.bg0, gui = "bold" },
    b = { bg = colors.bg3, fg = colors.fg },
    c = { bg = colors.none, fg = colors.fg },
  },
  replace = {
    a = { bg = colors.orange, fg = colors.bg0, gui = "bold" },
    b = { bg = colors.bg3, fg = colors.fg },
    c = { bg = colors.none, fg = colors.fg },
  },
  command = {
    a = { bg = colors.aqua, fg = colors.bg0, gui = "bold" },
    b = { bg = colors.bg3, fg = colors.fg },
    c = { bg = colors.none, fg = colors.fg },
  },
  terminal = {
    a = { bg = colors.purple, fg = colors.bg0, gui = "bold" },
    b = { bg = colors.bg3, fg = colors.fg },
    c = { bg = colors.none, fg = colors.fg },
  },
  inactive = {
    a = { bg = colors.bg1, fg = colors.grey1, gui = "bold" },
    b = { bg = colors.bg1, fg = colors.grey1 },
    c = { bg = colors.none, fg = colors.grey1 },
  },
}

require("plenary.reload").reload_module("lualine", true)
require("lualine").setup {
  options = {
    theme = theme,
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
