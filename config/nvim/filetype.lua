vim.filetype.add({
  extension = {
    waku = "waku",
    gotmpl = "gotmpl",
    vars = "vars",
    query = "query",
  },
  pattern = {
    [".*%.taskmaster/docs/.*%.txt"] = "md",
    ["Dockerfile.*"] = function()
      return "dockerfile"
    end,
  },
})

-- Register cypher parser from https://github.com/taekwombo/tree-sitter-cypher
-- Install with: cd /tmp && git clone https://github.com/taekwombo/tree-sitter-cypher && cd tree-sitter-cypher && cc -o ~/.local/share/nvim/site/parser/cypher.so -shared -fPIC -O2 src/parser.c -I src
vim.filetype.add({ extension = { cypher = "cypher" } })
vim.treesitter.language.register("cypher", "cypher")
