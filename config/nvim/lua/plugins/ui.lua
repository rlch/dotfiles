---@diagnostic disable: undefined-field
local Util = require("lazyvim.util")

return {
  {
    "echasnovski/mini.indentscope",
    opts = {
      draw = {
        delay = 50,
        animation = function()
          return 8
        end,
      },
    },
  },
  {
    "akinsho/bufferline.nvim",
    enabled = false,
  },
  {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    opts = {
      popup_border_style = "rounded",
      window = {
        position = "float",
      },
      nesting_rules = {
        default_component_configs = {
          indent = {
            indent_marker = "│",
            last_indent_marker = "└",
            highlight = "NeoTreeIndentMarker",
            with_expanders = nil,
            epander_collapsed = " ",
            expander_expanded = " ",
            expander_highlight = "NeoTreeExpander",
          },
          icon = {
            folder_closed = "",
            folder_open = "",
            folder_empty = "",
            default = "*",
          },
          name = {
            trailing_slash = false,
            use_git_status_colors = true,
          },
        },
        ["dart"] = { "config.dart", "pearl_config.dart", "g.dart", "model.dart" },
      },
      filesystem = {
        filtered_items = {
          visible = true,
          hide_dotfiles = false,
          hide_gitignored = true,
          hide_hidden = true,
        },
        follow_current_file = {
          enabled = true,
          leave_dirs_open = true,
        },
      },
    },
    keys = {
      {
        "<leader>fe",
        function()
          require("neo-tree.command").execute({ toggle = true, dir = Util.root() })
        end,
        desc = "Explorer NeoTree (root dir)",
      },
      {
        "<leader>fE",
        function()
          require("neo-tree.command").execute({ toggle = true, dir = vim.loop.cwd() })
        end,
        desc = "Explorer NeoTree (cwd)",
      },
      { "<leader>o", "<leader>fe", desc = "Explorer NeoTree (root dir)", remap = true },
      { "<leader>O", "<leader>fE", desc = "Explorer NeoTree (cwd)", remap = true },
      { "<leader>e", "<leader>fe", desc = "Explorer NeoTree (root dir)", remap = true },
      { "<leader>E", "<leader>fE", desc = "Explorer NeoTree (cwd)", remap = true },
      {
        "<leader>ge",
        function()
          require("neo-tree.command").execute({ source = "git_status", toggle = true })
        end,
        desc = "Git explorer",
      },
      {
        "<leader>be",
        function()
          require("neo-tree.command").execute({ source = "buffers", toggle = true })
        end,
        desc = "Buffer explorer",
      },
    },
  },
  {
    "levouh/tint.nvim",
    lazy = false,
    opts = {
      tint = -10,
      saturation = 0.9,
      tint_background_colors = true,
      highlight_ignore_patterns = {
        "WinSeparator",
        "Status.*",
      },
    },
  },
  {
    "nvimdev/dashboard-nvim",
    opts = function()
      local tutero = [[
                `         '                
;,,,             `       '             ,,,;
`YES8888bo.       :     :       .od8888YES'
  888IO8DO88b.     :   :     .d8888I8DO88  
  8LOVEY'  `Y8b.   `   '   .d8Y'  `YLOVE8  
 jTHEE!  .db.  Yb. '   ' .dY  .db.  8THEE! 
   `888  Y88Y    `b ( ) d'    Y88Y  888'   
    8MYb  '"        ,',        "'  dMY8    
   j8prECIOUSgf"'   ':'   `"?g8prECIOUSk   
     'Y'   .8'     d' 'b     '8.   'Y'     
      !   .8' db  d'; ;`b  db '8.   !      
         d88  `'  8 ; ; 8  `'  88b         
        d88Ib   .g8 ',' 8g.   dI88b        
       :888LOVE88Y'     'Y88LOVE888:       
       '! THEE888'       `888THEE !'       
          '8Y  `Y         Y'  Y8'          
           Y                   Y           
           !                   !           
  ]]

      local logo = string.rep("\n", 8) .. tutero .. "\n\n"

      local opts = {
        theme = "doom",
        hide = {
          -- this is taken care of by lualine
          -- enabling this messes up the actual laststatus setting after loading a file
          statusline = false,
        },
        config = {
          header = vim.split(logo, "\n"),
        -- stylua: ignore
        center = {
          { action = "Telescope find_files",                                     desc = " Find file",       icon = " ", key = "f" },
          { action = "Neotree filesystem current",                               desc = " Filesystem",      icon = "󰙅 ", key = "o" },
          { action = "ene | startinsert",                                        desc = " New file",        icon = " ", key = "n" },
          { action = "Telescope oldfiles",                                       desc = " Recent files",    icon = " ", key = "r" },
          { action = "Telescope live_grep",                                      desc = " Find text",       icon = " ", key = "g" },
          { action = [[lua require("lazyvim.util").telescope.config_files()()]], desc = " Config",          icon = " ", key = "c" },
          { action = 'lua require("persistence").load()',                        desc = " Restore Session", icon = " ", key = "s" },
          { action = "Lazy",                                                     desc = " Lazy",            icon = "󰒲 ", key = "l" },
          { action = "qa",                                                       desc = " Quit",            icon = " ", key = "q" },
        },
          footer = function()
            local stats = require("lazy").stats()
            local ms = (math.floor(stats.startuptime * 100 + 0.5) / 100)
            return { "⚡ Neovim loaded " .. stats.loaded .. "/" .. stats.count .. " plugins in " .. ms .. "ms" }
          end,
        },
      }

      for _, button in ipairs(opts.config.center) do
        button.desc = button.desc .. string.rep(" ", 43 - #button.desc)
        button.key_format = "  %s"
      end

      -- close Lazy and re-open when the dashboard is ready
      if vim.o.filetype == "lazy" then
        vim.cmd.close()
        vim.api.nvim_create_autocmd("User", {
          pattern = "DashboardLoaded",
          callback = function()
            require("lazy").show()
          end,
        })
      end

      return opts
    end,
  },
  {
    "nvim-telescope/telescope.nvim",
    keys = {
      {
        "<leader>,",
        "<cmd>Telescope buffers sort_mru=true sort_lastused=true<cr>",
        desc = "Switch Buffer",
      },
      { "<leader>/", Util.telescope("live_grep"), desc = "Grep (root dir)" },
      { "<leader>:", "<cmd>Telescope command_history<cr>", desc = "Command History" },
      { "<leader><space>", Util.telescope("resume"), desc = "Resume" },
      -- find
      { "<leader>fb", "<cmd>Telescope buffers sort_mru=true sort_lastused=true<cr>", desc = "Buffers" },
      { "<leader>fc", Util.telescope.config_files(), desc = "Find Config File" },
      { "<leader>ff", Util.telescope("files"), desc = "Find Files (root dir)" },
      { "<leader>fF", Util.telescope("files", { cwd = false }), desc = "Find Files (cwd)" },
      { "<leader>fr", "<cmd>Telescope oldfiles<cr>", desc = "Recent" },
      { "<leader>fR", Util.telescope("oldfiles", { cwd = vim.loop.cwd() }), desc = "Recent (cwd)" },
      -- git
      { "<leader>gc", "<cmd>Telescope git_commits<CR>", desc = "commits" },
      { "<leader>gs", "<cmd>Telescope git_status<CR>", desc = "status" },
      -- search
      { '<leader>s"', "<cmd>Telescope registers<cr>", desc = "Registers" },
      { "<leader>sa", "<cmd>Telescope autocommands<cr>", desc = "Auto Commands" },
      { "<leader>sb", "<cmd>Telescope current_buffer_fuzzy_find<cr>", desc = "Buffer" },
      { "<leader>sc", "<cmd>Telescope command_history<cr>", desc = "Command History" },
      { "<leader>sC", "<cmd>Telescope commands<cr>", desc = "Commands" },
      { "<leader>sd", "<cmd>Telescope diagnostics bufnr=0<cr>", desc = "Document diagnostics" },
      { "<leader>sD", "<cmd>Telescope diagnostics<cr>", desc = "Workspace diagnostics" },
      { "<leader>sg", Util.telescope("live_grep"), desc = "Grep (root dir)" },
      { "<leader>sG", Util.telescope("live_grep", { cwd = false }), desc = "Grep (cwd)" },
      { "<leader>sh", "<cmd>Telescope help_tags<cr>", desc = "Help Pages" },
      { "<leader>sH", "<cmd>Telescope highlights<cr>", desc = "Search Highlight Groups" },
      { "<leader>sk", "<cmd>Telescope keymaps<cr>", desc = "Key Maps" },
      { "<leader>sM", "<cmd>Telescope man_pages<cr>", desc = "Man Pages" },
      { "<leader>sm", "<cmd>Telescope marks<cr>", desc = "Jump to Mark" },
      { "<leader>so", "<cmd>Telescope vim_options<cr>", desc = "Options" },
      { "<leader>sR", "<cmd>Telescope resume<cr>", desc = "Resume" },
      { "<leader>sw", Util.telescope("grep_string", { word_match = "-w" }), desc = "Word (root dir)" },
      { "<leader>sW", Util.telescope("grep_string", { cwd = false, word_match = "-w" }), desc = "Word (cwd)" },
      { "<leader>sw", Util.telescope("grep_string"), mode = "v", desc = "Selection (root dir)" },
      { "<leader>sW", Util.telescope("grep_string", { cwd = false }), mode = "v", desc = "Selection (cwd)" },
      { "<leader>uC", Util.telescope("colorscheme", { enable_preview = true }), desc = "Colorscheme with preview" },
      {
        "<leader>ss",
        function()
          require("telescope.builtin").lsp_document_symbols({
            symbols = require("lazyvim.config").get_kind_filter(),
          })
        end,
        desc = "Goto Symbol",
      },
      {
        "<leader>sS",
        function()
          require("telescope.builtin").lsp_dynamic_workspace_symbols({
            symbols = require("lazyvim.config").get_kind_filter(),
          })
        end,
        desc = "Goto Symbol (Workspace)",
      },
    },
  },
  {
    "SmiteshP/nvim-navic",
    init = function()
      vim.g.navic_silence = true
      require("lazyvim.util").lsp.on_attach(function(client, buffer)
        if client.supports_method("textDocument/documentSymbol") then
          require("nvim-navic").attach(client, buffer)
        end
      end)
    end,
    opts = function()
      local hls = {
        { "NavicIconsFile", "CmpItemKindFile" },
        { "NavicIconsModule", "CmpItemKindModule" },
        { "NavicIconsNamespace", "CmpItemKindModule" },
        { "NavicIconsPackage", "CmpItemKindModule" },
        { "NavicIconsClass", "CmpItemKindClass" },
        { "NavicIconsMethod", "CmpItemKindMethod" },
        { "NavicIconsProperty", "CmpItemKindProperty" },
        { "NavicIconsField", "CmpItemKindField" },
        { "NavicIconsConstructor", "CmpItemKindConstructor" },
        { "NavicIconsEnum", "CmpItemKindEnum" },
        { "NavicIconsInterface", "CmpItemKindInterface" },
        { "NavicIconsFunction", "CmpItemKindFunction" },
        { "NavicIconsVariable", "CmpItemKindVariable" },
        { "NavicIconsConstant", "CmpItemKindConstant" },
        { "NavicIconsString", "CmpItemKindValue" },
        { "NavicIconsNumber", "CmpItemKindValue" },
        { "NavicIconsBoolean", "CmpItemKindValue" },
        { "NavicIconsArray", "CmpItemKindValue" },
        { "NavicIconsObject", "CmpItemKindStruct" },
        { "NavicIconsKey", "CmpItemKindValue" },
        { "NavicIconsNull", "CmpItemKindValue" },
        { "NavicIconsEnumMember", "CmpItemKindEnumMember" },
        { "NavicIconsStruct", "CmpItemKindStruct" },
        { "NavicIconsEvent", "CmpItemKindEvent" },
        { "NavicIconsOperator", "CmpItemKindOperator" },
        { "NavicIconsTypeParameter", "CmpItemKindTypeParameter" },
        { "NavicText", "CursorLineNr" },
        { "NavicSeparator", "CursorLineNr" },
      }
      for _, hl in pairs(hls) do
        vim.api.nvim_set_hl(0, hl[1], { link = hl[2], default = true })
      end
      return {
        separator = "   ",
        highlight = true,
        depth_limit = 5,
        icons = require("lazyvim.config").icons.kinds,
        lazy_update_context = true,
      }
    end,
  },
  {
    "nvim-lualine/lualine.nvim",
    opts = function()
      -- PERF: we don't need this lualine require madness 🤷
      local lualine_require = require("lualine_require")
      lualine_require.require = require
      local icons = require("lazyvim.config").icons
      vim.o.laststatus = vim.g.lualine_laststatus

      return {
        options = {
          theme = "auto",
          globalstatus = true,
          disabled_filetypes = { statusline = { "dashboard", "alpha", "starter" } },
          component_separators = { "।", "।" },
          section_separators = { "", "" },
        },
        sections = {
          lualine_a = { "mode" },
          lualine_b = { "branch" },
          lualine_c = {
            Util.lualine.root_dir(),
            {
              "diagnostics",
              symbols = {
                error = icons.diagnostics.Error,
                warn = icons.diagnostics.Warn,
                info = icons.diagnostics.Info,
                hint = icons.diagnostics.Hint,
              },
            },
            { "filetype", icon_only = true, separator = "", padding = { left = 1, right = 0 } },
            { Util.lualine.pretty_path() },
          },
          lualine_x = {
            {
              function()
                return require("noice").api.status.command.get()
              end,
              cond = function()
                return package.loaded["noice"] and require("noice").api.status.command.has()
              end,
              color = Util.ui.fg("Statement"),
            },
            {
              function()
                return require("noice").api.status.mode.get()
              end,
              cond = function()
                return package.loaded["noice"] and require("noice").api.status.mode.has()
              end,
              color = Util.ui.fg("Constant"),
            },
            {
              function()
                return "  " .. require("dap").status()
              end,
              cond = function()
                return package.loaded["dap"] and require("dap").status() ~= ""
              end,
              color = Util.ui.fg("Debug"),
            },
            {
              require("lazy.status").updates,
              cond = require("lazy.status").has_updates,
              color = Util.ui.fg("Special"),
            },
            {
              "diff",
              symbols = {
                added = icons.git.added,
                modified = icons.git.modified,
                removed = icons.git.removed,
              },
              source = function()
                local gitsigns = vim.b.gitsigns_status_dict
                if gitsigns then
                  return {
                    added = gitsigns.added,
                    modified = gitsigns.changed,
                    removed = gitsigns.removed,
                  }
                end
              end,
            },
          },
          lualine_y = {
            { "progress", separator = " ", padding = { left = 1, right = 0 } },
            { "location", padding = { left = 0, right = 1 } },
          },
          lualine_z = {
            function()
              return " " .. os.date("%R")
            end,
          },
        },
        extensions = { "neo-tree", "lazy" },
      }
    end,
  },
  {
    "simeji/winresizer",
    event = "BufEnter",
  },
  {
    "folke/noice.nvim",
    opts = function(_, opts)
      return vim.tbl_deep_extend("force", opts, {
        presets = { inc_rename = true },
      })
    end,
  },
  {
    "sindrets/diffview.nvim",
    cmd = { "DiffviewOpen", "DiffviewFileHistory" },
    keys = {
      { "<localleader>gd", "<cmd>DiffviewOpen<cr>", desc = "Open diffview", mode = "n" },
      { "gh", [[:'<'>DiffviewFileHistory<cr>]], desc = "Open git file history", mode = "v" },
      {
        "<localleader>gh",
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
}
