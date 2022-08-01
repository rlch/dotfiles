vim.g.neo_tree_remove_legacy_commands = 1

require("neo-tree").setup {
  close_if_last_window = false,
  popup_border_style = "rounded",
  enable_git_status = true,
  git_status_async = true,
  enable_diagnostics = true,
  sources = {
    "filesystem",
    "buffers",
    "git_status",
    "diagnostics",
  },
  default_component_configs = {
    indent = {
      indent_size = 2,
      padding = 1,
      with_markers = true,
      indent_marker = "│",
      last_indent_marker = "└",
      highlight = "NeoTreeIndentMarker",
      with_expanders = nil,
      expander_collapsed = "",
      expander_expanded = "",
      expander_highlight = "NeoTreeExpander",
    },
    icon = {
      folder_closed = "",
      folder_open = "",
      folder_empty = "ﰊ",
      default = "*",
    },
    name = {
      trailing_slash = false,
      use_git_status_colors = true,
    },
    git_status = {
      symbols = R.icons.git_status,
    },
  },
  window = {
    position = "float",
    -- position = 'left',
    -- width = 35,
    mappings = {
      -- ['<space>'] = 'toggle_node',
      ["<2-LeftMouse>"] = "open",
      ["<Tab>"] = "open",
      ["<cr>"] = "open",
      ["A"] = "add_directory",
      ["C"] = "close_node",
      ["R"] = "refresh",
      ["a"] = "add",
      ["c"] = "copy",
      ["d"] = "delete",
      ["m"] = "move",
      ["p"] = "paste_from_clipboard",
      ["q"] = "close_window",
      ["r"] = "rename",
      ["s"] = "open_split",
      ["v"] = "open_vsplit",
      ["x"] = "cut_to_clipboard",
      ["y"] = "copy_to_clipboard",
    },
  },
  nesting_rules = {
    ["dart"] = { "config.dart", "pearl_config.dart", "g.dart", "model.dart" },
  },
  filesystem = {
    filtered_items = {
      visible = false,
      hide_dotfiles = false,
      hide_gitignored = false,
      hide_by_name = {
        ".DS_Store",
        "thumbs.db",
      },
      never_show = {
        ".DS_Store",
        "thumbs.db",
      },
    },
    follow_current_file = true,
    hijack_netrw_behavior = "open_default",
    use_libuv_file_watcher = true,
    window = {
      mappings = {
        ["."] = "set_root",
        ["/"] = "fuzzy_finder",
        ["<bs>"] = "navigate_up",
        ["<c-x>"] = "clear_filter",
        ["H"] = "toggle_hidden",
        ["f"] = "filter_on_submit",
      },
    },
  },
  buffers = {
    show_unloaded = true,
    window = {
      mappings = {
        ["bd"] = "buffer_delete",
      },
    },
  },
  diagnostics = {
    bind_to_cwd = true,
    diag_sort_function = "severity",
    follow_behavior = { -- Behavior when `follow_current_file` is true
      always_focus_file = false, -- Focus the followed file, even when focus is currently on a diagnostic item belonging to that file.
      expand_followed = true, -- Ensure the node of the followed file is expanded
      collapse_others = true, -- Ensure other nodes are collapsed
    },
    follow_current_file = true,
    group_dirs_and_files = true, -- when true, empty folders and files will be grouped together
    group_empty_dirs = true, -- when true, empty directories will be grouped together
    show_unloaded = true, -- show diagnostics from unloaded buffers
  },
  git_status = {
    window = {
      position = "float",
      mappings = {
        ["A"] = "git_add_all",
        ["gu"] = "git_unstage_file",
        ["ga"] = "git_add_file",
        ["gr"] = "git_revert_file",
        ["gc"] = "git_commit",
        ["gp"] = "git_push",
        ["gg"] = "git_commit_and_push",
      },
    },
  },
}

map(
  "n",
  "\\",
  "<cmd>Neotree reveal toggle position=float<cr>",
  { silent = true }
)
map(
  "n",
  "<leader>o",
  "<cmd>Neotree reveal toggle position=float<cr>",
  { silent = true }
)
map(
  "n",
  "<leader>do",
  "<cmd>Neotree diagnostics reveal toggle position=float<cr>",
  { silent = true }
)
