return {
  {
    "sindrets/diffview.nvim",
    cmd = { "DiffviewOpen", "DiffviewFileHistory" },
    keys = {
      { "<leader>gd", "<cmd>DiffviewOpen<cr>", desc = "Open diffview", mode = "n" },
      { "gh", [[:'<'>DiffviewFileHistory<cr>]], desc = "Open git file history", mode = "v" },
      {
        "<leader>gh",
        "<cmd>DiffviewFileHistory<cr>",
        desc = "Open git file history",
        mode = "n",
      },
    },
    opts = {
      default_args = { DiffviewFileHistory = { "%" } },
      enhanced_diff_hl = true,
      hooks = {
        diff_buf_read = function()
          local opt = vim.opt_local
          opt.wrap, opt.list, opt.relativenumber = false, false, false
          opt.colorcolumn = ""
        end,
        diff_buf_win_enter = function(_, _, ctx)
          if ctx.layout_name:match("^diff2") then
            if ctx.symbol == "a" then
              vim.opt_local.winhl = table.concat({
                "DiffAdd:DiffviewDiffAddAsDelete",
                "DiffDelete:DiffviewDiffDelete",
              }, ",")
            elseif ctx.symbol == "b" then
              vim.opt_local.winhl = table.concat({
                "DiffDelete:DiffviewDiffDelete",
              }, ",")
            end
          end
        end,
      },
      keymaps = {
        view = { q = "<cmd>DiffviewClose<cr>" },
        file_panel = { q = "<cmd>DiffviewClose<cr>" },
        file_history_panel = { q = "<cmd>DiffviewClose<cr>" },
      },
    },
  },
  {
    "akinsho/git-conflict.nvim",
    event = "BufRead",
    version = "v2.1.0",
    config = true,
    opts = {
      disable_diagnostics = true,
      highlights = {
        incoming = "GitConflictIncoming",
        current = "GitConflictCurrent",
      },
    },
  },
}
