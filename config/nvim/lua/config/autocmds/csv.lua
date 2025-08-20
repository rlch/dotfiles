local function augroup(name)
  return vim.api.nvim_create_augroup("dotfiles_" .. name, { clear = true })
end

-- Auto-enable CSV view for CSV files
vim.api.nvim_create_autocmd("FileType", {
  group = augroup("csv_view"),
  pattern = "csv",
  callback = function()
    vim.cmd("CsvViewEnable")
  end,
})