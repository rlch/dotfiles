local telescope = require 'telescope'

local default = {
  defaults = {
    vimgrep_arguments = {
      'rg',
      '--color=never',
      '--no-heading',
      '--with-filename',
      '--line-number',
      '--column',
      '--smart-case',
    },
    prompt_prefix = '   ',
    selection_caret = '  ',
    entry_prefix = '  ',
    initial_mode = 'insert',
    selection_strategy = 'reset',
    layout_strategy = 'horizontal',
    layout_config = {
      horizontal = {
        prompt_position = 'bottom',
        preview_width = 0.55,
        results_width = 0.8,
      },
      width = 0.87,
      height = 0.80,
      preview_cutoff = 120,
    },
    file_sorter = require('telescope.sorters').get_fuzzy_file,
    file_ignore_patterns = { 'node_modules' },
    generic_sorter = require('telescope.sorters').get_generic_fuzzy_sorter,
    path_display = { 'truncate' },
    winblend = 0,
    border = {},
    borderchars = { '─', '│', '─', '│', '╭', '╮', '╯', '╰' },
    color_devicons = true,
    use_less = true,
    file_previewer = require('telescope.previewers').vim_buffer_cat.new,
    grep_previewer = require('telescope.previewers').vim_buffer_vimgrep.new,
    qflist_previewer = require('telescope.previewers').vim_buffer_qflist.new,
    extensions = {
      fzf = {
        fuzzy = true,
        override_generic_sorter = true,
        override_file_sorter = true,
        case_mode = 'smart_case',
      },
    },
  },
}

telescope.setup(default)
telescope.load_extension 'fzf'

local map_ts = function(key, cmd)
  mapx('n', '<leader>f' .. key, 'Telescope ' .. cmd)
end

map_ts('a', 'lsp_code_actions')
map_ts('b', 'buffers')
map_ts('c', 'neoclip')
map_ts('d', 'diagnostics')
map_ts('f', 'find_files')
map_ts('F', 'flutter commands')
map_ts('gb', 'git_branches')
map_ts('gc', 'git_commits')
map_ts('gs', 'git_status')
map_ts('h', 'resume')
map_ts('H', 'help_tags')
map_ts('p', 'projects')
map_ts('r', 'grep_string')
map_ts('s', 'live_grep')
map('n', '<leader>fn', function()
  require('github-notifications.menu').notifications()
end)
