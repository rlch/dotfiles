return {
  {
    "catppuccin/nvim",
    priority = 1000,
    lazy = false,
    ---@module 'catppuccin.types'
    ---@type CatppuccinOptions
    opts = {
      float = {
        transparent = false,
        solid = true,
      },
      background = { -- :h background
        light = "latte",
        dark = "mocha",
      },
      default_integrations = true,
      auto_integrations = true,
      dim_inactive = {
        enabled = true,
        shade = "dark",
        percentage = 0.10,
      },
      -- integrations = {
      --   dropbar = { enabled = true },
      --   headlines = true,
      --   neotree = true,
      --   noice = true,
      --   notify = true,
      --   treesitter_context = true,
      --   octo = true,
      --   which_key = true,
      --   fzf = true,
      --   native_lsp = {
      --     enabled = true,
      --     inlay_hints = {
      --       background = false,
      --     },
      --   },
      -- },
      lsp_styles = {
        enabled = true,
        inlay_hints = {
          background = false,
        },
        virtual_text = {
          errors = { "italic" },
          hints = { "italic" },
          warnings = { "italic" },
          information = { "italic" },
          ok = { "italic" },
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
          GitConflictCurrent = { bg = "#1a3d1a" }, -- Subtle green fr current changes
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
      -- Clear LSP semantic token for strings in Go to allow treesitter injections (e.g., Cypher) to highlight
      vim.api.nvim_set_hl(0, "@lsp.type.string.go", {})
    end,
  },
}
