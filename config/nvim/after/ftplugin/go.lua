local buf = vim.api.nvim_get_current_buf()
local buf_dir = vim.fn.expand "%:p:h"
local filename = vim.fn.expand "%:t"

local _ = function(opts)
  local title = opts
  local command = opts
  if type(opts) == "table" then
    command = opts[1]
    title = opts[2]
  end

  return { "<cmd>Go" .. command .. "<cr>", title }
end

local ginkgo = function(pane_identifier)
  return function()
    -- TODO(harpoon): Support pane creation from `gotoTerminal(pane_identifier)`
    require("harpoon.tmux").sendCommand(
      pane_identifier,
      "clear;cd " .. buf_dir .. ";ginkgo -p\r"
    )
  end
end

-- local function is_domain_file()
--   local file = vim.fn.expand "%"
--   if #file <= 1 then
--     vim.notify("no buffer name", vim.lsp.log_levels.ERROR)
--     return
--   end
--   local is_domain = string.find(file, "domain/.*%.go$")
--   local is_data = string.find(file, "data/.*%.go$")
--   return file, (not is_data and is_domain), is_data
-- end
--
-- local function alternate()
--   local file, is_domain, is_data = is_domain_file()
--   local alt_file = file
--   if is_data then
--     alt_file = string.gsub(file, "(.*)/data/(.*)", "%1/domain/%2")
--   elseif is_domain then
--     alt_file = string.gsub(file, "(.*)/domain/(.*)", "%1/data/%2")
--   else
--     vim.notify("not a go file", vim.lsp.log_levels.ERROR)
--   end
--   return alt_file
-- end
--
-- local function switch(bang, cmd)
--   local alt_file = M.alternate()
--   if
--     not vim.fn.filereadable(alt_file)
--     and not vim.fn.bufexists(alt_file)
--     and not bang
--   then
--     vim.notify("couldn't find " .. alt_file, vim.lsp.log_levels.ERROR)
--     return
--   elseif #cmd <= 1 then
--     local ocmd = "e " .. alt_file
--     vim.cmd(ocmd)
--   else
--     local ocmd = cmd .. " " .. alt_file
--     vim.cmd(ocmd)
--   end
-- end

keymap({
  name = "Go",
  a = {
    name = "Auto fill",
    c = _ { "FillStruct", "struct" },
    s = _ { "FillSwitch", "switch" },
    i = _ { "IfErr", "if err" },
    p = _ { "FixPlurals", "plurals" },
  },
  b = _ { "Build", "Build" },
  c = _ "Cmt",
  f = _ { "Fmt", "Format" },
  g = _ { "Generate", "Generate" },
  l = _ { "Lint", "Lint" },
  m = _ { "Make", "make" },
  r = _ { "Run", "Run" },
  q = _ { "Stop", "Stop" },
  o = {
    t = {
      name = "Open associated test",
      w = _ { "Alt!", "Replace window" },
      s = _ { "AltS!", "Horizontal split" },
      v = _ { "AltV!", "Vertical split" },
    },
    d = {
      name = "Open associated domain/data",
      w = _ { "Alt!", "Replace window" },
      s = _ { "AltS!", "Horizontal split" },
      v = _ { "AltV!", "Vertical split" },
    },
  },
  t = {
    name = "ginkgo",
    b = {
      function()
        vim.api.nvim_command("!cd " .. buf_dir .. ";ginkgo bootstrap")
      end,
      "bootstrap",
    },
    g = {
      function()
        vim.api.nvim_command(
          "!cd " .. buf_dir .. ";ginkgo generate " .. filename
        )
      end,
      "generate",
    },
    v = { ginkgo "{right}", "vertical tmux pane" },
    s = { ginkgo "{bottom}", "horizontal tmux pane" },
  },
}, { prefix = "<localleader>", buffer = buf, silent = false })
