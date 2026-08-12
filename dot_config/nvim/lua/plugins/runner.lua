-- Task running.
--
-- overseer.nvim is the generic runner: it auto-detects cargo / npm / make /
-- just / mise / deno templates (plus .vscode/tasks.json) and streams output
-- into the quickfix list. Language-native runners beat it wherever they know
-- something a shell command doesn't — rust-analyzer resolves the exact bin or
-- test under the cursor, flutter-tools hot-reloads a live session.
--
-- Layering, so there's no dispatch table to keep in sync: `<localleader>r` is
-- a *global* overseer fallback, and each language spec sets a buffer-local
-- `<localleader>r` on top of it via lazy's `keys.ft`. Buffer-local always wins,
-- so the right runner fires per filetype and everything else falls through to
-- overseer. `<localleader>R` is "repeat the last one" under the same rule.
local function restart_last_task()
  local overseer = require("overseer")

  -- list_tasks() makes no ordering guarantee, and there's no `recent_first`
  -- opt any more — task ids are monotonic, so take the highest.
  local latest
  for _, task in ipairs(overseer.list_tasks()) do
    if not latest or task.id > latest.id then
      latest = task
    end
  end

  if not latest then
    return vim.cmd.OverseerRun()
  end
  overseer.run_action(latest, "restart")
end

return {
  {
    "stevearc/overseer.nvim",
    -- stylua: ignore
    keys = {
      -- The LazyVim extra parks the task-list keys on `<leader>o`, which is
      -- already Explorer NeoTree (cwd) in editor.lua. Move the group to
      -- `<leader>r`.
      { "<leader>ow", false },
      { "<leader>oo", false },
      { "<leader>ot", false },

      { "<leader>rr", "<cmd>OverseerRun<cr>",        desc = "Run task" },
      { "<leader>rw", "<cmd>OverseerToggle!<cr>",    desc = "Task list" },
      { "<leader>ra", "<cmd>OverseerTaskAction<cr>", desc = "Task action" },
      { "<leader>rs", "<cmd>OverseerShell<cr>",      desc = "Run shell command" },
      { "<leader>rl", restart_last_task,             desc = "Restart last task" },

      { "<localleader>r", "<cmd>OverseerRun<cr>", desc = "Run task" },
      { "<localleader>R", restart_last_task,      desc = "Restart last task" },
    },
    opts = {
      component_aliases = {
        -- Mirrors upstream's `default` alias, plus quickfix capture: every
        -- task's output lands in the quickfix list, and the window only pops
        -- open when a line actually parses as an error via `errorformat`.
        default = {
          "on_exit_set_status",
          "on_complete_notify",
          { "on_complete_dispose", require_view = { "SUCCESS", "FAILURE" } },
          { "on_output_quickfix", open_on_match = true },
        },
      },
    },
  },
  {
    "folke/which-key.nvim",
    optional = true,
    opts = {
      spec = {
        { "<leader>r", group = "run" },
      },
    },
  },
}
