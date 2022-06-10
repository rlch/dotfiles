require('dapui').setup {
  icons = { expanded = '▾', collapsed = '▸' },
  mappings = {
    expand = { '<CR>', '<2-LeftMouse>' },
    open = 'o',
    remove = 'd',
    edit = 'e',
    repl = 'r',
  },
  sidebar = {
    elements = {
      {
        id = 'scopes',
        size = 0.25,
      },
      { id = 'breakpoints', size = 0.25 },
      { id = 'stacks', size = 0.25 },
      { id = 'watches', size = 00.25 },
    },
    size = 40,
    position = 'right',
  },
  tray = {
    elements = {},
    size = 0,
    position = 'bottom',
  },
  floating = {
    max_height = nil,
    max_width = nil,
    mappings = {
      close = { 'q', '<Esc>' },
    },
  },
  windows = { indent = 1 },
}

vim.fn.sign_define('DapBreakpoint', { text = '●', texthl = 'LspDiagnosticsSignError' })

mapx('n', '<leader>db', 'lua require("dap").toggle_breakpoint()')
mapx('n', '<leader>dx', 'lua require("dapui").close()')
mapx('n', '<leader>dc', 'lua require("dap").continue()')
mapx('n', '<leader>dl', 'lua require("dap").run_last()')
mapx('n', '<leader>do', 'lua require("dapui").open()')
mapx('n', '<leader>dr', 'lua require("dap").repl.open()')
mapx('n', '<leader>dsn','lua require("dap").step_over()')
mapx('n', '<leader>dsi','lua require("dap").step_into()')
mapx('n', '<leader>dso','lua require("dap").step_out()')
mapx('n', '<leader>dt', 'lua require("dapui").toggle()')
