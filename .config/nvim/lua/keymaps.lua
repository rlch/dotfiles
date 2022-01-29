local nest = require 'nest'

nest.applyKeymaps {
  { mode = 'n', options = { noremap = true }, { ';', ':' } },
  { mode = 'v', options = { noremap = true }, { ';', ':' } },
  {
    mode = 'n',
    options = { noremap = true },
    {
      {
        'g',
        {
          { 'b', '<cmd>BufferLinePick<CR>' },
          { 'd', '<cmd>lua vim.lsp.buf.definition()<cr>' },
          { 'D', '<cmd>lua vim.lsp.buf.declaration()<cr>' },
          { 'i', '<cmd>lua vim.lsp.buf.implementation()<cr>' },
          { 'r', '<cmd>lua require("renamer").rename()<cr>' },
        },
        options = { silent = true },
      },
      {
        '<leader>',
        {
          { 'o', '<cmd>NvimTreeFocus<CR>' },
          {
            'd',
            {
              { 'b', '<cmd>lua require"dap".toggle_breakpoint()<cr>' },
              --[[ {
                'bl',
                '<cmd>lua require"dap".set_breakpoint(nil, nil, vim.fn.input("Log point message<cmd> "))<cr>',
              }, ]]
              {
                'B',
                '<cmd>lua require"dap".set_breakpoint(vim.fn.input("Breakpoint condition<cmd> "))<cr>',
              },
              { 'x', '<cmd>lua require"dapui".close()<cr>' },
              { 'c', '<cmd>lua require"dap".continue()<cr>' },
              {
                { 'h', '<cmd>lua require"lspsaga.diagnostic".show_line_diagnostics()<cr>' },
                { 'k', '<cmd>:Lspsaga diagnostic_jump_prev<CR>' },
                { 'j', '<cmd>:Lspsaga diagnostic_jump_next<CR>' },
                options = { silent = true },
              },
              { 'l', '<cmd>lua require"dap".run_last()<cr>' },
              { 'o', '<cmd>lua require"dapui".open()<cr>' },
              { 'r', '<cmd>lua require"dap".repl.open()<cr>' },
              { 'sn', '<cmd>lua require"dap".step_over()<cr>' },
              { 'si', '<cmd>lua require"dap".step_into()<cr>' },
              { 'so', '<cmd>lua require"dap".step_out()<cr>' },
              { 't', '<cmd>lua require"dapui".toggle()<cr>' },
            },
          },
          {
            'f',
            {
              { 'a', '<cmd>Telescope lsp_code_actions<cr>' },
              { 'b', '<cmd>Telescope buffers<cr>' },
              { 'c', '<cmd>Telescope neoclip<CR>' },
              { 'd', '<cmd>Telescope diagnostics<cr>' },
              { 'f', '<cmd>Telescope find_files<cr>' },
              { 'F', '<cmd>Telescope flutter commands<cr>' },
              {
                'g',
                {
                  { 'b', '<cmd>Telescope git_branches<cr>' },
                  { 'c', '<cmd>Telescope git_commits<cr>' },
                  { 's', '<cmd>Telescope git_status<cr>' },
                },
              },
              { 'h', '<cmd>Telescope resume<cr>' },
              { 'H', '<cmd>Telescope help_tags<cr>' },
              { 'n', '<cmd>lua require("github-notifications.menu").notifications()<CR>' },
              { 'p', '<cmd>Telescope projects<CR>' },
              -- { 'r', '<cmd>Telescope lsp_references<cr>' },
              { 'r', '<cmd>Telescope grep_string<cr>' },
              { 's', '<cmd>Telescope live_grep<cr>' },
            },
          },
          {
            'F',
            {
              { 'A', '<cmd>FlutterRun<cr>' },
              { 'M', '<cmd>FlutterRun -d macos --dart-define=env=debug<cr>' },
              { 'C', '<cmd>FlutterRun -d chrome --web-port=42069 --dart-define=env=debug<cr>' },
              { 'D', '<cmd>FlutterDevices<cr>' },
              { 'E', '<cmd>FlutterEmulators<cr>' },
              {
                'L',
                {
                  { 'C', '<cmd>FlutterLogClear<cr>' },
                  { 'T', require('utils.flutter').toggle_log },
                  { 'L', require('utils.flutter').toggle_log },
                },
              },
              { 'r', '<cmd>FlutterReload<cr>' },
              { 'R', '<cmd>FlutterRestart<cr>' },
              { 'S', '<cmd>lua require("telescope").extensions.flutter.fvm()<cr>' },
              { 'Q', '<cmd>FlutterQuit<cr>' },
              { 'O', '<cmd>FlutterOutlineToggle<cr>' },
              {
                'U',
                {
                  { 'P', '<cmd>FlutterCopyProfilerUrl<cr>' },
                  { 'D', '<cmd>FlutterDevTools<cr>' },
                },
              },
              {
                'P',
                {
                  { 'U', '<cmd>FlutterPubUpgrade<cr>' },
                  { 'G', '<cmd>FlutterPubGet<cr>' },
                },
              },
            },
          },
          {
            'g',
            {
              { 'B', '<cmd>G blame<cr>' },
              { 's', '<cmd>vertical G<CR>' },
              { 'c', '<cmd>G commit<CR>' },
              { 'f', '<cmd>G pull<CR>' },
              { 'p', '<cmd>G push<CR>' },
              { 'h', '<cmd>diffget //2<CR>' },
              { 'l', '<cmd>diffget //3<CR>' },
              {
                'H',
                '<cmd>lua require("utils.synstack").get_highlight_groups()<cr>',
                options = { silent = false },
              },
              --
            },
          },
          {
            'l',
            {
              {
                'd',
                {
                  { 'a', '<cmd>AddDependency<CR>' },
                  { 'd', '<cmd>AddDevDependency<CR>' },
                  { 'u', '<cmd>UpdateDependencyLine<CR>' },
                },
              },
              {
                'f',
                '<cmd>lua vim.lsp.buf.formatting()<cr>',
              },
            },
          },
          { 'm', {
            { 'p', '<cmd>MarkdownPreview<cr>' },
          } },
          { 'nl', '<cmd>lua vim.cmd("edit " .. vim.lsp.get_log_path())<CR>' },
          {
            'r',
            {
              { 'sb', '<cmd>RustStartStandaloneServerForBuffer<cr>' },
            },
          },
          {
            's',
            {
              { 'v', '<cmd>source $MYVIMRC<cr>' },
              { 'g', '<cmd>lua require("utils.refresh-package").refresh_ghn()<cr>' },
              { 'w', '<cmd>lua require("spectre").open_visual({select_word=true})<cr>' },
              { 's', '<cmd>PackerSync<CR>' },
            },
          },
          {
            't',
            {
              { 'o', '<cmd>NvimTreeToggle<CR>' },
              { 't', '<cmd>TroubleToggle workspace_diagnostics<CR>' },
              { 'd', '<cmd>UltestDebugNearest<cr>' },
              { 'D', '<cmd>UltestDebug<cr>' },
              { 'f', '<cmd>Ultest<cr>' },
              { 'h', '<cmd>UltestOutput<cr>' },
              { 'n', '<cmd>UltestNearest<cr>' },
              { 's', '<cmd>UltestSummary!<cr>' },
              { 'x', '<cmd>UltestStopNearest<cr>' },
              { 'X', '<cmd>UltestStop<cr>' },
            },
          },
          { '<leader>', '<cmd>noh<cr><cr>' },
        },
      },
      { '<C-f>', '<cmd>lua require("lspsaga.action").smart_scroll_with_saga(1)<cr>' },
      { '<C-b>', '<cmd>lua require("lspsaga.action").smart_scroll_with_saga(-1)<cr>' },
      {
        '<C-q>',
        {
          { '', '<Nop>' },
          { '1', '<Cmd>BufferLineGoToBuffer 1<CR>' },
          { '2', '<Cmd>BufferLineGoToBuffer 2<CR>' },
          { '3', '<Cmd>BufferLineGoToBuffer 3<CR>' },
          { '4', '<Cmd>BufferLineGoToBuffer 4<CR>' },
          { '5', '<Cmd>BufferLineGoToBuffer 5<CR>' },
          { '6', '<Cmd>BufferLineGoToBuffer 6<CR>' },
          { '7', '<Cmd>BufferLineGoToBuffer 7<CR>' },
          { '8', '<Cmd>BufferLineGoToBuffer 8<CR>' },
          { '9', '<Cmd>BufferLineGoToBuffer 9<CR>' },
          { 'k', '<Cmd>BufferLineCycleNext<CR>' },
          { 'j', '<Cmd>BufferLineCyclePrev<CR>' },
          { 'K', '<Cmd>BufferLineMoveNext<CR>' },
          { 'J', '<Cmd>BufferLineMovePrev<CR>' },
          { 'd', '<Cmd>lua require("bufdelete").bufdelete(0)<CR>' },
          { '<C-1>', '<Cmd>BufferLineGoToBuffer 1<CR>' },
          { '<C-2>', '<Cmd>BufferLineGoToBuffer 2<CR>' },
          { '<C-3>', '<Cmd>BufferLineGoToBuffer 3<CR>' },
          { '<C-4>', '<Cmd>BufferLineGoToBuffer 4<CR>' },
          { '<C-5>', '<Cmd>BufferLineGoToBuffer 5<CR>' },
          { '<C-6>', '<Cmd>BufferLineGoToBuffer 6<CR>' },
          { '<C-7>', '<Cmd>BufferLineGoToBuffer 7<CR>' },
          { '<C-8>', '<Cmd>BufferLineGoToBuffer 8<CR>' },
          { '<C-9>', '<Cmd>BufferLineGoToBuffer 9<CR>' },
          { '<C-k>', '<Cmd>BufferLineCycleNext<CR>' },
          { '<C-j>', '<Cmd>BufferLineCyclePrev<CR>' },
          { '<C-d>', '<Cmd>lua require("bufdelete").bufdelete(0)<CR>' },
          { '<C-t>', '<Cmd>BufferLineGroupToggle<CR>' },
          { '<C-g>', '<Cmd>BufferLineGroupClose<CR>' },
        },
      },
    },
  },
  {
    mode = 'v',
    options = { noremap = true },
    {
      {
        '<leader>',
        {
          { 'a', '<cmd>C-U>lua require("lsp-fastaction").range_code_action()<cr>' },
          { 's', '<cmd>lua require("spectre").open_visual()<cr>' },
        },
      },
      { 'J', ":m '>+1<cr>gv=gv" },
      { 'K', ":m '<-2<cr>gv=gv" },
    },
  },
  {
    mode = 'c',
    options = { noremap = true, expr = true },
    {
      { '<C-j>', [[pumvisible() ? "\<C-n>" : "\<C-j>"]] },
      { '<C-k>', [[pumvisible() ? "\<C-p>" : "\<C-k>"]] },
    },
  },
  {
    mode = 'n',
    options = { noremap = false },
    {
      {
        '<leader>',
        {
          { 'a', '<cmd>lua require("lsp-fastaction").code_action()<cr>' },
          { 'S', '<cmd>lua require("spectre").open()<cr>' },
        },
      },
      { 'gx', 'viW"ay:!open <C-R>a &<cr>' },
      { 'K', '<cmd>lua require("lspsaga.hover").render_hover_doc()<cr>' },
      { 'H', '^', mode = 'nv' },
      { 'L', '$', mode = 'nv' },
      { 'Q', '@q' },
      { 'Y', 'y$' },
      { '<C-k>', '<C-p>' },
      { '<C-j>', '<C-n>' },
    },
  },
  {
    mode = 'i',
    options = { noremap = false, expr = true },
    { '<C-j>', [[pumvisible() ? "\<C-n>" : "\<C-j>"]] },
    { '<C-k>', [[pumvisible() ? "\<C-p>" : "\<C-k>"]] },
  },
}
