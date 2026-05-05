return {
  {
    "neovim/nvim-lspconfig",
    init = function()
      local map = vim.keymap.set
      map({ "n", "v" }, "<leader>lf", function()
        LazyVim.format({ force = true })
      end, { desc = "Format" })
      -- :LspInfo / :LspRestart are deprecated in 0.12 → :checkhealth lsp / :lsp restart
      map("n", "<leader>lr", "<cmd>LspRestart<cr>", { desc = "Restart LSP" })
      map("n", "<leader>li", "<cmd>checkhealth lsp<cr>", { desc = "LSP Info" })
      map("n", "<leader>cl", vim.lsp.codelens.run, { desc = "Codelens" })
      map("n", "<leader>dj", "[d", { remap = true })
      map("n", "<leader>dk", "]d", { remap = true })
    end,
    opts = {
      inlay_hints = { enabled = true },
      servers = {
        ["*"] = {
          keys = {
            -- Disable default keymaps
            { "<leader>cr", false },
            { "<leader>cl", false },
            -- Add custom rename keymap
            {
              "<leader>cr",
              function()
                local inc_rename = require("inc_rename")
                return ":" .. inc_rename.config.cmd_name .. " "
              end,
              expr = true,
              desc = "Rename (inc-rename.nvim)",
              has = "rename",
            },
          },
        },
      },
    },
    keys = {
      { "<leader>dj", "]d" },
      { "<leader>dk", "[d" },
    },
  },

  -- DAP
  {
    "rcarriga/nvim-dap-ui",
    config = function(_, opts)
      local dap = require("dap")
      local dapui = require("dapui")
      dapui.setup(opts)
      dap.listeners.after.event_initialized["dapui_config"] = function() end
      dap.listeners.before.event_terminated["dapui_config"] = function() end
      dap.listeners.before.event_exited["dapui_config"] = function() end
    end,
  },
  {
    "leoluz/nvim-dap-go",
    opts = {
      delve = {
        args = {
          "--check-go-version=false",
        },
      },
    },
  },
}
