local fn = vim.fn
local packer = require 'packer'
local use = packer.use

local dev_dir = require 'utils.platform-depend' {
  macos = '~/Coding/Personal/',
  linux = '~/Coding/Personal/',
  windows = nil,
}

local PACKER_COMPILED_PATH = fn.stdpath 'config' .. '/lua/packer_compiled.lua'

if not vim.g.packer_compiled_loaded and vim.loop.fs_stat(PACKER_COMPILED_PATH) then
  require 'impatient'
  require 'packer_compiled'
  vim.g.packer_compiled_loaded = true
end

require('packer').startup {
  function()
    -- Packer
    use {
      'wbthomason/packer.nvim',
      'lewis6991/impatient.nvim',
    }

    -- Common
    use {
      {
        'nvim-lua/plenary.nvim',
        as = 'plenary',
      },
      {
        'nvim-lua/popup.nvim',
        as = 'popup',
      },
      { 'kyazdani42/nvim-web-devicons' },
    }

    -- Fuzzy finder
    use {
      { 'nvim-telescope/telescope-fzf-native.nvim', run = 'make' },
      {
        'nvim-telescope/telescope.nvim',
        requires = {
          'plenary',
          'nvim-telescope/telescope-fzf-native.nvim',
        },
        config = [[require('config.telescope')]],
      },
    }

    -- Treesitter
    use {
      {
        'nvim-treesitter/nvim-treesitter',
        run = ':TSUpdate',
        config = [[require('config.nvim-treesitter')]],
        as = 'nvim-treesitter',
      },
      'nvim-treesitter/playground',
    }

    -- Autocomplete
    use {
      {
        'hrsh7th/nvim-cmp',
        config = [[require('config.nvim-cmp')]],
        requires = {
          'saadparwaiz1/cmp_luasnip',
          'hrsh7th/cmp-nvim-lsp',
          'hrsh7th/cmp-buffer',
          'hrsh7th/cmp-path',
          'hrsh7th/cmp-cmdline',
          'hrsh7th/cmp-nvim-lsp-document-symbol',
          'lukas-reineke/cmp-rg',
          'andersevenrud/cmp-tmux',
          'petertriho/cmp-git',
          'nvim-lspconfig',
          'L3MON4D3/LuaSnip',
          'windwp/nvim-autopairs',
          'onsails/lspkind-nvim',
        },
      },
      {
        'github/copilot.vim',
        config = [[require('config.copilot')]],
        -- event = { 'InsertEnter' },
      },
    }

    -- Dart / Flutter
    use {
      {
        'dart-lang/dart-vim-plugin',
        config = [[require('config.dart-vim-plugin')]],
        after = 'flutter-tools.nvim',
      },
      {
        dev_dir .. 'flutter-tools.nvim',
        config = [[require('config.flutter-tools')]],
        requires = { 'nvim-cmp', 'nvim-lspconfig' },
        -- ft = { 'dart' },
      },
    }

    -- Rust
    use {
      'simrat39/rust-tools.nvim',
      requires = { 'nvim-lspconfig', 'nvim-cmp' },
      wants = {
        'popup',
        'plenary',
        'nvim-telescope/telescope.nvim',
      },
      config = [[require('config.rust-tools')]],
      -- ft = { 'rust', 'rs' },
    }

    -- Lisp
    use {
      {
        'Olical/aniseed',
        config = function()
          vim.cmd [[
            let g:aniseed#env = v:true
          ]]
        end,
        ft = { 'clojure', 'scm', 'scheme', 'hy', 'lisp', 'fennel', 'janet', 'racket' },
      },
      {
        'Olical/conjure',
        config = function()
          vim.cmd [[
            let g:conjure#filetypes = [
            \'clojure',
            \'fennel',
            \'janet',
            \'racket',
            \'scheme',
            \'scm',
            \'hy',
            \'lisp'
            \]
            let g:conjure#client#fennel#aniseed#aniseed_module_prefix = "aniseed."
            let g:conjure#filetype#fennel = "conjure.client.fennel.stdio"
          ]]
        end,
        after = 'aniseed',
        requires = 'bakpakin/fennel.vim'
      },
    }

    -- Go
    use {
      'ray-x/go.nvim',
      config = function()
        require('go').setup()
      end,
      ft = { 'go' },
    }

    -- LSP
    use {
      {
        'neovim/nvim-lspconfig',
        config = [[require('config.lsp-config')]],
        requires = {
          'RRethy/vim-illuminate',
          'jose-elias-alvarez/nvim-lsp-ts-utils',
        },
      },
      'RRethy/vim-illuminate',
      {
        'jose-elias-alvarez/null-ls.nvim',
        config = [[require('config.null-ls')]],
        -- event = { 'BufEnter' },
      },
      {
        'mfussenegger/nvim-dap',
        config = [[require('config.dap')]],
        requires = {
          'rcarriga/nvim-dap-ui',
        },
      },
      {
        'ckipp01/stylua-nvim',
        ft = { 'lua' },
      },
      {
        'folke/trouble.nvim',
        config = [[require('config.trouble')]],
        -- event = 'BufEnter',
      },
      {
        'j-hui/fidget.nvim',
        config = function()
          require('fidget').setup()
        end,
        disable = true,
      },
      {
        'narutoxy/dim.lua',
        requires = { 'nvim-treesitter/nvim-treesitter' },
        after = 'nvim-lspconfig',
        config = function()
          require('dim').setup {}
        end,
      },
    }

    -- Snippets
    use {
      'L3MON4D3/LuaSnip',
      config = [[require('config.luasnip')]],
      -- event = 'InsertCharPre',
      requires = 'rafamadriz/friendly-snippets',
    }

    -- Tests
    use {
      'rcarriga/vim-ultest',
      run = ':UpdateRemotePlugins',
      requires = 'vim-test/vim-test',
    }

    -- UI + Highlighting
    use {
      {
        dev_dir .. 'lsp-fastaction.nvim',
        after = 'nvim-lspconfig',
        config = function()
          require('lsp-fastaction').setup {
            hide_cursor = true,
            action_data = {
              ['dart'] = {
                { pattern = 'import library', key = 'i', order = 1 },
                { pattern = 'wrap with widget', key = 'w', order = 2 },
                { pattern = 'wrap with column', key = 'c', order = 3 },
                { pattern = 'wrap with row', key = 'r', order = 3 },
                { pattern = 'wrap with sizedbox', key = 's', order = 3 },
                { pattern = 'wrap with container', key = 'C', order = 4 },
                { pattern = 'wrap with center', key = 'E', order = 4 },
                { pattern = 'padding', key = 'p', order = 4 },
                { pattern = 'wrap with builder', key = 'b', order = 5 },
                { pattern = 'wrap with streambuilder', key = 'S', order = 5 },
                { pattern = 'remove', key = 'd', order = 5 },

                -- range
                { pattern = "surround with %'if'", key = 'i', order = 2 },
                { pattern = 'try%-catch', key = 't', order = 2 },
                { pattern = 'for%-in', key = 'f', order = 2 },
                { pattern = 'setstate', key = 's', order = 2 },
              },
              ['typescript'] = {
                { pattern = 'to existing import declaration', key = 'a', order = 2 },
                { pattern = 'from module', key = 'i', order = 1 },
              },
            },
          }
        end,
      },
      {
        'stevearc/dressing.nvim',
        config = function()
          require('dressing').setup {
            input = {
              winblend = 0,
            },
          }
        end,
      },
      {
        'kwkarlwang/bufresize.nvim',
        config = function()
          require('bufresize').setup {}
        end,
      },
      {
        'chrisbra/Colorizer',
        -- ft = 'log',
        config = function()
          vim.g.colorizer_auto_filetype = 'log'
          vim.g.colorizer_disable_bufleave = 1
        end,
      },
      {
        'norcalli/nvim-colorizer.lua',
        -- event = 'BufEnter',
        config = function()
          require('colorizer').setup {
            '*',
            '!dart',
          }
        end,
      },
      {
        'sainnhe/everforest',
        as = 'colorscheme',
        config = [[require('config.colorscheme')]],
      },
      {
        'mtdl9/vim-log-highlighting',
        -- ft = 'log',
      },
      {
        'luukvbaal/stabilize.nvim',
        config = function()
          require('stabilize').setup()
        end,
      },
    }

    -- Statusline
    use {
      'nvim-lualine/lualine.nvim',
      config = [[require('config.lualine')]],
      after = 'colorscheme',
      requires = {
        -- 'nvim-lua/lsp-status.nvim',
      },
    }

    -- Markdown
    use {
      {
        'iamcco/markdown-preview.nvim',
        run = 'cd app && npm install',
        setup = function()
          vim.g.mkdp_filetypes = { 'markdown' }
        end,
        -- ft = { 'markdown' },
      },
      use {
        'plasticboy/vim-markdown',
        config = function()
          vim.g.vim_markdown_math = 1
          vim.g.vim_markdown_strikethrough = 1
          vim.g.vim_markdown_new_list_item_indent = 2
        end,
        ft = { 'markdown' },
      },
      {
        'vim-pandoc/vim-pandoc-syntax',
        ft = { 'markdown' },
      },
    }

    -- Traversal & motion
    use {
      {
        'monaqa/dial.nvim',
        config = [[require('config.dial')]],
      },
      'simeji/winresizer',
      {
        'bkad/CamelCaseMotion',
        config = [[require('config.camelcasemotion')]],
      },
      'tpope/vim-surround',
      'tpope/vim-repeat',
      -- {
      --   'abecodes/tabout.nvim',
      --   disable = true,
      --   config = function()
      --     require('tabout').setup {
      --       tabkey = '',
      --       backwards_tabkey = '',
      --       -- act_as_tab = true,
      --       -- act_as_shift_tab = true,
      --       completion = true,
      --       -- ignore_beginning = true,
      --       tabouts = {
      --         { open = "'", close = "'" },
      --         { open = '"', close = '"' },
      --         { open = '`', close = '`' },
      --         { open = '(', close = ')' },
      --         { open = '[', close = ']' },
      --         { open = '{', close = '}' },
      --       },
      --     }
      --   end,
      --   wants = { 'nvim-treesitter' },
      --   after = { 'nvim-cmp' },
      -- },
      {
        'windwp/nvim-autopairs',
        config = [[require('config.npairs')]],
        after = 'nvim-cmp',
      },
      {
        'folke/todo-comments.nvim',
        after = 'colorscheme',
      },
      {
        'numToStr/Comment.nvim',
        config = function()
          require('Comment').setup()
        end,
        event = 'InsertEnter',
      },
      {
        'tpope/vim-abolish',
      },
      {
        'rlane/pounce.nvim',
        config = function()
          require('pounce').setup {
            accept_keys = 'JFKDLSAHGNUVRBYTMICEOXWPQZ',
            accept_best_key = '<enter>',
            multi_window = true,
            debug = false,
          }
        end,
        event = 'BufEnter',
      },
    }

    -- Diagnostics & utilities
    use {
      {
        'dstein64/vim-startuptime',
        cmd = 'StartupTime',
        config = [[require('config.startuptime')]],
      },
      {
        'akinsho/toggleterm.nvim',
        config = [[require('config.toggleterm')]],
        disable = true,
        -- event = 'BufEnter',
      },
    }

    -- Project management
    use {
      -- {
      --   dev_dir .. 'neo-tree.nvim',
      --   branch = 'v2.x',
      --   requires = {
      --     'nvim-lua/plenary.nvim',
      --     'kyazdani42/nvim-web-devicons', -- not strictly required, but recommended
      --     'MunifTanjim/nui.nvim',
      --   },
      --   config = [[require('config.neotree')]],
      -- },
      {
        'kyazdani42/nvim-tree.lua',
        config = [[require('config.nvim-tree')]],
      },
      {
        'ahmedkhalf/project.nvim',
        config = [[require('config.project')]],
        requires = {
          'nvim-telescope/telescope.nvim',
        },
      },
      {
        'radenling/vim-dispatch-neovim',
        requires = 'tpope/vim-dispatch',
      },
      {
        'gioele/vim-autoswap',
        config = function()
          vim.g.autoswap_detect_tmux = 1
        end,
      },
    }

    -- Git
    use {
      {
        'lewis6991/gitsigns.nvim',
        requires = { 'plenary' },
        config = function()
          vim.wo.signcolumn = 'auto:1'
          require('gitsigns').setup()
        end,
        -- event = 'BufEnter',
      },
      {
        'tpope/vim-fugitive',
      },
      {
        'TimUntersberger/neogit',
        requires = {
          'sindrets/diffview.nvim',
          'nvim-lua/plenary.nvim',
        },
        config = [[require('config.neogit')]],
        -- event = 'BufEnter', disable = true,
      },
      use {
        'akinsho/git-conflict.nvim',
        config = function()
          vim.cmd[[
          highlight ConflictMarkerOurs guibg=#2e5049
          highlight ConflictMarkerTheirs guibg=#344f69
          ]]
          require('git-conflict').setup {
            disable_diagnostics = true,
            highlights = {
              current = 'ConflictMarkerOurs',
              incoming = 'ConflictMarkerTheirs',
            },
          }
        end,
        event = 'BufEnter',
      },
    }
    -- Configuration
    use {
      {
        'folke/which-key.nvim',
      },
      {
        'LionC/nest.nvim',
        config = function()
          require 'keymaps'
        end,
      },
    }

    -- Miscellaneous
    use {
      {
        'windwp/nvim-spectre',
        config = function()
          require('spectre').setup {}
        end,
      },
      {
        'AckslD/nvim-neoclip.lua',
        config = function()
          require('neoclip').setup()
          require('telescope').load_extension 'neoclip'
        end,
      },
    }

    -- Dev
    use {
      dev_dir .. 'github-notifications.nvim',
      config = [[require('config.github-notifications')]],
      requires = {
        'plenary',
        'nvim-lualine/lualine.nvim',
        'nvim-telescope/telescope.nvim',
        'rcarriga/nvim-notify',
      },
    }
  end,
  log = { level = 'info' },
  config = {
    compile_path = PACKER_COMPILED_PATH,
    profile = {
      enable = true,
      threshold = 1,
    },
  },
}
