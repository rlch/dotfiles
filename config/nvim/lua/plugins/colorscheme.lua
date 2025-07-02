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
          LspReferenceText = { bg = colors.none },
          -- Minimal diff colors for clean diffthis experience
          DiffAdd = { bg = "#1a3d1a" }, -- Subtle green for added lines
          DiffChange = { bg = "#1a2633" }, -- Subtle blue for changed lines
          DiffDelete = { bg = "#3d1a1a", fg = "#cc7a7a" }, -- Subtle red for deleted lines
          DiffText = { bg = "#2a3f5f", fg = "#e6e6e6" }, -- Muted highlight for changed text
          -- Minimal git conflict highlighting
          GitConflictCurrent = { bg = "#1a3d1a" }, -- Subtle green for current changes
          GitConflictIncoming = { bg = "#1a2633" }, -- Subtle blue for incoming changes
          -- Comment = { fg = colors.flamingo },
          -- TabLineSel = { bg = colors.pink },
          -- CmpBorder = { fg = colors.surface2 },
          -- Pmenu = { bg = colors.none },
          Folded = { bg = colors.none },
        }
      end,
    },
    config = function(_, opts)
      require("catppuccin").setup(opts)
      vim.cmd.colorscheme("catppuccin")
    end,
  },
}
