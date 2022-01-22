local parser_configs = require('nvim-treesitter.parsers').get_parser_configs()

--[[ parser_configs.norg = {
  install_info = {
    url = 'https://github.com/nvim-neorg/tree-sitter-norg',
    files = { 'src/parser.c', 'src/scanner.cc' },
    branch = 'main',
  },
} ]]

require('nvim-treesitter.configs').setup {
  ensure_installed = { "lua", "dart", "javascript", "typescript", "rust" },
  playground = {
    enable = true,
    disable = {},
    updatetime = 25,
    persist_queries = false, -- Whether the query persists across vim sessions
    keybindings = {
      toggle_query_editor = 'o',
      toggle_hl_groups = 'i',
      toggle_injected_languages = 't',
      toggle_anonymous_nodes = 'a',
      toggle_language_display = 'I',
      focus_language = 'f',
      unfocus_language = 'F',
      update = 'R',
      goto_node = '<cr>',
      show_help = '?',
    },
  },
  highlight = { enable = true },
}
