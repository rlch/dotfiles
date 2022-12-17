local ls = require "luasnip"
local types = require "luasnip.util.types"
local extras = require "luasnip.extras"
local fmt = require("luasnip.extras.fmt").fmt

require("luasnip").filetype_extend("dart", { "flutter" })
require("luasnip").filetype_extend(
  "typescriptreact",
  { "javascriptreact", "html" }
)
require("luasnip.loaders.from_lua").lazy_load()
require("luasnip.loaders.from_vscode").lazy_load()

ls.config.set_config {
  history = true,
  region_check_events = "CursorMoved,CursorHold,InsertEnter",
  delete_check_events = "InsertLeave",
  updateevents = "TextChanged,TextChangedI",
  enable_autosnippets = true,
  ext_opts = {
    [types.choiceNode] = {
      active = {
        virt_text = { { "<-", "error" } },
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
