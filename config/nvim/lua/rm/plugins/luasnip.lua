local ls = require "luasnip"
local types = require "luasnip.util.types"
local extras = require "luasnip.extras"
local fmt = require("luasnip.extras.fmt").fmt

require("luasnip").filetype_extend("dart", { "flutter" })
require("luasnip").filetype_extend(
  "typescriptreact",
  { "javascriptreact", "html" }
)

ls.config.set_config {
  history = false,
  region_check_events = "CursorMoved,CursorHold,InsertEnter",
  delete_check_events = "InsertLeave",
  updateevents = "TextChanged,TextChangedI",
  enable_autosnippets = true,
  ext_opts = {
    [types.choiceNode] = {
      active = {
        hl_mode = "combine",
        virt_text = { { "∨", "Operator" } },
     },
    },
    [types.insertNode] = {
      active = {
        hl_mode = "combine",
        virt_text = { { "●", "Type" } },
      },
    },
  },
  snip_env = {
    fmt = fmt,
    m = extras.match,
    t = ls.text_node,
    f = ls.function_node,
    c = ls.choice_node,
    d = ls.dynamic_node,
    i = ls.insert_node,
    l = extras.lamda,
    snippet = ls.snippet,
  },
}

require("luasnip.loaders.from_vscode").lazy_load()
require("luasnip.loaders.from_lua").load {
  paths = { "~/.config/nvim/luasnippets" },
}

vim.keymap.set(
  "n",
  "<leader>so",
  "<cmd>lua require('luasnip.loaders').edit_snippet_files()<CR>"
)
vim.keymap.set({ "s", "i" }, "<c-l>", function()
  if ls.choice_active() then
    ls.change_choice(1)
  end
end)
vim.keymap.set({ "s", "i" }, "<c-j>", function()
  if ls.choice_active() then
    require "luasnip.extras.select_choice"()
  end
end)
