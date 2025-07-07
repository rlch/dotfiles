return {
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
    "zbirenbaum/copilot.lua",
    opts = {
      suggestion = {
        enabled = true,
        auto_trigger = true,
        debounce = 75,
        keymap = {
          accept = "<C-f>",
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
  {
    "rlch/claudecode.nvim",
    dependencies = { "folke/snacks.nvim" },
    config = true,
    event = "VeryLazy",
    keys = {
      { "<leader>ab", "<cmd>ClaudeCodeAdd %<cr>", desc = "Add current buffer" },
      { "<leader>a", "<cmd>ClaudeCodeSend<cr>", mode = "v", desc = "Send to Claude" },
      {
        "<leader>a",
        "<cmd>ClaudeCodeTreeAdd<cr>",
        desc = "Add file",
        ft = { "neo-tree" },
      },
      -- Diff management
      -- { "<leader>aa", "<cmd>ClaudeCodeDiffAccept<cr>", desc = "Accept diff" },
      -- { "<leader>ad", "<cmd>ClaudeCodeDiffDeny<cr>", desc = "Deny diff" },
    },
  },
}
