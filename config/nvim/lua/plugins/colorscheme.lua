return {
  {
    "catppuccin/nvim",
    priority = 1000,
    lazy = false,
    ---@module 'catppuccin.types'
    ---@type CatppuccinOptions
    opts = {
      background = { -- :h background
        light = "latte",
        dark = "mocha",
      },
      integrations = {
        dropbar = { enabled = true },
        headlines = true,
        neotree = true,
        noice = true,
        notify = true,
        treesitter_context = true,
        octo = true,
        which_key = true,
        fzf = true,
        native_lsp = {
          enabled = true,
          inlay_hints = {
            background = false,
          },
        },
      },
      custom_highlights = function(colors)
        return {
          -- Comment = { fg = colors.flamingo },
          -- TabLineSel = { bg = colors.pink },
          -- CmpBorder = { fg = colors.surface2 },
          -- Pmenu = { bg = colors.none },
        }
      end,
    },
    config = function(_, opts)
      require("catppuccin").setup(opts)
      vim.cmd.colorscheme("catppuccin")
    end,
  },
}
