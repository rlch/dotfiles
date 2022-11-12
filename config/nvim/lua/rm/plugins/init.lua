local packer = require "packer"

---@param args table
---@diagnostic disable-next-line: unused-local, unused-function
local use_local = function(args)
  args[1] = "~/Coding/Personal/" .. args[1]
  return packer.use(args)
end

---@param name string
-- Loads the module `name`.
local function module(name)
  return "require(" .. "'rm.plugins." .. name .. "')"
end

local PACKER_COMPILED_PATH = vim.fn.stdpath "config"
  .. "/lua/packer_compiled.lua"
if
  not vim.g.packer_compiled_loaded and vim.loop.fs_stat(PACKER_COMPILED_PATH)
then
  require "impatient"
  require "packer_compiled"
  vim.g.packer_compiled_loaded = true
end

return packer.startup {
  function(use)
    -- Packer
    use { "wbthomason/packer.nvim", "lewis6991/impatient.nvim" }

    -- Treesitter
    use {
      {
        "nvim-treesitter/nvim-treesitter",
        run = function()
          require("nvim-treesitter.install").update { with_sync = true }
        end,
        config = module "treesitter",
      },
      "nvim-treesitter/playground",
    }

    -- Autocomplete
    use {
      {
        "hrsh7th/nvim-cmp",
        config = module "cmp",
        requires = {
          "saadparwaiz1/cmp_luasnip",
          "hrsh7th/cmp-nvim-lsp",
          "hrsh7th/cmp-buffer",
          "hrsh7th/cmp-path",
          "hrsh7th/cmp-cmdline",
          "hrsh7th/cmp-nvim-lsp-document-symbol",
          "hrsh7th/cmp-nvim-lsp-signature-help",
          "lukas-reineke/cmp-rg",
          "andersevenrud/cmp-tmux",
          "petertriho/cmp-git",
          "dmitmel/cmp-cmdline-history",
          "neovim/nvim-lspconfig",
          "L3MON4D3/LuaSnip",
          "windwp/nvim-autopairs",
          "onsails/lspkind-nvim",
        },
        event = "InsertEnter",
      },
      {
        "github/copilot.vim",
        disable = true,
        config = function()
          vim.g.copilot_no_tab_map = true
          vim.g.copilot_assume_mapped = true
          vim.g.copilot_tab_fallback = ""
          vim.g.copilot_filetypes = {
            ["*"] = true,
            TelescopePrompt = false,
          }
          map("i", "<C-f>", [[copilot#Accept("\<CR>")]], { expr = true })
        end,
      },
    }

    -- Org
    use {
      "nvim-neorg/neorg",
      branch = "main",
      config = module "org/neorg",
      requires = {
        "nvim-lua/plenary.nvim",
        "nvim-treesitter/nvim-treesitter",
        "nvim-telescope/telescope.nvim",
        "nvim-neorg/neorg-telescope",
      },
      run = ":Neorg sync-parsers",
    }

    -- Language specific
    use {
      -- Dart / Flutter
      {
        "akinsho/flutter-tools.nvim",
        config = module "lang.flutter-tools",
        requires = { "hrsh7th/nvim-cmp", "neovim/nvim-lspconfig" },
        ft = { "dart" },
      },
      {
        "dart-lang/dart-vim-plugin",
        config = function()
          vim.g.dart_format_on_save = 0
          vim.g.dart_style_guide = 2
        end,
        requires = "akinsho/flutter-tools.nvim",
        ft = { "dart" },
      },

      -- Rust
      {
        "simrat39/rust-tools.nvim",
        requires = { "neovim/nvim-lspconfig", "hrsh7th/nvim-cmp" },
        wants = {
          "nvim-lua/popup.nvim",
          "nvim-lua/plenary.nvim",
          "nvim-telescope/telescope.nvim",
        },
        config = module "lang.rust-tools",
        -- ft = { "rust", "rs", "toml" },
      },

      -- Go
      {
        "ray-x/go.nvim",
        config = module "lang.go",
        requires = { "neovim/nvim-lspconfig", "hrsh7th/nvim-cmp" },
        ft = { "go" },
      },

      -- SQL
      "nanotee/sqls.nvim",

      -- GQL
      "jparise/vim-graphql",

      -- Terraform
      "hashivim/vim-terraform",

      -- LaTeX
      {
        "lervag/vimtex",
        config = module "lang.latex",
        ft = { "tex" },
      },
    }

    use {
      -- LSP
      {
        "neovim/nvim-lspconfig",
        config = module "lsp.lspconfig",
        requires = {
          "RRethy/vim-illuminate",
          "nvim-navic",
          "lvimuser/lsp-inlayhints.nvim",
          "jose-elias-alvarez/nvim-lsp-ts-utils",
        },
      },
      {
        "jose-elias-alvarez/null-ls.nvim",
        config = module "lsp.null-ls",
        event = { "BufEnter" },
      },
      {
        "mfussenegger/nvim-dap",
        disable = true,
        config = module "lsp.dap",
        requires = { "rcarriga/nvim-dap-ui" },
        event = { "BufEnter" },
      },
      {
        "folke/trouble.nvim",
        config = function()
          require("trouble").setup {
            use_diagnostic_signs = true,
            position = "right",
            height = 10,
            width = 45,
            icons = true,
          }
        end,
        event = "BufEnter",
      },
      {
        "narutoxy/dim.lua",
        requires = {
          "nvim-treesitter/nvim-treesitter",
          "neovim/nvim-lspconfig",
        },
        config = function()
          require("dim").setup {}
        end,
        disable = true,
      },
      {
        "SmiteshP/nvim-navic",
        config = module "lsp.navic",
      },
      {
        "lvimuser/lsp-inlayhints.nvim",
        requires = "neovim/nvim-lspconfig",
        config = function()
          require("lsp-inlayhints").setup {
            inlay_hints = {
              parameter_hints = {
                show = false,
                prefix = "<- ",
                separator = ", ",
                remove_colon_start = false,
                remove_colon_end = true,
              },
              type_hints = {
                show = true,
                prefix = "",
                separator = ", ",
                remove_colon_start = false,
                remove_colon_end = false,
              },
              labels_separator = "  ",
              max_len_align = false,
              max_len_align_padding = 1,
              right_align = false,
              right_align_padding = 7,
              highlight = "Comment",
            },
          }
        end,
      },
      -- Tests
      use {
        "nvim-neotest/neotest",
        requires = {
          "nvim-lua/plenary.nvim",
          "nvim-treesitter/nvim-treesitter",
          "antoinemadec/FixCursorHold.nvim",
          "nvim-neotest/neotest-vim-test",
          "nvim-neotest/neotest-go",
          "vim-test/vim-test",
        },
        event = { "BufEnter" },
        config = module "lsp.neotest",
      },
    }

    use {
      "rlch/lsp-fastaction.nvim",
      requires = "neovim/nvim-lspconfig",
      config = module "lsp.fastaction",
      disable = true,
    }

    -- Snippets
    use {
      "L3MON4D3/LuaSnip",
      config = module "luasnip",
      event = "InsertEnter",
      requires = "rafamadriz/friendly-snippets",
    }

    -- UI + Highlighting
    use {
      {
        "stevearc/dressing.nvim",
        config = function()
          require("dressing").setup {
            input = {
              winblend = 0,
            },
          }
        end,
      },
      {
        "kwkarlwang/bufresize.nvim",
        config = function()
          require("bufresize").setup {}
        end,
      },
      {
        "chrisbra/Colorizer",
        ft = "log",
        config = function()
          vim.g.colorizer_auto_filetype = "log"
          vim.g.colorizer_disable_bufleave = 1
        end,
      },
      {
        "norcalli/nvim-colorizer.lua",
        event = "BufEnter",
        config = function()
          require("colorizer").setup {
            "*",
            "!dart",
          }
        end,
      },
      {
        "sainnhe/everforest",
        as = "colorscheme",
        config = module "ui.colorscheme",
      },
      {
        "mtdl9/vim-log-highlighting",
        ft = "log",
      },
      {
        "luukvbaal/stabilize.nvim",
        config = function()
          require("stabilize").setup {}
        end,
      },

      -- Statusline
      {
        "nvim-lualine/lualine.nvim",
        config = module "ui.statusline",
        -- after = 'colorscheme',
      },
      {
        "lukas-reineke/indent-blankline.nvim",
        config = function()
          require("indent_blankline").setup {
            use_treesitter = true,
            use_treesitter_scope = true,
            show_current_context = true,
            show_current_context_start = false,
            filetype = { "yaml", "gotmpl", "yml", "pubspec" },
          }
        end,
      },
    }

    -- Workflow
    use {
      -- File-tree
      {
        "nvim-neo-tree/neo-tree.nvim",
        branch = "v2.x",
        requires = {
          "nvim-lua/plenary.nvim",
          "kyazdani42/nvim-web-devicons",
          "MunifTanjim/nui.nvim",
          "mrbjarksen/neo-tree-diagnostics.nvim",
        },
        config = module "workflow.neo-tree",
      },
      {
        "ahmedkhalf/project.nvim",
        config = module "workflow.project",
        requires = {
          "nvim-telescope/telescope.nvim",
        },
      },

      -- Fuzzy-finder
      { "nvim-telescope/telescope-fzf-native.nvim", run = "make" },
      {
        "nvim-telescope/telescope.nvim",
        requires = {
          "nvim-lua/plenary.nvim",
          "nvim-telescope/telescope-fzf-native.nvim",
        },
        config = module "workflow.telescope",
      },

      {
        "ThePrimeagen/harpoon",
        disable = true,
        requires = "nvim-lua/plenary.nvim",
        config = module "workflow.harpoon",
      },

      -- Window management
      {
        "anuvyklack/windows.nvim",
        requires = { "anuvyklack/middleclass" },
        config = module "workflow.windows",
      },

      -- Docs
      {
        "danymat/neogen",
        config = module "workflow.neogen",
        requires = "nvim-treesitter/nvim-treesitter",
      },
    }

    -- Traversal & motion
    use {
      "tpope/vim-surround",
      "tpope/vim-repeat",
      "tpope/vim-abolish",
      "fedepujol/move.nvim",
      {
        "monaqa/dial.nvim",
        config = module "motion.dial",
      },
      "simeji/winresizer",
      {
        "bkad/CamelCaseMotion",
        config = function()
          vim.g.camelcasemotion_key = "<leader>"
        end,
      },
      {
        "windwp/nvim-autopairs",
        config = module "motion.pairs",
        requires = "hrsh7th/nvim-cmp",
      },
      {
        "folke/todo-comments.nvim",
        -- after = 'colorscheme',
      },
      {
        "numToStr/Comment.nvim",
        config = function()
          require("Comment").setup()
        end,
        event = "InsertEnter",
      },
      {
        "rlane/pounce.nvim",
        config = function()
          require("pounce").setup {
            accept_keys = "JFKDLSAHGNUVRBYTMICEOXWPQZ",
            accept_best_key = "<enter>",
            multi_window = true,
            debug = false,
          }
        end,
        event = "BufEnter",
      },
      {
        "nvim-pack/nvim-spectre",
        config = function()
          require("spectre").setup()
          vim.keymap.set("n", "<leader>r", function()
            require("spectre").open()
          end)
        end,
      },
      {
        "kevinhwang91/nvim-ufo",
        requires = {
          "kevinhwang91/promise-async",
          "neovim/nvim-lspconfig",
        },
        config = function()
          require("ufo").setup()
        end,
      },
    }

    -- Git
    use {
      {
        "lewis6991/gitsigns.nvim",
        requires = { "nvim-lua/plenary.nvim" },
        config = function()
          vim.wo.signcolumn = "auto:1"
          require("gitsigns").setup()
        end,
      },
      {
        "TimUntersberger/neogit",
        requires = {
          "sindrets/diffview.nvim",
          "nvim-lua/plenary.nvim",
        },
        config = module "git.neogit",
      },
      use {
        "akinsho/git-conflict.nvim",
        config = function()
          vim.cmd [[
highlight ConflictMarkerOurs guibg=#2e5049
highlight ConflictMarkerTheirs guibg=#344f69
]]
          require("git-conflict").setup {
            disable_diagnostics = true,
            highlights = {
              current = "ConflictMarkerOurs",
              incoming = "ConflictMarkerTheirs",
            },
          }
        end,
      },
    }

    use {
      "rlch/github-notifications.nvim",
      branch = "hooks",
      config = module "git.notifications",
      disable = true,
      requires = {
        "nvim-lua/plenary.nvim",
        "nvim-lualine/lualine.nvim",
        "nvim-telescope/telescope.nvim",
        "rcarriga/nvim-notify",
      },
    }

    -- Diagnostics + Utilities
    use {
      {
        "folke/which-key.nvim",
        config = function()
          require("which-key").setup {
            plugins = {
              spelling = {
                enabled = true,
                suggestions = 20,
              },
            },
            triggers = { "<localleader>" },
          }
        end,
      },
      {
        "dstein64/vim-startuptime",
        cmd = "StartupTime",
        config = function()
          vim.g.startuptime_tries = 15
          vim.g.startuptime_exe_args = { "+let g:auto_session_enabled = 0" }
        end,
      },
      {
        "radenling/vim-dispatch-neovim",
        requires = "tpope/vim-dispatch",
      },
      {
        "gioele/vim-autoswap",
        config = function()
          vim.g.autoswap_detect_tmux = 1
        end,
      },
      {
        "antoinemadec/FixCursorHold.nvim",
        config = function()
          vim.g.cursorhold_updatetime = 25
        end,
      },
    }

    if packer_bootstrap then
      require("packer").sync()
    end
  end,
  log = { level = "info" },
  config = {
    compile_path = PACKER_COMPILED_PATH,
    profile = {
      enable = true,
      threshold = 1,
    },
  },
}
