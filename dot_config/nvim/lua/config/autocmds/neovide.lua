local function augroup(name)
  return vim.api.nvim_create_augroup("dotfiles_" .. name, { clear = true })
end

-- Neovide (macOS) opens files launched from Finder / `open` / cmux via an
-- async Apple event *after* nvim has already started with no arguments — so
-- the startup buffer (the Snacks dashboard, or an empty [No Name]) renders in
-- its own tab while the file lands in a second tab. Once a real file is loaded
-- under Neovide, wipe that throwaway startup buffer so only the file remains.
--
-- Gated on g:neovide, so terminal nvim is untouched; and it only fires once a
-- real (file-backed) buffer exists, so a deliberately-opened dashboard with no
-- file is left alone.
vim.api.nvim_create_autocmd("BufReadPost", {
  group = augroup("neovide_clean_open"),
  callback = function(ev)
    if not vim.g.neovide or vim.bo[ev.buf].buftype ~= "" then
      return
    end
    vim.schedule(function()
      for _, buf in ipairs(vim.api.nvim_list_bufs()) do
        if buf ~= ev.buf and vim.api.nvim_buf_is_valid(buf) then
          local name = vim.api.nvim_buf_get_name(buf)
          local empty = name == ""
            and not vim.bo[buf].modified
            and vim.api.nvim_buf_line_count(buf) <= 1
            and (vim.api.nvim_buf_get_lines(buf, 0, 1, false)[1] or "") == ""
          if vim.bo[buf].filetype == "snacks_dashboard" or empty then
            pcall(vim.api.nvim_buf_delete, buf, { force = true })
          end
        end
      end
    end)
  end,
})
