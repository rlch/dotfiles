local fn = vim.fn

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

-- require 'impatient'

require('packer').startup {
  function(use)
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
      dev_dir .. 'telescope.nvim',
      requires = 'plenary',
      config = [[require('config.telescope')]],
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
      {
        'lewis6991/spellsitter.nvim',
        config = function()
          require('spellsitter').setup()
        end,
        disable = true,
      },
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
          'andersevenrud/cmp-tmux',
          'petertriho/cmp-git',
          'neovim/nvim-lspconfig',
          'L3MON4D3/LuaSnip',
          'windwp/nvim-autopairs',
          'onsails/lspkind-nvim',
        },
        as = 'cmp',
      },
      {
        'github/copilot.vim',
        config = [[require('config.copilot')]],
      },
    }

    -- Dart / Flutter
    use {
      {
        'rlch/dart-vim-plugin',
        config = [[require('config.dart-vim-plugin')]],
      },
      {
        dev_dir .. 'flutter-tools.nvim',
        config = [[require('config.flutter-tools')]],
        requires = 'cmp',
      },
      {
        'akinsho/dependency-assist.nvim',
        config = function()
          require('dependency_assist').setup {}
        end,
        disable = true,
      },
    }

    -- Rust
    use {
      'simrat39/rust-tools.nvim',
      requires = 'neovim/nvim-lspconfig',
      wants = {
        'popup',
        'plenary',
        'nvim-telescope/telescope.nvim',
      },
      config = [[require('config.rust-tools')]],
    }

    -- Go
    use {
      'ray-x/go.nvim',
      config = function()
        require('go').setup()
      end,
    }

    -- LSP
    use {
      {
        'neovim/nvim-lspconfig',
        config = [[require('config.lsp-config')]],
        --[[ requires = {
          'nvim-lua/lsp-status.nvim',
        }, ]]
      },
      {
        'jose-elias-alvarez/null-ls.nvim',
        config = [[require('config.null-ls')]],
      },
      {
        'ray-x/lsp_signature.nvim',
        disable = true,
      },
      'rcarriga/nvim-dap-ui',
      {
        'mfussenegger/nvim-dap',
        config = [[require('config.dap')]],
      },
      {
        'filipdutescu/renamer.nvim',
        branch = 'master',
        requires = 'plenary',
        config = [[require('config.renamer')]],
      },
      'ckipp01/stylua-nvim',
      {
        'folke/trouble.nvim',
        config = [[require('config.trouble')]],
      },
      use {
        'michaelb/sniprun',
        run = 'bash ./install.sh',
      },
      use {
        'j-hui/fidget.nvim',
        config = function()
          require('fidget').setup()
        end,
        disable = true,
      },
    }

    -- Snippets
    use {
      'L3MON4D3/LuaSnip',
      config = [[require('config.luasnip')]],
      requires = dev_dir .. 'friendly-snippets',
    }

    -- Tests
    use {
      'vim-test/vim-test',
      { 'rcarriga/vim-ultest', run = ':UpdateRemotePlugins' },
    }

    -- UI + Highlighting
    use {
      dev_dir .. 'lsp-fastaction.nvim',
      {
        'tami5/lspsaga.nvim',
        as = 'lspsaga',
        config = [[require('config.lspsaga')]],
      },
      {
        'kwkarlwang/bufresize.nvim',
        config = function()
          require('bufresize').setup()
        end,
      },
      {
        'norcalli/nvim-colorizer.lua',
        config = function()
          require('colorizer').setup()
        end,
      },
      -- {
      --   'sainnhe/gruvbox-material',
      --   as = 'colorscheme',
      --   config = [[require('config.colorscheme')]],
      --   disable = true,
      -- },
      {
        'sainnhe/everforest',
        as = 'colorscheme',
        config = [[require('config.colorscheme')]],
      },
      'mtdl9/vim-log-highlighting',
      {
        'luukvbaal/stabilize.nvim',
        config = function()
          require('stabilize').setup()
        end,
      },
      'rcarriga/nvim-notify',
      'MunifTanjim/nui.nvim',
    }

    -- Statusline
    use {
      'nvim-lualine/lualine.nvim',
      config = [[require('config.lualine')]],
      after = 'colorscheme',
    }

    -- Markdown
    use {
      'godlygeek/tabular',
      {
        'iamcco/markdown-preview.nvim',
        run = 'cd app && npm install',
        setup = function()
          vim.g.mkdp_filetypes = { 'markdown' }
        end,
        ft = { 'markdown' },
      },
      use {
        'plasticboy/vim-markdown',
        config = function()
          vim.g.vim_markdown_math = 1
          vim.g.vim_markdown_strikethrough = 1
          vim.g.vim_markdown_new_list_item_indent = 2
        end,
      },
      'vim-pandoc/vim-pandoc',
      'vim-pandoc/vim-pandoc-syntax',
    }

    -- Traversal & motion
    use {
      'simeji/winresizer',
      {
        'bkad/CamelCaseMotion',
        config = [[require('config.camelcasemotion')]],
      },
      'tpope/vim-surround',
      {
        'abecodes/tabout.nvim',
        config = function()
          require('tabout').setup {
            tabkey = '<Tab>',
            backwards_tabkey = '<S-Tab>',
            act_as_tab = true,
            act_as_shift_tab = true,
            completion = false,
            ignore_beginning = true,
            tabouts = {
              { open = "'", close = "'" },
              { open = '"', close = '"' },
              { open = '`', close = '`' },
              { open = '(', close = ')' },
              { open = '[', close = ']' },
              { open = '{', close = '}' },
            },
          }
        end,
        wants = { 'nvim-treesitter' },
        after = { 'cmp' },
      },
      {
        'akinsho/bufferline.nvim',
        requires = {
          'kyazdani42/nvim-web-devicons',
          'famiu/bufdelete.nvim',
        },
        config = [[require('config.bufferline')]],
        disable = true,
      },
      {
        'windwp/nvim-autopairs',
        config = [[require('config.npairs')]],
      },
      {
        'numToStr/Comment.nvim',
        config = function()
          require('Comment').setup()
        end,
      },
      'tpope/vim-abolish',
    }

    -- Diagnostics & utilities
    use {
      'dstein64/vim-startuptime',
      cmd = 'StartupTime',
      config = [[require('config.startuptime')]],
    }

    -- Project management
    use {
      {
        'nvim-neo-tree/neo-tree.nvim',
        branch = 'v1.x',
        requires = {
          'nvim-lua/plenary.nvim',
          'kyazdani42/nvim-web-devicons', -- not strictly required, but recommended
          'MunifTanjim/nui.nvim',
        },
        config = [[require('config.neotree')]],
        disable = true,
      },
      {
        'kyazdani42/nvim-tree.lua',
        requires = 'kyazdani42/nvim-web-devicons',
        config = [[require('config.nvim-tree')]],
      },
      {
        'rmagatti/auto-session',
        config = function()
          require('auto-session').setup {
            auto_session_root_dir = ('%s/session/auto/'):format(vim.fn.stdpath 'data'),
          }
        end,
        disable = true,
      },
      {
        'nvim-neorg/neorg',
        config = [[require('config.neorg')]],
        requires = 'plenary',
        after = 'nvim-treesitter',
        branch = 'main',
        disable = true,
      },
      {
        dev_dir .. 'project.nvim',
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
        config = [[require('config.autoswap')]],
      },
    }

    -- Git
    use {
      {
        'lewis6991/gitsigns.nvim',
        requires = { 'plenary' },
        config = [[require('config.gitsigns')]],
        disable = true,
      },
      {
        'sindrets/diffview.nvim',
        requires = 'plenary',
        config = [[require('config.diffview')]],
        disable = true,
      },
      { 'tpope/vim-fugitive' },
    }
    -- Configuration
    use {
      'folke/which-key.nvim',
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
