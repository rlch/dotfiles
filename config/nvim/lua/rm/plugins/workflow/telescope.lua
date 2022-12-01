local telescope = require "telescope"

local default = {
  defaults = {
    vimgrep_arguments = {
      "rg",
      "--color=never",
      "--no-heading",
      "--with-filename",
      "--line-number",
      "--column",
      "--smart-case",
      "--ignore",
      "--hidden",
    },
    prompt_prefix = "   ",
    selection_caret = "  ",
    entry_prefix = "  ",
    initial_mode = "insert",
    selection_strategy = "reset",
    layout_strategy = "horizontal",
    layout_config = {
      horizontal = {
        prompt_position = "bottom",
        preview_width = 0.55,
        results_width = 0.8,
      },
      width = 0.87,
      height = 0.80,
      preview_cutoff = 120,
    },
    file_sorter = require("telescope.sorters").get_fuzzy_file,
    file_ignore_patterns = { "node_modules" },
    generic_sorter = require("telescope.sorters").get_generic_fuzzy_sorter,
    path_display = { "truncate" },
    winblend = 0,
    border = {},
    borderchars = { "─", "│", "─", "│", "╭", "╮", "╯", "╰" },
    color_devicons = true,
    use_less = true,
    file_previewer = require("telescope.previewers").vim_buffer_cat.new,
    grep_previewer = require("telescope.previewers").vim_buffer_vimgrep.new,
    qflist_previewer = require("telescope.previewers").vim_buffer_qflist.new,
    extensions = {
      fzf = {
        fuzzy = true,
        override_generic_sorter = true,
        override_file_sorter = true,
        case_mode = "smart_case",
      },
    },
  },
}

telescope.setup(default)
telescope.load_extension "fzf"

keymap({
  name = "Telescope",
  b = { "buffers", "Buffers" },
  c = { "neoclip", "Clipboard" },
  d = { "diagnostics", "Diagnostics" },
  f = { "find_files find_command=rg,--ignore,--hidden,--files", "Find files" },
  g = {
    name = "Git",
    b = { "git_branches", "Branches" },
    c = { "git_commits", "Commits" },
    s = { "git_status", "Status" },
  },
  q = { "resume", "Open last window" },
  h = { "help_tags", "Help" },
  p = { "projects", "Projects" },
  r = { "grep_string", "Grep references" },
  s = { "live_grep", "Grep" },
}, {
  prefix = "<leader>f",
  mapping_prefix = "Telescope ",
  cmd = true,
  silent = false,
})
