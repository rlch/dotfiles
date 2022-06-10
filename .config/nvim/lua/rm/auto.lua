vim.api.nvim_create_autocmd('VimEnter', {
  pattern = '{}',
  command = 'Telescope find_files',
})

vim.api.nvim_create_autocmd('BufWritePost', {
  pattern = '*/plugins/init.lua',
  command = 'source <afile> | PackerCompile',
})

vim.api.nvim_create_autocmd(
  { 'CursorMoved', 'BufWinEnter', 'BufFilePost', 'InsertEnter', 'BufWritePost' },
  {
    callback = function()
      require('rm.plugins.ui.winbar').get_winbar()
    end,
  }
)
