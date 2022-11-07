require("neogen").setup {
  enabled = true,
  snippet_engine = "luasnip",
  input_after_comment = true,
  languages = {
    lua = {
      template = {
        annotation_convention = "emmylua",
      },
    },
    rust = {
      template = {
        annotation_convention = "rustdoc",
      },
    },
    typescript = {
      template = {
        annotation_convention = "tsdoc",
      },
    },
    python = {
      template = {
        annotation_convention = "google_docstrings",
      },
    },
    go = {
      template = {
        annotation_convention = "godoc",
      },
    },
  },
}

local wk = require "which-key"
wk.register({
  name = "Docs",
  i = { "<cmd>Neogen<cr>", "Infer" },
  c = { "<cmd>Neogen class<cr>", "Class" },
  t = { "<cmd>Neogen type<cr>", "Type" },
  f = { "<cmd>Neogen func<cr>", "Function" },
  p = { "<cmd>Neogen file<cr>", "Package" },
}, { prefix = "<leader>c" })
