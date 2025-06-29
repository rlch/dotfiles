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
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
      "folke/noice.nvim",
      "rlch/mcphub.nvim",
      "echasnovski/mini.diff",
    },
    init = function()
      require("plugins.extensions.companion-notification").init()
    end,
    config = true,
    opts = {
      extensions = {
        mcphub = {
          callback = "mcphub.extensions.codecompanion",
          opts = {
            make_vars = true,
            make_slash_commands = true,
            show_result_in_chat = true,
            show_raw_result = true,
          },
        },
      },
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
        },
        inline = { adapter = "copilot" },
      },
      ---This is the default prompt which is sent with every request in the chat
      ---strategy. It is primarily based on the GitHub Copilot Chat's prompt
      ---but with some modifications. You can choose to remove this via
      ---your own config but note that LLM results may not be as good
      ---@param opts table
      ---@return string
      system_prompt = function(opts)
        local language = opts.language or "English"
        return string.format(
          [[You are an AI programming assistant named "CodeCompanion". You are currently plugged into the Neovim text editor on a user's machine.

Your core tasks include:
- Answering general programming questions.
- Explaining how the code in a Neovim buffer works.
- Reviewing the selected code from a Neovim buffer.
- Generating unit tests for the selected code.
- Proposing fixes for problems in the selected code.
- Scaffolding code for a new workspace.
- Finding relevant code to the user's query.
- Proposing fixes for test failures.
- Answering questions about Neovim.
- Running tools.

You must:
- Follow the user's requirements carefully and to the letter.
- Keep your answers short and impersonal, especially if the user's context is outside your core tasks.
- Minimize additional prose unless clarification is needed.
- Use Markdown formatting in your answers.
- Include the programming language name at the start of each Markdown code block.
- Avoid including line numbers in code blocks.
- Avoid wrapping the whole response in triple backticks.
- Only return code that's directly relevant to the task at hand. You may omit code that isn’t necessary for the solution.
- Avoid using H1, H2 or H3 headers in your responses as these are reserved for the user.
- Use actual line breaks in your responses; only use "\n" when you want a literal backslash followed by 'n'.
- All non-code text responses must be written in the %s language indicated.
- Multiple, different tools can be called as part of the same response.

When given a task:
1. Think step-by-step and, unless the user requests otherwise or the task is very simple, describe your plan in detailed pseudocode.
2. Output the final code in a single code block, ensuring that only relevant code is included.
3. End your response with a short suggestion for the next user turn that directly supports continuing the conversation.
4. Provide exactly one complete reply per conversation turn.
5. If necessary, execute multiple tools in a single turn.]],
          language
        )
      end,
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
      {
        "<localleader>b",
        "a#buffer <Esc>",
        desc = "Add #buffer to chat",
      },
      {
        "<localleader>v",
        "a#viewport <Esc>",
        desc = "Add #viewport to chat",
      },
      {
        "<localleader>l",
        "a#lsp <Esc>",
        desc = "Add #lsp to chat",
      },
      {
        "<localleader>e",
        "a@editor <Esc>",
        desc = "Add @editor to chat",
      },
      {
        "<localleader>m",
        "a@mcp <Esc>",
        desc = "Add @mcp to chat",
      },
      {
        "<localleader>c",
        "a@cmd_runner <Esc>",
        desc = "Add @cmd_runner to chat",
      },
      {
        "<localleader>f",
        "a@files <Esc>",
        desc = "Add @files to chat",
      },
    },
  },
  {
    "rlch/mcphub.nvim",
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
    opts = {
      -- Required options
      port = 3333, -- Port for MCP Hub server
      config = vim.fn.expand("~/mcpservers.json"), -- Absolute path to config file

      -- Optional options
      on_ready = function(_)
        -- Called when hub is ready
      end,
      on_error = function(_)
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
    },
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
          accept = "<Tab>",
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
