return {
  {
    "sindrets/diffview.nvim",
    cmd = { "DiffviewOpen", "DiffviewFileHistory" },
    keys = {
      { "<leader>gd", "<cmd>DiffviewOpen<cr>", desc = "Open diffview", mode = "n" },
      { "gh", [[:'<'>DiffviewFileHistory<cr>]], desc = "Open git file history", mode = "v" },
      {
        "<leader>gh",
        "<cmd>kiffviewFileHistory<cr>",
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
    "pwntester/octo.nvim",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "ibhagwan/fzf-lua",
      "nvim-tree/nvim-web-devicons",
    },
    keys = {
      { "<leader>gps", "<cmd>Octo pr list<cr>", "Search GitHub PRs" },
      { "<leader>grC", "<cmd>Octo review commit<cr>", "Select PR commit" },
      { "<leader>grc", "<cmd>Octo review comments<cr>", "Review PR comments" },
      { "<leader>grr", "<cmd>Octo review resume<cr>", "Resume PR review" },
      { "<leader>grs", "<cmd>Octo review start<cr>", "Start PR review" },
      { "<leader>gr<Enter>", "<cmd>Octo review submit<cr>", "Submit PR review" },
    },
    config = function(_, opts)
      require("octo").setup(opts)
      vim.treesitter.language.register("markdown", "octo")
      vim.cmd("hi link OctoBubble Normal")
    end,
    opts = {
      use_local_fs = false,
      default_remote = { "upstream", "origin" }, -- order to try remotes
      right_bubble_delimiter = "", -- bubble delimiter
      left_bubble_delimiter = "",
      picker = "fzf-lua",
      picker_config = {
        mappings = {
          open_in_browser = { lhs = "<C-b>", desc = "open issue in browser" },
          copy_url = { lhs = "<C-y>", desc = "copy url to system clipboard" },
          checkout_pr = { lhs = "<C-o>", desc = "checkout pull request" },
          merge_pr = { lhs = "<C-r>", desc = "merge pull request" },
        },
      },
      ui = { use_signcolumn = true },
      issues = {
        order_by = {
          field = "UPDATED_AT",
          direction = "DESC",
        },
      },
      pull_requests = {
        order_by = {
          field = "UPDATED_AT",
          direction = "DESC",
        },
        always_select_remote_on_create = false,
      },
      file_panel = {
        size = 10,
        use_icons = true,
      },
      mappings = {
        issue = {
          close_issue = { lhs = "<localleader>ic", desc = "close issue" },
          reopen_issue = { lhs = "<localleader>io", desc = "reopen issue" },
          list_issues = { lhs = "<localleader>il", desc = "list open issues on same repo" },
          reload = { lhs = "<C-r>", desc = "reload issue" },
          open_in_browser = { lhs = "<C-b>", desc = "open issue in browser" },
          copy_url = { lhs = "<C-y>", desc = "copy url to system clipboard" },
          add_assignee = { lhs = "<localleader>aa", desc = "add assignee" },
          remove_assignee = { lhs = "<localleader>ad", desc = "remove assignee" },
          create_label = { lhs = "<localleader>lc", desc = "create label" },
          add_label = { lhs = "<localleader>la", desc = "add label" },
          remove_label = { lhs = "<localleader>ld", desc = "remove label" },
          goto_issue = { lhs = "<localleader>gi", desc = "navigate to a local repo issue" },
          add_comment = { lhs = "<localleader>ca", desc = "add comment" },
          delete_comment = { lhs = "<localleader>cd", desc = "delete comment" },
          next_comment = { lhs = "]c", desc = "go to next comment" },
          prev_comment = { lhs = "[c", desc = "go to previous comment" },
          react_hooray = { lhs = "<localleader>rp", desc = "add/remove 🎉 reaction" },
          react_heart = { lhs = "<localleader>rh", desc = "add/remove ❤️ reaction" },
          react_eyes = { lhs = "<localleader>re", desc = "add/remove 👀 reaction" },
          react_thumbs_up = { lhs = "<localleader>r+", desc = "add/remove 👍 reaction" },
          react_thumbs_down = { lhs = "<localleader>r-", desc = "add/remove 👎 reaction" },
          react_rocket = { lhs = "<localleader>rr", desc = "add/remove 🚀 reaction" },
          react_laugh = { lhs = "<localleader>rl", desc = "add/remove 😄 reaction" },
          react_confused = { lhs = "<localleader>rc", desc = "add/remove 😕 reaction" },
        },
        pull_request = {
          checkout_pr = { lhs = "<localleader>po", desc = "checkout PR" },
          merge_pr = { lhs = "<localleader>pm", desc = "merge commit PR" },
          squash_and_merge_pr = { lhs = "<localleader>psm", desc = "squash and merge PR" },
          list_commits = { lhs = "<localleader>pc", desc = "list PR commits" },
          list_changed_files = { lhs = "<localleader>pf", desc = "list PR changed files" },
          show_pr_diff = { lhs = "<localleader>pd", desc = "show PR diff" },
          add_reviewer = { lhs = "<localleader>va", desc = "add reviewer" },
          remove_reviewer = { lhs = "<localleader>vd", desc = "remove reviewer request" },
          close_issue = { lhs = "<localleader>ic", desc = "close PR" },
          reopen_issue = { lhs = "<localleader>io", desc = "reopen PR" },
          list_issues = { lhs = "<localleader>il", desc = "list open issues on same repo" },
          reload = { lhs = "<C-r>", desc = "reload PR" },
          open_in_browser = { lhs = "<C-b>", desc = "open PR in browser" },
          copy_url = { lhs = "<C-y>", desc = "copy url to system clipboard" },
          goto_file = { lhs = "gf", desc = "go to file" },
          add_assignee = { lhs = "<localleader>aa", desc = "add assignee" },
          remove_assignee = { lhs = "<localleader>ad", desc = "remove assignee" },
          create_label = { lhs = "<localleader>lc", desc = "create label" },
          add_label = { lhs = "<localleader>la", desc = "add label" },
          remove_label = { lhs = "<localleader>ld", desc = "remove label" },
          goto_issue = { lhs = "<localleader>gi", desc = "navigate to a local repo issue" },
          add_comment = { lhs = "<localleader>ca", desc = "add comment" },
          delete_comment = { lhs = "<localleader>cd", desc = "delete comment" },
          next_comment = { lhs = "]c", desc = "go to next comment" },
          prev_comment = { lhs = "[c", desc = "go to previous comment" },
          react_hooray = { lhs = "<localleader>rp", desc = "add/remove 🎉 reaction" },
          react_heart = { lhs = "<localleader>rh", desc = "add/remove ❤️ reaction" },
          react_eyes = { lhs = "<localleader>re", desc = "add/remove 👀 reaction" },
          react_thumbs_up = { lhs = "<localleader>r+", desc = "add/remove 👍 reaction" },
          react_thumbs_down = { lhs = "<localleader>r-", desc = "add/remove 👎 reaction" },
          react_rocket = { lhs = "<localleader>rr", desc = "add/remove 🚀 reaction" },
          react_laugh = { lhs = "<localleader>rl", desc = "add/remove 😄 reaction" },
          react_confused = { lhs = "<localleader>rc", desc = "add/remove 😕 reaction" },
        },
        review_thread = {
          goto_issue = { lhs = "<localleader>gi", desc = "navigate to a local repo issue" },
          add_comment = { lhs = "<localleader>ca", desc = "add comment" },
          add_suggestion = { lhs = "<localleader>sa", desc = "add suggestion" },
          delete_comment = { lhs = "<localleader>cd", desc = "delete comment" },
          next_comment = { lhs = "]c", desc = "go to next comment" },
          prev_comment = { lhs = "[c", desc = "go to previous comment" },
          select_next_entry = { lhs = "]q", desc = "move to previous changed file" },
          select_prev_entry = { lhs = "[q", desc = "move to next changed file" },
          close_review_tab = { lhs = "<C-c>", desc = "close review tab" },
          react_hooray = { lhs = "<localleader>rp", desc = "add/remove 🎉 reaction" },
          react_heart = { lhs = "<localleader>rh", desc = "add/remove ❤️ reaction" },
          react_eyes = { lhs = "<localleader>re", desc = "add/remove 👀 reaction" },
          react_thumbs_up = { lhs = "<localleader>r+", desc = "add/remove 👍 reaction" },
          react_thumbs_down = { lhs = "<localleader>r-", desc = "add/remove 👎 reaction" },
          react_rocket = { lhs = "<localleader>rr", desc = "add/remove 🚀 reaction" },
          react_laugh = { lhs = "<localleader>rl", desc = "add/remove 😄 reaction" },
          react_confused = { lhs = "<localleader>rc", desc = "add/remove 😕 reaction" },
        },
        submit_win = {
          approve_review = { lhs = "<C-a>", desc = "approve review" },
          comment_review = { lhs = "<C-m>", desc = "comment review" },
          request_changes = { lhs = "<C-r>", desc = "request changes review" },
          close_review_tab = { lhs = "<C-c>", desc = "close review tab" },
        },
        review_diff = {
          add_review_comment = { lhs = "<localleader>ca", desc = "add a new review comment" },
          add_review_suggestion = { lhs = "<localleader>sa", desc = "add a new review suggestion" },
          focus_files = { lhs = "<localleader>e", desc = "move focus to changed file panel" },
          toggle_files = { lhs = "<localleader>b", desc = "hide/show changed files panel" },
          next_thread = { lhs = "]t", desc = "move to next thread" },
          prev_thread = { lhs = "[t", desc = "move to previous thread" },
          select_next_entry = { lhs = "]q", desc = "move to previous changed file" },
          select_prev_entry = { lhs = "[q", desc = "move to next changed file" },
          close_review_tab = { lhs = "<C-c>", desc = "close review tab" },
          toggle_viewed = { lhs = "<localleader><localleader>", desc = "toggle viewer viewed state" },
          goto_file = { lhs = "gf", desc = "go to file" },
        },
        file_panel = {
          next_entry = { lhs = "j", desc = "move to next changed file" },
          prev_entry = { lhs = "k", desc = "move to previous changed file" },
          select_entry = { lhs = "<cr>", desc = "show selected changed file diffs" },
          refresh_files = { lhs = "R", desc = "refresh changed files panel" },
          focus_files = { lhs = "<localleader>e", desc = "move focus to changed file panel" },
          toggle_files = { lhs = "<localleader>b", desc = "hide/show changed files panel" },
          select_next_entry = { lhs = "]q", desc = "move to previous changed file" },
          select_prev_entry = { lhs = "[q", desc = "move to next changed file" },
          close_review_tab = { lhs = "<C-c>", desc = "close review tab" },
          toggle_viewed = { lhs = "<localleader><localleader>", desc = "toggle viewer viewed state" },
        },
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
    },
  },
}
