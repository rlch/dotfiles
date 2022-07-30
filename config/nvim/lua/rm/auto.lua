local function open_ts_if_empty()
  local lines = vim.api.nvim_buf_get_lines(0, 0, 2, false)
  if #lines == 0 or (#lines == 1 and lines[0] == nil) then
    vim.api.nvim_command "Telescope find_files"
  end
end

vim.api.nvim_create_autocmd("VimEnter", {
  pattern = "{}",
  callback = function()
    vim.schedule(open_ts_if_empty)
  end,
})

vim.api.nvim_create_autocmd("BufWritePost", {
  pattern = "*/plugins/init.lua",
  command = "source <afile> | PackerCompile",
})

vim.api.nvim_create_autocmd(
  { "CursorMoved", "BufWinEnter", "BufFilePost", "InsertEnter", "BufWritePost" },
  {
    callback = function()
      require("rm.plugins.ui.winbar").get_winbar()
    end,
  }
)
