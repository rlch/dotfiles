return {
  {
    {
      "rafcamlet/nvim-luapad",
      cmd = { "Luapad" },
      ft = "lua",
      opts = { eval_on_change = false },
      keys = {},
      config = function(_, opts)
        require("which-key").add({
          { "<localleader>p", "<cmd>Luapad<cr>", desc = "Luapad" },
          { "<localleader>r", "<cmd>LuaRun<cr>", desc = "LuaRun" },
          { "<localleader>w", "<cmd>echo win_getid()<cr>", desc = "win_getid" },
        })
        require("luapad").setup(opts)
      end,
    },
    {
      "DestopLine/scratch-runner.nvim",
      event = "VeryLazy",
      dependencies = "folke/snacks.nvim",
      opts = {
        sources = {
          go = function(file_path)
            return { "go", "run", file_path }
          end,
        },
      },
    },
  },
  {
    "andrewferrier/debugprint.nvim",
    dependencies = {
      "nvim-mini/mini.nvim",
    },
    lazy = false,
    version = "*",
    opts = {
      keymaps = {
        normal = {
          plain_below = "g?p",
          plain_above = "g?P",
          variable_below = "g?v",
          variable_above = "g?V",
          variable_below_alwaysprompt = "",
          variable_above_alwaysprompt = "",
          surround_plain = "g?sp",
          surround_variable = "g?sv",
          surround_variable_alwaysprompt = "",
          textobj_below = "g?o",
          textobj_above = "g?O",
          textobj_surround = "g?so",
          toggle_comment_debug_prints = "g?c",
          delete_debug_prints = "g?d",
        },
        insert = {
          plain = "<C-G>p",
          variable = "<C-G>v",
        },
        visual = {
          variable_below = "g?v",
          variable_above = "g?V",
        },
      },
      commands = {
        toggle_comment_debug_prints = "ToggleCommentDebugPrints",
        delete_debug_prints = "DeleteDebugPrints",
        reset_debug_prints_counter = "ResetDebugPrintsCounter",
      },
    },
  },
}
