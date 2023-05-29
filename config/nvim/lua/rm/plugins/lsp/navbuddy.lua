local navbuddy = require "nvim-navbuddy"
local actions = require "nvim-navbuddy.actions"

vim.keymap.set(
  "n",
  "<leader>ln",
  navbuddy.open,
  { noremap = true, silent = true }
)

navbuddy.setup {
  window = {
    border = "single", -- "rounded", "double", "solid", "none"
    -- or an array with eight chars building up the border in a clockwise fashion
    -- starting with the top-left corner. eg: { "╔", "═" ,"╗", "║", "╝", "═", "╚", "║" }.
    size = "60%",
    position = "50%",
    sections = {
      left = {
        size = "20%",
        border = nil, -- You can set border style for each section individually as well.
      },
      mid = {
        size = "40%",
      },
      right = {
        size = "40%", -- These should ideally add up to 100%
      },
    },
  },
  mappings = {
    ["<esc>"] = actions.close, -- Close and cursor to original location
    ["q"] = actions.close,

    ["j"] = actions.next_sibling, -- down
    ["k"] = actions.previous_sibling, -- up

    ["h"] = actions.parent, -- Move to left panel
    ["l"] = actions.children, -- Move to right panel

    ["v"] = actions.visual_name, -- Visual selection of name
    ["V"] = actions.visual_scope, -- Visual selection of scope

    ["y"] = actions.yank_name, -- Yank the name to system clipboard "+
    ["Y"] = actions.yank_scope, -- Yank the scope to system clipboard "+

    ["i"] = actions.insert_name, -- Insert at start of name
    ["I"] = actions.insert_scope, -- Insert at start of scope

    ["a"] = actions.append_name, -- Insert at end of name
    ["A"] = actions.append_scope, -- Insert at end of scope

    ["r"] = actions.rename, -- Rename currently focused symbol

    ["d"] = actions.delete, -- Delete scope

    ["f"] = actions.fold_create, -- Create fold of current scope
    ["F"] = actions.fold_delete, -- Delete fold of current scope

    ["c"] = actions.comment, -- Comment out current scope

    ["<enter>"] = actions.select, -- Goto selected symbol
    ["o"] = actions.select,
  },
}
