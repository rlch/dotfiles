---@class dropbar_configs_t
local opts = {
  general = {
    ---@type boolean|fun(buf: integer, win: integer): boolean
    enable = function(buf, win)
      return not vim.api.nvim_win_get_config(win).zindex
        and vim.bo[buf].buftype == ""
        and vim.api.nvim_buf_get_name(buf) ~= ""
        and not vim.wo[win].diff
    end,
    update_events = {
      "CursorMoved",
      "CursorMovedI",
      "DirChanged",
      "FileChangedShellPost",
      "TextChanged",
      "TextChangedI",
      "VimResized",
      "WinResized",
      "WinScrolled",
    },
  },
  icons = {
    kinds = {
      use_devicons = true,
      symbols = {
        Array = "󰅪 ",
        Boolean = " ",
        BreakStatement = "󰙧 ",
        Call = "󰃷 ",
        CaseStatement = "󱃙 ",
        Class = " ",
        Color = "󰏘 ",
        Constant = "󰏿 ",
        Constructor = " ",
        ContinueStatement = "→ ",
        Copilot = " ",
        Declaration = "󰙠 ",
        Delete = "󰩺 ",
        DoStatement = "󰑖 ",
        Enum = " ",
        EnumMember = " ",
        Event = " ",
        Field = " ",
        File = "󰈔 ",
        Folder = "󰉋 ",
        ForStatement = "󰑖 ",
        Function = "󰊕 ",
        Identifier = "󰀫 ",
        IfStatement = "󰇉 ",
        Interface = " ",
        Keyword = "󰌋 ",
        List = "󰅪 ",
        Log = "󰦪 ",
        Lsp = " ",
        Macro = "󰁌 ",
        MarkdownH1 = "󰉫 ",
        MarkdownH2 = "󰉬 ",
        MarkdownH3 = "󰉭 ",
        MarkdownH4 = "󰉮 ",
        MarkdownH5 = "󰉯 ",
        MarkdownH6 = "󰉰 ",
        Method = "󰆧 ",
        Module = "󰏗 ",
        Namespace = "󰅩 ",
        Null = "󰢤 ",
        Number = "󰎠 ",
        Object = "󰅩 ",
        Operator = "󰆕 ",
        Package = "󰆦 ",
        Property = " ",
        Reference = "󰦾 ",
        Regex = " ",
        Repeat = "󰑖 ",
        Scope = "󰅩 ",
        Snippet = "󰩫 ",
        Specifier = "󰦪 ",
        Statement = "󰅩 ",
        String = "󰉾 ",
        Struct = " ",
        SwitchStatement = "󰺟 ",
        Text = " ",
        Type = " ",
        TypeParameter = "󰆩 ",
        Unit = " ",
        Value = "󰎠 ",
        Variable = "󰀫 ",
        WhileStatement = "󰑖 ",
      },
    },
    ui = {
      bar = {
        separator = "  ",
        extends = "…",
      },
      menu = {
        separator = " ",
        indicator = "",
      },
    },
  },
}
require("dropbar").setup(opts)

vim.api.nvim_set_hl(0, "WinBar", { fg = "#859289" })
vim.api.nvim_set_hl(0, "WinBarNC", { fg = "#6b706c" })

-- local M = {}
--
-- M.winbar_filetype_exclude = {
--   "help",
--   "startify",
--   "dashboard",
--   "packer",
--   "neogitstatus",
--   "neo-tree",
--   "Trouble",
--   "alpha",
--   "lir",
--   "Outline",
--   "spectre_panel",
--   "toggleterm",
-- }
--
-- local truncate_filename = function()
--   local path = vim.fn.expand "%:p"
--   local path_width = string.len(path)
--   -- local width = vim.api.nvim_win_get_width(0)
--   -- local max_filename_width = math.floor(math.max(width * 0.2, 1))
--   local max_filename_width = 40
--   if path_width < max_filename_width then
--     return path
--   else
--     return string.gsub(
--       string.sub(path, path_width - max_filename_width, path_width),
--       "^([^/]*)/",
--       "…/"
--     )
--   end
-- end
--
-- local get_filename = function()
--   local truncated_filename = truncate_filename()
--   local extension = vim.fn.expand "%:e"
--
--   if truncated_filename ~= "" and truncated_filename ~= nil then
--     local file_icon, file_icon_color =
--       require("nvim-web-devicons").get_icon_color(
--         vim.fn.expand "%:t",
--         extension,
--         { default = true }
--       )
--
--     local hl_group = "FileIconColor" .. extension
--
--     vim.api.nvim_set_hl(0, hl_group, { fg = file_icon_color })
--     if file_icon == nil or file_icon == "" then
--       file_icon = ""
--       file_icon_color = ""
--     end
--
--     return " "
--       .. "%#"
--       .. hl_group
--       .. "#"
--       .. file_icon
--       .. "%*"
--       .. " "
--       .. "%#CursorLineNr#"
--       .. truncated_filename
--       .. "%*"
--   end
-- end
--
-- local get_gps = function()
--   local status_gps_ok, navic = pcall(require, "nvim-navic")
--   if not status_gps_ok then
--     return ""
--   end
--
--   local status_ok, gps_location = pcall(navic.get_location, {})
--   if not status_ok then
--     return ""
--   end
--
--   if not navic.is_available() or gps_location == "error" then
--     return ""
--   end
--
--   if gps_location ~= "" and gps_location ~= nil then
--     return "%#LineNr#" .. R.icons.ui.ChevronRight .. "%* " .. gps_location
--   else
--     return ""
--   end
-- end
--
-- local excludes = function()
--   if vim.tbl_contains(M.winbar_filetype_exclude, vim.bo.filetype) then
--     vim.opt_local.winbar = nil
--     return true
--   end
--   return false
-- end
--
-- M.get_winbar = function()
--   if excludes() then
--     return
--   end
--   local value = get_filename()
--
--   local gps_added = false
--   if value ~= "" and value ~= nil then
--     local gps_value = get_gps()
--     value = value .. " " .. gps_value
--     if gps_value ~= "" then
--       gps_added = true
--     end
--
--     local ok, modified = pcall(vim.api.nvim_buf_get_option, 0, "mod")
--     if ok and modified then
--       local mod = "%#CursorLineNr#" .. R.icons.ui.Circle .. "%*"
--       if gps_added then
--         value = value .. " " .. mod
--       else
--         value = value .. mod
--       end
--     end
--   end
--
--   local status_ok, _ = pcall(
--     vim.api.nvim_set_option_value,
--     "winbar",
--     value,
--     { scope = "local" }
--   )
--   if not status_ok then
--     return
--   end
-- end
--
-- return M
