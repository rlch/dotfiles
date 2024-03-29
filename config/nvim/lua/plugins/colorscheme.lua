return {
  {
    "catppuccin/nvim",
    priority = 1000,
    lazy = false,
    opts = {
      background = { -- :h background
        light = "latte",
        dark = "macchiato",
      },
      integrations = {
        dropbar = { enable = true },
        headlines = true,
        neotree = true,
        noice = true,
        notify = true,
        treesitter_context = true,
        octo = true,
        which_key = true,
      },
    },
    config = function(_, opts)
      require("catppuccin").setup(opts)
      vim.cmd.colorscheme("catppuccin")
    end,
  },
  {
    "neanias/everforest-nvim",
    enable = false,
    -- priority = 1000,
    opts = {
      background = "dark",
      transparent_background_level = 0,
      italics = true,
      disable_italic_comments = false,
    },
    config = function(_, opts)
      local everforest = require("everforest")
      everforest.setup(opts)
      everforest.load()
    end,
  },
}
