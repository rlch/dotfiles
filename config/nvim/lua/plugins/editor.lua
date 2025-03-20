---@diagnostic disable: undefined-field
local Util = require("lazyvim.util")

return {
  {
    "chrishrb/gx.nvim",
    event = { "BufEnter" },
    dependencies = { "nvim-lua/plenary.nvim" },
    opts = {
      open_browser_app = "open",
      -- open_browser_args = { "--background" },
      handlers = {
        plugin = true, -- open plugin links in lua (e.g. packer, lazy, ..)
        github = true, -- open github issues
        brewfile = true, -- open Homebrew formulaes and casks
        package_json = true, -- open dependencies from package.json
        search = true, -- search the web/selection on the web if nothing else is found
      },
      handler_options = {
        search_engine = "google", -- you can select between google, bing, duckduckgo, and ecosia
      },
    },
  },
  {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    opts = {
      popup_border_style = "rounded",
      window = {
        position = "float",
      },
      nesting_rules = {
        default_component_configs = {
          indent = {
            indent_marker = "│",
            last_indent_marker = "└",
            highlight = "NeoTreeIndentMarker",
            with_expanders = nil,
            epander_collapsed = " ",
            expander_expanded = " ",
            expander_highlight = "NeoTreeExpander",
          },
          icon = {
            folder_closed = "",
            folder_open = "",
            folder_empty = "",
            default = "*",
          },
          name = {
            trailing_slash = false,
            use_git_status_colors = true,
          },
        },
        ["dart"] = { "config.dart", "pearl_config.dart", "g.dart", "model.dart" },
      },
      filesystem = {
        filtered_items = {
          visible = true,
          hide_dotfiles = false,
          hide_gitignored = true,
          hide_hidden = true,
        },
        follow_current_file = {
          enabled = true,
          leave_dirs_open = true,
        },
      },
    },
    keys = {
      {
        "<leader>fe",
        function()
          require("neo-tree.command").execute({ toggle = true, dir = vim.loop.cwd(), reveal = true })
        end,
        desc = "Explorer NeoTree (cwd)",
      },
      {
        "<leader>fE",
        function()
          require("neo-tree.command").execute({ toggle = true, dir = Util.root(), reveal = true })
        end,
        desc = "Explorer NeoTree (root dir)",
      },
      { "<leader>o", "<leader>fe", desc = "Explorer NeoTree (cwd)", remap = true },
      { "<leader>O", "<leader>fE", desc = "Explorer NeoTree (root dir)", remap = true },
      { "<leader>e", "<leader>fe", desc = "Explorer NeoTree (cwd)", remap = true },
      { "<leader>E", "<leader>fE", desc = "Explorer NeoTree (root dir)", remap = true },
      {
        "<leader>ge",
        function()
          require("neo-tree.command").execute({ source = "git_status", toggle = true })
        end,
        desc = "Git explorer",
      },
      {
        "<leader>be",
        function()
          require("neo-tree.command").execute({ source = "buffers", toggle = true })
        end,
        desc = "Buffer explorer",
      },
    },
  },
  {
    "ghillb/cybu.nvim",
    branch = "main", -- timely updates
    dependencies = { "nvim-tree/nvim-web-devicons", "nvim-lua/plenary.nvim" }, -- optional for icon support
    keys = {
      { "(", "<Plug>(CybuPrev)", mode = "n" },
      { ")", "<Plug>(CybuNext)", mode = "n" },
      { "<C-S-Tab>", "<plug>(CybuLastusedPrev)", mode = { "n", "v" } },
      { "<C-Tab>", "<plug>(CybuLastusedNext)", mode = { "n", "v" } },
    },
    opts = {},
  },
  {
    "cshuaimin/ssr.nvim",
    opts = {
      border = "rounded",
      min_width = 50,
      min_height = 5,
      max_width = 120,
      max_height = 25,
      adjust_window = true,
      keymaps = {
        close = "q",
        next_match = "n",
        prev_match = "N",
        replace_confirm = "<cr>",
        replace_all = "<leader><cr>",
      },
    },
    keys = {
      {
        "<leader>sR",
        function()
          require("ssr").open()
        end,
        desc = "Structural search and replace",
      },
    },
  },
  {
    "kevinhwang91/nvim-bqf",
    ft = "qf",
  },
  {
    "echasnovski/mini.pairs",
    enabled = true,
  },
  {
    "altermo/ultimate-autopair.nvim",
    event = { "InsertEnter", "CmdlineEnter" },
    branch = "v0.6", --recommended as each new version will have breaking changes
    opts = {},
  },
  {
    "lambdalisue/vim-suda",
    cmd = { "SudaRead", "SudaWrite" },
  },
  {
    "nvim-treesitter/nvim-treesitter",
    opts = {
      indent = {
        disable = { "lua" },
      },
      incremental_selection = {
        enable = true,
        keymaps = {
          init_selection = "<C-space>",
          node_incremental = "<C-space>",
          scope_incremental = false,
          node_decremental = "<bs>",
        },
      },
    },
  },
  {
    "snacks.nvim",
    opts = {
      scroll = { enabled = false },
    },
  },
}
