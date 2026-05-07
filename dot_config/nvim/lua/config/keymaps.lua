-- LazyVim 15.x / Neovim 0.12 idioms:
--   * `LazyVim` is a global namespace exposed by the LazyVim plugin.
--   * Toggles use `Snacks.toggle.*():map("<leader>...")` chained pattern.
--   * `vim.diagnostic.goto_next/prev` are deprecated → `vim.diagnostic.jump`.
local map = vim.keymap.set

-- ; > :
map("n", ";", ":", { remap = true })
map("v", ";", ":", { remap = true })

-- Better movements
map("n", "H", "^", { remap = true })
map("v", "H", "^", { remap = true })
map("n", "L", "$", { remap = true })
map("v", "L", "$", { remap = true })
map("n", "Q", "@q", { remap = true })
map("n", "Y", "y$", { remap = true })

-- Make S/Tab less quirky
map("i", "<Tab>", "<C-t>") -- Indent in insert mode
map("i", "<S-Tab>", "<C-d>")
map("n", "<S-Tab>", "<<")
map("v", "<Tab>", ">gv")
map("v", "<S-Tab>", "<gv")
map("v", ">", ">gv")
map("v", "<", "<gv")

-- better up/down
map({ "n", "x" }, "j", "v:count == 0 ? 'gj' : 'j'", { expr = true, silent = true })
map({ "n", "x" }, "<Down>", "v:count == 0 ? 'gj' : 'j'", { expr = true, silent = true })
map({ "n", "x" }, "k", "v:count == 0 ? 'gk' : 'k'", { expr = true, silent = true })
map({ "n", "x" }, "<Up>", "v:count == 0 ? 'gk' : 'k'", { expr = true, silent = true })

-- Move Lines
map("v", "J", ":m '>+1<cr>gv=gv", { desc = "Move down" })
map("v", "K", ":m '<-2<cr>gv=gv", { desc = "Move up" })

-- Paste without delete ring
map("v", "<leader>p", '"_dp')
map("v", "<leader>P", '"_dP')

-- buffers
map("n", "[b", "<cmd>bprevious<cr>", { desc = "Prev buffer" })
map("n", "]b", "<cmd>bnext<cr>", { desc = "Next buffer" })
map("n", "<leader>bb", "<cmd>e #<cr>", { desc = "Switch to Other Buffer" })

-- Clear search with <esc>
map({ "i", "n" }, "<esc>", "<cmd>noh<cr><esc>", { desc = "Escape and clear hlsearch" })

-- Clear search, diff update and redraw
-- taken from runtime/lua/_editor.lua
map(
  "n",
  "<leader>ur",
  "<Cmd>nohlsearch<Bar>diffupdate<Bar>normal! <C-L><CR>",
  { desc = "Redraw / clear hlsearch / diff update" }
)

-- https://github.com/mhinz/vim-galore#saner-behavior-of-n-and-n
map("n", "n", "'Nn'[v:searchforward].'zv'", { expr = true, desc = "Next search result" })
map("x", "n", "'Nn'[v:searchforward]", { expr = true, desc = "Next search result" })
map("o", "n", "'Nn'[v:searchforward]", { expr = true, desc = "Next search result" })
map("n", "N", "'nN'[v:searchforward].'zv'", { expr = true, desc = "Prev search result" })
map("x", "N", "'nN'[v:searchforward]", { expr = true, desc = "Prev search result" })
map("o", "N", "'nN'[v:searchforward]", { expr = true, desc = "Prev search result" })

-- Add undo break-points
map("i", ",", ",<c-g>u")
map("i", ".", ".<c-g>u")

-- save file
map({ "i", "x", "n", "s" }, "<C-s>", "<cmd>w<cr><esc>", { desc = "Save file" })

--keywordprg
map("n", "<leader>K", "<cmd>norm! K<cr>", { desc = "Keywordprg" })

-- better indenting
map("v", "<", "<gv")
map("v", ">", ">gv")

-- lazy
map("n", "<leader>L", "<cmd>Lazy<cr>", { desc = "Lazy" })

-- new file
map("n", "<leader>fn", "<cmd>enew<cr>", { desc = "New File" })

