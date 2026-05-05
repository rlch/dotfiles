---@diagnostic disable: undefined-field
return {

  {
    "nvim-mini/mini.indentscope",
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
    "folke/snacks.nvim",
    ---@module 'snacks'
    ---@type snacks.Config
    opts = {
      dashboard = {
        preset = {
          header = [[
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
           !                   !           ]],
          keys = {
            { icon = "󰙅 ", key = "o", desc = "Explorer", action = ":Neotree filesystem current" },
            { icon = " ", key = "f", desc = "Find File", action = ":lua Snacks.dashboard.pick('files')" },
            { icon = " ", key = "n", desc = "New File", action = ":ene | startinsert" },
            { icon = " ", key = "g", desc = "Find Text", action = ":lua Snacks.dashboard.pick('live_grep')" },
            { icon = " ", key = "r", desc = "Recent Files", action = ":lua Snacks.dashboard.pick('oldfiles')" },
            {
              icon = " ",
              key = "c",
              desc = "Config",
              action = ":lua Snacks.dashboard.pick('files', {cwd = vim.fn.stdpath('config')})",
            },
            { icon = " ", key = "s", desc = "Restore Session", section = "session" },
            { icon = " ", key = "x", desc = "Lazy Extras", action = ":LazyExtras" },
            { icon = "󰒲 ", key = "l", desc = "Lazy", action = ":Lazy" },
            { icon = " ", key = "q", desc = "Quit", action = ":qa" },
          },
        },
      },
    },
  },
  {
    "SmiteshP/nvim-navic",
    lazy = false,
    init = function()
      vim.g.navic_silence = true
    end,
    config = function(_, opts)
      require("nvim-navic").setup(opts)
      vim.api.nvim_create_autocmd("LspAttach", {
        callback = function(args)
          local client = vim.lsp.get_client_by_id(args.data.client_id)
          local bufnr = args.buf
          if client and client.server_capabilities.documentSymbolProvider then
            require("nvim-navic").attach(client, bufnr)
          end
        end,
      })
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
    "simeji/winresizer",
    event = "BufEnter",
  },
  {
    "folke/noice.nvim",
    opts = {
      routes = {
        {
          filter = { event = "notify", find = "No information available" },
          opts = { skip = true },
        },
      },
      presets = {
        inc_rename = true,
      },
    },
  },
  {
    "nvim-treesitter/nvim-treesitter-context",
    opts = { max_lines = 0 },
  },
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    init = function()
      vim.g.lualine_laststatus = vim.o.laststatus
      if vim.fn.argc(-1) > 0 then
        -- set an empty statusline till lualine loads
        vim.o.statusline = " "
      else
        -- hide the statusline on the starter page
        vim.o.laststatus = 0
      end
    end,
    opts = function()
      -- PERF: we don't need this lualine require madness 🤷
      local lualine_require = require("lualine_require")
      lualine_require.require = require

      local icons = LazyVim.config.icons

      vim.o.laststatus = vim.g.lualine_laststatus

      local opts = {
        options = {
          theme = "auto",
          globalstatus = vim.o.laststatus == 3,
          disabled_filetypes = { statusline = { "dashboard", "alpha", "ministarter", "snacks_dashboard" } },
        },
        sections = {
          lualine_a = { "mode" },
          lualine_b = { "branch" },

          lualine_c = {
            LazyVim.lualine.root_dir(),
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
            { LazyVim.lualine.pretty_path() },
          },
          lualine_x = {
            Snacks.profiler.status(),
          -- stylua: ignore
          {
            function() return require("noice").api.status.command.get() end,
            cond = function() return package.loaded["noice"] and require("noice").api.status.command.has() end,
            color = function() return { fg = Snacks.util.color("Statement") } end,
          },
          -- stylua: ignore
          {
            function() return require("noice").api.status.mode.get() end,
            cond = function() return package.loaded["noice"] and require("noice").api.status.mode.has() end,
            color = function() return { fg = Snacks.util.color("Constant") } end,
          },
          -- stylua: ignore
          {
            function() return "  " .. require("dap").status() end,
            cond = function() return package.loaded["dap"] and require("dap").status() ~= "" end,
            color = function() return { fg = Snacks.util.color("Debug") } end,
          },
          -- stylua: ignore
          {
            require("lazy.status").updates,
            cond = require("lazy.status").has_updates,
            color = function() return { fg = Snacks.util.color("Special") } end,
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
            {
              function()
                local schema = require("yaml-companion").get_buf_schema(0)
                if schema.result[1].name == "none" then
                  return ""
                end
                return schema.result[1].name
              end,
              cond = function()
                return vim.bo.filetype == "yaml"
              end,
              color = function()
                return { fg = Snacks.util.color("Variable") }
              end,
            },
            function()
              return " " .. os.date("%R")
            end,
          },
        },
        extensions = { "neo-tree", "lazy" },
      }

      -- do not add trouble symbols if aerial is enabled
      -- And allow it to be overriden for some buffer types (see autocmds)
      if vim.g.trouble_lualine and LazyVim.has("trouble.nvim") then
        local trouble = require("trouble")
        local symbols = trouble.statusline({
          mode = "symbols",
          groups = {},
          title = false,
          filter = { range = true },
          format = "{kind_icon}{symbol.name:Normal}",
          hl_group = "lualine_c_normal",
        })
        table.insert(opts.sections.lualine_c, {
          symbols and symbols.get,
          cond = function()
            return vim.b.trouble_lualine ~= false and symbols.has()
          end,
        })
      end

      return opts
    end,
  },
  {
    "nvim-mini/mini.diff",
    event = "VeryLazy",
    config = function(_, opts)
      local diff = require("mini.diff")
      diff.setup(vim.tbl_extend("force", opts, {
        source = diff.gen_source.none(),
      }))
    end,
    opts = {
      view = {
        style = "sign",
        signs = {
          add = "▎",
          change = "▎",
          delete = "",
        },
      },
    },
  },
  {
    "folke/trouble.nvim",
    opts = {}, -- for default options, refer to the configuration section for custom setup.
    cmd = "Trouble",
    keys = {
      {
        "<leader>cS",
        "<cmd>Trouble lsp toggle focus=true win.position=right<cr>",
        desc = "LSP Definitions / references / ... (Trouble)",
      },
    },
  },
}
