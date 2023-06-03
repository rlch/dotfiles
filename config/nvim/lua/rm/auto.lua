local function open_ts_if_empty()
  local lines = vim.api.nvim_buf_get_lines(0, 0, 2, false)
  if #lines == 0 or (#lines == 1 and lines[0] == nil) then
    vim.api.nvim_command "Telescope find_files find_command=rg,--ignore,--hidden,--files"
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

vim.api.nvim_create_autocmd({ "BufEnter" }, {
  callback = function()
    if vim.api.nvim_buf_line_count(0) > 10000 then
      vim.cmd [[ syntax off ]]
      vim.api.nvim_command "TSBufDisable highlight"
    end
  end,
})

vim.api.nvim_create_autocmd({ "BufNewFile", "BufRead" }, {
  pattern = "*/templates/*.yaml",
  callback = function()
    vim.api.nvim_command "set syntax=yaml"
  end,
})

local name = vim.api.nvim_buf_get_name(0)
if name:match ".*templates/[^/]*%.yaml" then
  vim.nvim_exec [[set syntax=yaml]]
end
