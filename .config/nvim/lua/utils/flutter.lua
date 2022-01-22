local api = vim.api
local M = {}

M.get_line_length = function()
  return vim.fn.expand('%:p'):find '^/Users/rjm/Coding/Tutero/' and 100 or 80
end

M.toggle_log = function()
  local wins = api.nvim_list_wins()

  for _, id in pairs(wins) do
    local bufnr = api.nvim_win_get_buf(id)
    if api.nvim_buf_get_name(bufnr):match '.*/([^/]+)$' == '__FLUTTER_DEV_LOG__' then
      return vim.api.nvim_win_close(id, true)
    end
  end

  pcall(function()
    vim.api.nvim_command 'sb + __FLUTTER_DEV_LOG__ | resize 15'
  end)
end

return M
