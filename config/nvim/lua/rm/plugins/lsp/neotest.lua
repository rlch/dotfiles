-- TODO: Improve

local neotest = require "neotest"
neotest.setup {
  adapters = {
    require "neotest-vim-test" {
      ignore_file_types = { "python", "vim", "lua", "go" },
    },
    require "neotest-go",
  },
}

keymap({
  name = "Neotest",
  n = {
    function()
      require("neotest").run.run()
    end,
    "Nearest",
  },
  q = {
    function()
      require("neotest").run.stop()
    end,
    "Stop",
  },
  f = {
    function()
      require("neotest").run.run(vim.fn.expand "%")
    end,
    "File",
  },
  d = {
    function()
      require("neotest").run.run { strategy = "dap" }
    end,
    "Debug",
  },
  h = {
    function()
      require("neotest").output.open { enter = true }
    end,
    "Output",
  },
  s = {
    function()
      require("neotest").summary.open { enter = true }
    end,
    "Summary",
  },
}, {
  prefix = "<leader>t",
})
