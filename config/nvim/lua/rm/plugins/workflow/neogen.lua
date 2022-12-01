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

keymap({
  name = "Docs",
  i = { "", "Infer" },
  c = { "class", "Class" },
  t = { "type", "Type" },
  f = { "func", "Function" },
  p = { "file", "Package" },
}, { prefix = "<leader>c", mapping_prefix = "Neogen ", cmd = true })
