require("neorg").setup {
  load = {
    ["core.defaults"] = {},
    ["core.keybinds"] = {
      config = {
        hook = function(keybinds)
          local leader = keybinds.leader
          keybinds.map_event_to_mode("norg", {
            n = {
              -- Marks the task under the cursor as "undone"
              -- ^mark Task as Undone
              { leader .. "tu", "core.norg.qol.todo_items.todo.task_undone" },

              -- Marks the task under the cursor as "pending"
              -- ^mark Task as Pending
              {
                leader .. "tp",
                "core.norg.qol.todo_items.todo.task_pending",
              },

              -- Marks the task under the cursor as "done"
              -- ^mark Task as Done
              { leader .. "td", "core.norg.qol.todo_items.todo.task_done" },

              -- Marks the task under the cursor as "on_hold"
              -- ^mark Task as on Hold
              {
                leader .. "th",
                "core.norg.qol.todo_items.todo.task_on_hold",
              },

              -- Marks the task under the cursor as "cancelled"
              -- ^mark Task as Cancelled
              {
                leader .. "tc",
                "core.norg.qol.todo_items.todo.task_cancelled",
              },

              -- Marks the task under the cursor as "recurring"
              -- ^mark Task as Recurring
              {
                leader .. "tr",
                "core.norg.qol.todo_items.todo.task_recurring",
              },

              -- Marks the task under the cursor as "important"
              -- ^mark Task as Important
              {
                leader .. "ti",
                "core.norg.qol.todo_items.todo.task_important",
              },

              -- Switches the task under the cursor between a select few states
              { "<C-a>", "core.norg.qol.todo_items.todo.task_cycle" },
              { "<C-x>", "core.norg.qol.todo_items.todo.task_cycle" },

              -- Captures a task
              -- ^Task Capture
              { leader .. "tn", "core.gtd.base.capture" },

              -- Short for "task views", show a view selection menu
              -- ^Task View
              { leader .. "tv", "core.gtd.base.views" },

              -- Short for "task edit", lets you edit a task
              -- ^Task Edit
              { leader .. "te", "core.gtd.base.edit" },

              -- Hop to the destination of the link under the cursor
              { "<CR>", "core.norg.esupports.hop.hop-link" },
              { "gd", "core.norg.esupports.hop.hop-link" },
              { "gf", "core.norg.esupports.hop.hop-link" },
              { "gF", "core.norg.esupports.hop.hop-link" },

              -- Same as `<CR>`, except opens the destination in a vertical split
              { leader .. "v", "core.norg.esupports.hop.hop-link", "vsplit" },
              { leader .. "s", "core.norg.esupports.hop.hop-link", "split" },

              { ">.", "core.promo.promote" },
              { "<,", "core.promo.demote" },

              { ">>", "core.promo.promote", "nested" },
              { "<<", "core.promo.demote", "nested" },
            },
          }, {
            silent = true,
            noremap = true,
          })
        end,
      },
    },
    ["core.norg.dirman"] = {
      config = {
        workspaces = {
          root = "~/neorg",
          tasks = "~/neorg/tasks",
        },
        autochdir = true,
        default_workspace = "root",
        index = "index.norg",
      },
    },
    ["core.gtd.base"] = {
      config = {
        workspace = "tasks",
      },
    },
    ["core.norg.completion"] = {
      config = {
        engine = "nvim-cmp",
      },
    },
    ["core.norg.concealer"] = {},
    ["core.integrations.telescope"] = {},
    ["core.norg.esupports.metagen"] = {
      config = {
        type = "auto",
        tab = "",
      },
    },
  },
}

local wk = require "which-key"
wk.register({
  name = "Neorg",
  o = { "<cmd>Neorg<cr>", "Open" },
  i = { "<cmd>Neorg index<cr>", "Index" },
}, { prefix = "<leader>n" })

local neorg_callbacks = require "neorg.callbacks"
neorg_callbacks.on_event(
  "core.keybinds.events.enable_keybinds",
  function(_, keybinds)
    -- Map all the below keybinds only when the "norg" mode is active
    keybinds.map_event_to_mode("norg", {
      n = { -- Bind keys in normal mode
        { "<C-h>", "core.integrations.telescope.find_linkable" },
      },

      i = { -- Bind in insert mode
      },
      { "<C-l>", "core.integrations.telescope.insert_link" },
    }, {
      silent = true,
      noremap = true,
    })
  end
)
