local present, telescope = pcall(require, 'telescope')

if not present then
  return
end

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
    -- fzf setup
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

local ts_map = function(key, cmd)
  vim.api.nvim_set_keymap('n', '<leader>f' .. key, '<cmd>Telescope ' .. cmd .. '<cr>', { noremap = true })
end

ts_map('a', 'lsp_code_actions')
ts_map('b', 'buffers')
ts_map('c', 'neoclip')
ts_map('d', 'diagnostics')
ts_map('f', 'find_files')
ts_map('F', 'flutter commands')
ts_map('gb', 'git_branches')
ts_map('gc', 'git_commits')
ts_map('gs', 'git_status')
ts_map('h', 'resume')
ts_map('H', 'help_tags')
ts_map('p', 'projects')
ts_map('r', 'grep_string')
ts_map('s', 'live_grep')
vim.api.nvim_set_keymap(
  'n',
  '<leader>fn',
  '<cmd>lua require("github-notifications.menu").notifications()<cr>',
  { noremap = true }
)
-- vim.api.nvim_set_keymap(
--   'n',
--   '<leader>ff',
--   '<cmd>lua require("telescope.builtin").find_files({})<cr>',
--   { noremap = true }
-- )

telescope.setup(default)
telescope.load_extension 'fzf'
