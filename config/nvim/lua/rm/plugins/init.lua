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
  require "which-key"
  require "legendary"
  require "rm.mappings"
  pcall(require, "packer_compiled")
  vim.g.packer_compiled_loaded = true
end

return packer.startup {
  function(use)
    -- Base
    use {
      "wbthomason/packer.nvim",
      "lewis6991/impatient.nvim",
      "nvim-lua/plenary.nvim",
    }

    -- Mappings
    use {
      "folke/which-key.nvim",
      "mrjones2014/legendary.nvim",
    }

    -- Treesitter
    use {
      {
        "nvim-treesitter/nvim-treesitter",
        run = function()
          require("nvim-treesitter.install").update { with_sync = true }
        end,
        config = module "treesitter",
        requires = {
          "JoosepAlviste/nvim-ts-context-commentstring",
        },
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
      "folke/neodev.nvim",
    }

    -- AI
    use {
      "zbirenbaum/copilot.lua",
      event = "InsertEnter",
      after = "nvim-cmp",
      config = module "ai/copilot",
      --       {
      --         "jackMort/ChatGPT.nvim",
      --         disable = true,
      --         config = module "ai/chatgpt",
      --         requires = {
      --           "MunifTanjim/nui.nvim",
      --           "nvim-lua/plenary.nvim",
      --           "nvim-telescope/telescope.nvim",
      --         },
      --       },
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
      disable = true,
    }

    -- Language specific
    use {
      -- Markdown
      {
        "lukas-reineke/headlines.nvim",
        config = function()
          require("headlines").setup()
        end,
      },
      -- Dart / Flutter
      {
        "akinsho/flutter-tools.nvim",
        config = module "lang.flutter-tools",
        requires = {
          "hrsh7th/nvim-cmp",
          "neovim/nvim-lspconfig",
          "rcarriga/nvim-notify",
          "nvim-lua/plenary.nvim",
        },
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
        -- ft = { "go", "gomod" },
      },
      {
        "yanskun/gotests.nvim",
        ft = { "go" },
        config = function()
          require("gotests").setup()
        end,
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
        requires = { "neanias/everforest-nvim" },
      },
      {
        "SmiteshP/nvim-navbuddy",
        config = module "lsp.navbuddy",
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
      {
        "andythigpen/nvim-coverage",
        requires = "nvim-lua/plenary.nvim",
        config = function()
          require("coverage").setup()
        end,
      },
    }

    -- Snippets
    use {
      {
        "L3MON4D3/LuaSnip",
        config = module "luasnip",
        event = "InsertEnter",
        requires = "rafamadriz/friendly-snippets",
      },
      {
        "ckolkey/ts-node-action",
        requires = { "nvim-treesitter" },
        config = module "motion.ts-node-action",
      },
    }

    -- UI + Highlighting
    use {
      {
        "folke/noice.nvim",
        config = module "ui.noice",
        requires = {
          "MunifTanjim/nui.nvim",
          "rcarriga/nvim-notify",
        },
      },
      {
        "smjonas/inc-rename.nvim",
        config = function()
          vim.keymap.set("n", "gr", ":IncRename ")
          require("inc_rename").setup()
        end,
      },
      {
        "petertriho/nvim-scrollbar",
        disable = true,
        config = module "ui.scrollbar",
      },
      {
        "stevearc/dressing.nvim",
        config = function()
          require("dressing").setup {
            input = {
              win_options = {
                winblend = 0,
              },
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
        "rlch/everforest-nvim",
        config = module "ui.colorscheme",
      },
      -- {
      --   "rose-pine/neovim",
      --   as = "colorscheme",
      --   config = module "ui.colorscheme",
      -- },
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

      -- Statusline/winbar
      {
        {
          "nvim-lualine/lualine.nvim",
          config = module "ui.statusline",
          after = { "everforest-nvim" },
        },
        {
          "Bekaboo/dropbar.nvim",
          config = module "ui.winbar",
        },
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
      {
        "levouh/tint.nvim",
        config = function()
          require("tint").setup {
            tint = -2,
            saturation = 0.9,
            -- transforms = require("tint").transforms.SATURATE_TINT,
            tint_background_colors = true,
            highlight_ignore_patterns = {
              "WinSeparator",
              "Status.*",
            },
            window_ignore_function = function(winid)
              local bufid = vim.api.nvim_win_get_buf(winid)
              ---@diagnostic disable-next-line: redundant-parameter
              local buftype = vim.api.nvim_buf_get_option(bufid, "buftype")
              local floating = vim.api.nvim_win_get_config(winid).relative ~= ""

              -- Do not tint `terminal` or floating windows, tint everything else
              return buftype == "terminal" or floating
            end,
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
          "nvim-tree/nvim-web-devicons",
          "MunifTanjim/nui.nvim",
          "mrbjarksen/neo-tree-diagnostics.nvim",
          "mrjones2014/legendary.nvim",
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
      "mizlan/iswap.nvim",
      {
        "chrisgrieser/nvim-spider",
        config = function()
          require("spider").setup {
            skipInsignificantPunctuation = true,
          }
          vim.keymap.set(
            { "n", "o", "x" },
            "w",
            "<cmd>lua require('spider').motion('w')<CR>",
            { desc = "Spider-w" }
          )
          vim.keymap.set(
            { "n", "o", "x" },
            "e",
            "<cmd>lua require('spider').motion('e')<CR>",
            { desc = "Spider-e" }
          )
          vim.keymap.set(
            { "n", "o", "x" },
            "b",
            "<cmd>lua require('spider').motion('b')<CR>",
            { desc = "Spider-b" }
          )
          vim.keymap.set(
            { "n", "o", "x" },
            "ge",
            "<cmd>lua require('spider').motion('ge')<CR>",
            { desc = "Spider-ge" }
          )
        end,
      },
      {
        "chrisgrieser/nvim-various-textobjs",
        config = function()
          require("various-textobjs").setup { useDefaultKeymaps = false }
          vim.keymap.set(
            { "o", "x" },
            "aw",
            '<cmd>lua require("various-textobjs").subword(false)<CR>',
            { remap = false }
          )
          vim.keymap.set(
            { "o", "x" },
            "iw",
            '<cmd>lua require("various-textobjs").subword(true)<CR>',
            { remap = false }
          )
          vim.keymap.set({ "o", "x" }, "iW", "iw")
          vim.keymap.set({ "o", "x" }, "aW", "aw")
        end,
      },
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
        requires = {
          "nvim-treesitter/nvim-treesitter",
        },
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
          vim.keymap.set("n", "<leader>rr", function()
            require("spectre").open()
          end)
        end,
      },
      {
        "cshuaimin/ssr.nvim",
        module = "ssr",
        config = function()
          require("ssr").setup {
            keymaps = {
              close = "q",
              next_match = "n",
              prev_match = "N",
              replace_confirm = "<cr>",
              replace_all = "<leader><cr>",
            },
            vim.keymap.set({ "n", "x" }, "<leader>rs", function()
              require("ssr").open()
            end),
          }
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
      "tpope/vim-fugitive",
      {
        "lewis6991/gitsigns.nvim",
        requires = { "nvim-lua/plenary.nvim" },
        config = function()
          vim.wo.signcolumn = "auto:1"
          require("gitsigns").setup {}
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
      {
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

    -- Diagnostics + Utilities
    use {
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
