-- Autocmds are automatically loaded on the VeryLazy event

local function augroup(name)
  return vim.api.nvim_create_augroup("dotfiles_" .. name, { clear = true })
end

-- Check if we need to reload the file when it changed
vim.api.nvim_create_autocmd({ "FocusGained", "TermClose", "TermLeave", "CursorHold", "CursorHoldI" }, {
  group = augroup("checktime"),
  command = "checktime",
})

-- Highlight text on yank operation
vim.api.nvim_create_autocmd("TextYankPost", {
  group = augroup("highlight_yank"),
  callback = function()
    vim.highlight.on_yank()
  end,
})

-- Resize splits when window gets resized
vim.api.nvim_create_autocmd({ "VimResized" }, {
  group = augroup("resize_splits"),
  callback = function()
    local current_tab = vim.fn.tabpagenr()
    vim.cmd("tabdo wincmd =")
    vim.cmd("tabnext " .. current_tab)
  end,
})

-- Jump to last cursor location when opening a buffer
vim.api.nvim_create_autocmd("BufReadPost", {
  group = augroup("last_loc"),
  callback = function(event)
    local exclude = { "gitcommit" }
    local buf = event.buf
    if vim.tbl_contains(exclude, vim.bo[buf].filetype) or vim.b[buf].lazyvim_last_loc then
      return
    end
    vim.b[buf].lazyvim_last_loc = true
    local mark = vim.api.nvim_buf_get_mark(buf, '"')
    local lcount = vim.api.nvim_buf_line_count(buf)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})

-- Close certain filetypes with <q> key
vim.api.nvim_create_autocmd("FileType", {
  group = augroup("close_with_q"),
  pattern = {
    "PlenaryTestPopup",
    "help",
    "lspinfo",
    "man",
    "notify",
    "qf",
    "query",
    "spectre_panel",
    "startuptime",
    "tsplayground",
    "neotest-output",
    "checkhealth",
    "neotest-summary",
    "neotest-output-panel",
  },
  callback = function(event)
    vim.bo[event.buf].buflisted = false
    vim.keymap.set("n", "q", "<cmd>close<cr>", { buffer = event.buf, silent = true })
  end,
})

-- Wrap and enable spell check in text filetypes
vim.api.nvim_create_autocmd("FileType", {
  group = augroup("wrap_spell"),
  pattern = { "gitcommit", "markdown" },
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.spell = true
  end,
})

-- Auto create directory when saving a file, if intermediate directory does not exist
vim.api.nvim_create_autocmd({ "BufWritePre" }, {
  group = augroup("auto_create_dir"),
  callback = function(event)
    if event.match:match("^%w%w+://") then
      return
    end
    ---@diagnostic disable-next-line: undefined-field
    local file = vim.loop.fs_realpath(event.match) or event.match
    vim.fn.mkdir(vim.fn.fnamemodify(file, ":p:h"), "p")
  end,
})

-- Update Zellij pane name when changing buffers
local last_renamed_file = nil
vim.api.nvim_create_autocmd({ "BufEnter" }, {
  group = augroup("terminal_pane_name"),
  callback = function()
    local filename = vim.fn.expand("%:t")
    if filename ~= "" and filename ~= last_renamed_file then
      last_renamed_file = filename
      -- Use ANSI escape sequence to set pane title
      io.stdout:write("\027]2;" .. filename .. "\007")
    end
  end,
})

-- Set pane name to current directory on exit
-- vim.api.nvim_create_autocmd("VimLeavePre", {
--   group = augroup("terminal_restore_pane_name"),
--   callback = function()
--     if has_renamed then
--       local cwd = vim.fn.fnamemodify(vim.fn.getcwd(), ":t")
--       -- Use ANSI escape sequence to restore pane title
--       io.stdout:write("\027]2;" .. cwd .. "\007")
--     end
--   end,
-- })

-- Auto fold OpenTelemetry boilerplate in Go files
vim.api.nvim_create_autocmd({ "BufReadPost", "BufWinEnter", "WinEnter", "FileType" }, {
  group = augroup("go_otel_folding"),
  pattern = "*.go",
  callback = function()
    vim.defer_fn(function()
      local bufnr = vim.api.nvim_get_current_buf()
      if vim.bo[bufnr].filetype ~= "go" then
        return
      end

      -- Set manual folding for Go files with OTEL
      vim.opt_local.foldmethod = "manual"
      vim.cmd("normal! zE") -- Clear all folds

      local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)

      for i = 1, #lines do
        local line = lines[i]
        -- Match the otel tracer start pattern
        if line:match("otel%.GetTracerProvider%(%)%.Tracer") then
          -- Find the function declaration line (with or without receiver)
          local func_start = nil
          for k = i - 1, math.max(1, i - 10), -1 do
            local func_line = lines[k]
            if func_line:match("^func%s") or func_line:match("^func%(") then
              func_start = k
              break
            end
          end

          -- Look for the defer block end
          local defer_end = nil
          local brace_count = 0
          local found_defer = false

          for j = i + 1, math.min(i + 30, #lines) do
            local check_line = lines[j]
            if check_line:match("defer func%(%)") then
              found_defer = true
              -- Count opening brace on this line (should be 1 for "defer func() {")
              brace_count = select(2, check_line:gsub("{", ""))
            elseif found_defer then
              -- Count braces on this line
              local open_braces = select(2, check_line:gsub("{", ""))
              local close_braces = select(2, check_line:gsub("}", ""))
              brace_count = brace_count + open_braces - close_braces

              if brace_count == 0 then
                defer_end = j
                break
              end
            end
          end

          -- Create fold from function declaration to defer block end
          if defer_end and func_start then
            pcall(vim.cmd, string.format("%d,%dfold", func_start, defer_end))
          elseif defer_end then
            pcall(vim.cmd, string.format("%d,%dfold", i, defer_end))
          end
        end
      end
    end, 500)
  end,
})