map("n", "<leader>xl", "<cmd>lopen<cr>", { desc = "Location List" })
map("n", "<leader>xq", "<cmd>copen<cr>", { desc = "Quickfix List" })

map("n", "[q", vim.cmd.cprev, { desc = "Previous quickfix" })
map("n", "]q", vim.cmd.cnext, { desc = "Next quickfix" })

-- diagnostic (vim.diagnostic.jump replaced goto_next/goto_prev in 0.11)
local diagnostic_jump = function(forward, severity)
  local count = forward and 1 or -1
  severity = severity and vim.diagnostic.severity[severity] or nil
  return function()
    vim.diagnostic.jump({ count = count, severity = severity, float = true })
  end
end
map("n", "<leader>dh", vim.diagnostic.open_float, { desc = "Line Diagnostics" })
map("n", "]d", diagnostic_jump(true), { desc = "Next Diagnostic" })
map("n", "[d", diagnostic_jump(false), { desc = "Prev Diagnostic" })
map("n", "]e", diagnostic_jump(true, "ERROR"), { desc = "Next Error" })
map("n", "[e", diagnostic_jump(false, "ERROR"), { desc = "Prev Error" })
map("n", "]w", diagnostic_jump(true, "WARN"), { desc = "Next Warning" })
map("n", "[w", diagnostic_jump(false, "WARN"), { desc = "Prev Warning" })

-- toggles (Snacks.toggle / LazyVim chained pattern — auto-registers in which-key)
local conceallevel = vim.o.conceallevel > 0 and vim.o.conceallevel or 3
LazyVim.format.snacks_toggle():map("<leader>uf")
LazyVim.format.snacks_toggle(true):map("<leader>uF")
Snacks.toggle.option("spell", { name = "Spelling" }):map("<leader>us")
Snacks.toggle.option("wrap", { name = "Wrap" }):map("<leader>uw")
Snacks.toggle.option("relativenumber", { name = "Relative Number" }):map("<leader>uL")
Snacks.toggle.line_number():map("<leader>ul")
Snacks.toggle.diagnostics():map("<leader>ud")
Snacks.toggle.option("conceallevel", { off = 0, on = conceallevel }):map("<leader>uc")
Snacks.toggle.inlay_hints():map("<leader>uh")
Snacks.toggle.treesitter():map("<leader>uT")

-- lazygit (Snacks.lazygit replaces the old Util.terminal({"lazygit"}) pattern)
map("n", "<leader>gg", function() Snacks.lazygit({ cwd = LazyVim.root.git() }) end, { desc = "Lazygit (root dir)" })
map("n", "<leader>gG", function() Snacks.lazygit() end, { desc = "Lazygit (cwd)" })

-- highlights under cursor
map("n", "<leader>ui", vim.show_pos, { desc = "Inspect highlights" })

-- LazyVim Changelog
-- windows
map("n", "<leader>ww", "<C-W>p", { desc = "Other window", remap = true })
map("n", "<leader>wd", "<C-W>c", { desc = "Delete window", remap = true })
map("n", "<leader>w-", "<C-W>s", { desc = "Split window below", remap = true })
map("n", "<leader>w|", "<C-W>v", { desc = "Split window right", remap = true })
map("n", "<leader>-", "<C-W>s", { desc = "Split window below", remap = true })
map("n", "<leader>|", "<C-W>v", { desc = "Split window right", remap = true })

map("n", "<leader>!", ":Say ", {desc = "Say "})

-- Ctrl-C exits if and only if no buffers have unsaved changes.
map("n", "<C-c>", function()
  local modified = {}
  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(buf) and vim.bo[buf].modified then
      local name = vim.api.nvim_buf_get_name(buf)
      table.insert(modified, name ~= "" and vim.fn.fnamemodify(name, ":~:.") or ("[No Name " .. buf .. "]"))
    end
  end
  if #modified > 0 then
    vim.notify("Unsaved: " .. table.concat(modified, ", "), vim.log.levels.WARN)
    return
  end
  vim.cmd("qa")
end, { desc = "Quit if no unsaved buffers" })
