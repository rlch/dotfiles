local dap = require "dap"
local dapui = require "dapui"

dapui.setup {
  icons = { expanded = "▾", collapsed = "▸" },
  mappings = {
    expand = { "<CR>", "<2-LeftMouse>" },
    open = "o",
    remove = "d",
    edit = "e",
    repl = "r",
  },
  sidebar = {
    elements = {
      {
        id = "scopes",
        size = 0.25,
      },
      { id = "breakpoints", size = 0.25 },
      { id = "stacks", size = 0.25 },
      { id = "watches", size = 00.25 },
    },
    size = 40,
    position = "right",
  },
  tray = {
    elements = {},
    size = 0,
    position = "bottom",
  },
  floating = {
    max_height = nil,
    max_width = nil,
    mappings = {
      close = { "q", "<Esc>" },
    },
  },
  windows = { indent = 1 },
}

vim.fn.sign_define(
  "DapBreakpoint",
  { text = "●", texthl = "LspDiagnosticsSignError" }
)

keymap({
  name = "Debugger Adapter Protocol",
  -- b = dap.toggle_breakpoint,
  x = { dapui.close, "Close" },
  c = { dap.continue, "Continue" },
  l = { dap.run_last, "Run last" },
  O = { dapui.open, "Open" },
  r = { dap.repl.open, "Open repl" },
  sn = { dap.step_over, "Step over" },
  si = { dap.step_into, "Step into" },
  so = { dap.step_out, "Step out" },
  t = { dapui.toggle, "Toggle" },
}, {
  prefix = "<leader>d",
})
