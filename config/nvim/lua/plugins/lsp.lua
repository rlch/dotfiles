return {
  {
    "neovim/nvim-lspconfig",
    init = function()
      local keys = require("lazyvim.plugins.lsp.keymaps").get()
      -- disable a keymap
      keys[#keys + 1] = { "<leader>cr", false }
      keys[#keys + 1] = { "<leader>cl", false }

      local map = vim.keymap.set
      local Util = require("lazyvim.util")
      map({ "n", "v" }, "<leader>lf", function()
        Util.format({ force = true })
      end, { desc = "Format" })
      map("n", "<leader>lr", "<cmd>LspRestart<cr>", { desc = "Restart LSP" })
      map("n", "<leader>li", "<cmd>LspInfo<cr>", { desc = "LSP Info" })
      map("n", "<leader>cl", vim.lsp.codelens.run, { desc = "Codelens" })
    end,
    opts = {
      inlay_hints = { enabled = true },
    },
  },
  {
    "smjonas/inc-rename.nvim",
    cmd = "IncRename",
    config = true,
    keys = {
      {
        "<leader>cr",
        function()
          local inc_rename = require("inc_rename")
          return ":" .. inc_rename.config.cmd_name .. " "
        end,
        expr = true,
        mode = "n",
        desc = "Rename",
      },
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
}
