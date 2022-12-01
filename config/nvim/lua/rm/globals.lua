local fmt = string.format
---@diagnostic disable: lowercase-global

R = {
  icons = {
    signs = {
      Error = "",
      Warning = "",
      Warn = "",
      Hint = "",
      Information = "",
      Info = "",
    },
    git_status = {
      -- Change type
      added = "✚",
      deleted = "✖",
      modified = "",
      renamed = "➜",
      -- Status type
      untracked = "★",
      ignored = "◌",
      unstaged = "",
      staged = "✓",
      conflict = "",
    },
    lsp = {
      Array = "",
      Boolean = "",
      Class = "ﴯ",
      Color = "",
      Constant = "",
      Constructor = "",
      Enum = "",
      EnumMember = "",
      Event = "",
      Field = "ﰠ",
      File = "",
      Folder = "",
      Function = "",
      Interface = "",
      Key = "",
      Keyword = "",
      Method = "",
      Module = "",
      Number = "",
      Null = "",
      Object = "",
      Operator = "",
      Property = "ﰠ",
      Reference = "",
      Snippet = "",
      Struct = "",
      Text = "",
      TypeParameter = "",
      Unit = "塞",
      Value = "",
      Variable = "",
    },
    ui = {
      ArrowClosed = "",
      ArrowOpen = "",
      Lock = "",
      Circle = "",
      Close = "",
      NewFile = "",
      Search = "",
      Lightbulb = "",
      Project = "",
      Dashboard = "",
      History = "",
      Comment = "",
      Code = "",
      Telescope = "",
      Gear = "",
      Package = "",
      List = "",
      SignIn = "",
      SignOut = "",
      Check = "",
      Fire = "",
      Note = "",
      BookMark = "",
      Pencil = "",
      ChevronRight = "",
      Table = "",
      Calendar = "",
      CloudDownload = "",
    },
  },
  -- Utilty functions + variables for LSP config
  lsp = {},
}

---Create a neovim command
---@param name string
---@param rhs string
---[@param] modifiers string[]
command = function(name, rhs, modifiers)
  modifiers = modifiers or {}
  ---@diagnostic disable-next-line: undefined-field
  local nargs = modifiers and modifiers.nargs or 0
  vim.cmd(fmt("command! -nargs=%s %s %s", nargs, name, rhs))
end

-- Debugging --

I = function(...)
  print(vim.inspect(...))
end
