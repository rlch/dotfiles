-- TODO: Improve

local neotest = require "neotest"
neotest.setup {
  adapters = {
    require "neotest-vim-test" {
      ignore_file_types = { "python", "vim", "lua", "go" },
    },
    require "neotest-go",
  },
  quickfix = {
    open = false,
  },
}

keymap({
  name = "Testing",
  c = {
    function()
      local cov = require("coverage")
      local cov_signs = require("coverage.signs")
      if cov_signs.is_enabled() then
        cov.toggle()
      else
        cov.load(true)
      end
    end,
    "Coverage",
  },
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
      require("neotest").summary.open()
    end,
    "Summary",
  },
}, {
  prefix = "<leader>t",
})
