return {
  {
    "yetone/avante.nvim",
    event = "VeryLazy",
    enabled = false,
    lazy = false,
    version = false, -- set this if you want to always pull the latest change
    keys = {},
    opts = {
      provider = "openai",
      auto_suggestions_provider = "copilot",
      openai = {
        endpoint = "https://api.openai.com/v1",
        model = "gpt-4o",
        timeout = 30000,
        temperature = 0,
        max_tokens = 4096,
      },
      mappings = {
        --- @class AvanteConflictMappings
        diff = {
          ours = "co",
          theirs = "ct",
          all_theirs = "ca",
          both = "cb",
          cursor = "cc",
          next = "]x",
          prev = "[x",
        },
        suggestion = {
          accept = "<M-l>",
          next = "<M-]>",
          prev = "<M-[>",
          dismiss = "<C-]>",
        },
        jump = {
          next = "]]",
          prev = "[[",
        },
        submit = {
          normal = "<C-CR>",
          insert = "<C-CR>",
        },
        sidebar = {
          apply_all = "A",
          apply_cursor = "a",
          switch_windows = "<Tab>",
          reverse_switch_windows = "<S-Tab>",
        },
      },
      hints = { enabled = false },
    },
    build = "make",
    dependencies = {
      "stevearc/dressing.nvim",
      "nvim-lua/plenary.nvim",
      "MunifTanjim/nui.nvim",
      "nvim-tree/nvim-web-devicons",
      "zbirenbaum/copilot.lua",
      {
        "HakonHarnes/img-clip.nvim",
        event = "VeryLazy",
        opts = {
          default = {
            embed_image_as_base64 = false,
            prompt_for_file_name = false,
            drag_and_drop = {
              insert_mode = true,
            },
          },
        },
      },
    },
  },
  {
    "olimorris/codecompanion.nvim",
    config = true,
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
      "folke/noice.nvim",
      "ravitemer/mcphub.nvim",
      { "echasnovski/mini.diff", opts = {} },
    },
    init = function()
      require("plugins.extensions.companion-notification").init()
    end,
    opts = {
      display = {
        chat = { start_in_insert_mode = true },
        diff = {
          provider = "mini_diff",
        },
        action_palette = {},
      },
      strategies = {
        chat = {
          adapter = "openai",
          keymaps = {
            send = {
              modes = {
                n = "<C-CR>",
                i = "<C-CR>",
              },
            },
            close = {
              modes = {
                n = { "q", "<C-c>" },
                i = "<C-c>",
              },
            },
          },
          slash_commands = {
            ["file"] = {
              opts = { provider = "fzf_lua" },
            },
            ["buffer"] = {
              opts = { provider = "fzf_lua" },
            },
            ["symbols"] = {
              opts = { provider = "fzf_lua" },
            },
            ["help"] = {
              opts = { provider = "fzf_lua" },
            },
          },
          tools = {
            ["mcp"] = {
              -- calling it in a function would prevent mcphub from being loaded before it's needed
              callback = function()
                return require("mcphub.extensions.codecompanion")
              end,
              description = "Call tools and resources from the MCP Servers",
              opts = {
                requires_approval = true,
              },
            },
          },
        },
        inline = { adapter = "openai" },
      },
    },
    keys = {
      {
        "<leader>ap",
        "<cmd>CodeCompanionActions<CR>",
        mode = { "n", "v" },
        desc = "Open AI Actions",
      },
      {
        "<leader>aa",

        "<cmd>CodeCompanionChat<CR>",
        mode = { "n", "v" },
        desc = "Open Chat",
      },
      {
        "<leader>ae",
        "<cmd>CodeCompanion<CR>",
        mode = { "n", "v" },
        desc = "Open Inline Assistant",
      },
      {
        "<leader>at",
        "<cmd>CodeCompanionChat Toggle<CR>",
        mode = { "n", "v" },
        desc = "Toggle Chat",
      },
      {
        "ga",
        "<cmd>CodeCompanionChat Add<CR>",
        mode = { "v" },
      },
    },
  },
  {
    "ravitemer/mcphub.nvim",
    dependencies = {
      "nvim-lua/plenary.nvim", -- Required for Job and HTTP requests
    },
    cmd = "MCPHub", -- lazily start the hub when `MCPHub` is called
    build = "npm install -g mcp-hub@latest", -- Installs required mcp-hub npm module
    keys = {
      {
        "<leader>am",
        "<cmd>MCPHub<CR>",
        mode = { "n" },
        desc = "Open MCPHub",
      },
    },
    config = function()
      require("mcphub").setup({
        -- Required options
        port = 3333, -- Port for MCP Hub server
        config = vim.fn.expand("~/mcpservers.json"), -- Absolute path to config file

        -- Optional options
        on_ready = function(_)
          -- Called when hub is ready
        end,
        on_error = function(err)
          -- Called on errors
          -- vim.notify(err, vim.log.levels.ERROR)
        end,
        shutdown_delay = 0, -- Wait 0ms before shutting down server after last client exits
        log = {
          level = vim.log.levels.WARN,
          to_file = false,
          file_path = nil,
          prefix = "MCPHub",
        },
      })
    end,
  },
  {
    "Davidyz/VectorCode",
    version = "*", -- optional, depending on whether you're on nightly or release
    build = "pipx upgrade vectorcode", -- optional but recommended if you set `version = "*"`
    dependencies = { "nvim-lua/plenary.nvim" },
    event = "VeryLazy",
    enabled = false,
    opts = {
      async_opts = {
        debounce = 10,
        events = { "BufWritePost", "InsertEnter", "BufReadPost" },
        exclude_this = true,
        n_query = 1,
        notify = false,
        run_on_register = false,
      },
      async_backend = "lsp",
      exclude_this = true,
      n_query = 1,
      notify = true,
      timeout_ms = 5000,
      on_setup = { update = true },
    },
    config = function(_, opts)
      require("vectorcode").setup(opts)
      local cacher = require("vectorcode.config").get_cacher_backend()
      vim.api.nvim_create_autocmd("LspAttach", {
        callback = function()
          local bufnr = vim.api.nvim_get_current_buf()
          cacher.async_check("config", function()
            cacher.register_buffer(bufnr, {
              n_query = 10,
            })
          end, nil)
        end,
        desc = "Register buffer for VectorCode",
      })
    end,
  },
  {
    "zbirenbaum/copilot.lua",
    opts = {
      suggestion = {
        enabled = true,
        auto_trigger = true,
        debounce = 75,
        keymap = {
          accept = "<C-l>",
          accept_word = false,
          accept_line = false,
          next = "<M-]>",
          prev = "<M-[>",
          dismiss = "<C-]>",
        },
      },
      panel = { enabled = false },
      filetypes = {
        TelescopePrompt = false,
        ["neo-tree"] = false,
        help = false,
        gitcommit = true,
        gitrebase = true,
      },
    },
  },
}
