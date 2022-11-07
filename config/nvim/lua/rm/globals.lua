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

-- Keymaps --

---@alias Mode "n" | "v" | "i" | "c" | table
---@alias RHS string | fun() : any
---@param expr RHS
local function _to_exec(expr)
  return "<cmd>" .. expr .. "<cr>"
end

---@param mode Mode
---@param lhs string
---@param rhs RHS
---[@param] opts table
map = function(mode, lhs, rhs, opts)
  if type(opts) ~= "table" then
    opts = {}
  end

  return vim.keymap.set(mode, lhs, rhs, opts)
end

---@param mode Mode
---@param lhs string
---@param rhs RHS
---[@param] opts table
mapx = function(mode, lhs, rhs, opts)
  return map(mode, lhs, _to_exec(rhs), opts or {})
end

---@param mode Mode
---@param lhs string
---@param rhs RHS
---[@param] opts table
remap = function(mode, lhs, rhs, opts)
  return map(
    mode,
    lhs,
    rhs,
    vim.tbl_extend("keep", { remap = true }, opts or {})
  )
end

---@param mode Mode
---@param lhs string
---@param rhs RHS
---@param opts table
remapx = function(mode, lhs, rhs, opts)
  return remap(mode, lhs, _to_exec(rhs), opts or {})
end
