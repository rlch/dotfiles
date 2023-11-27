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
    opts = {
      options = {
        always_show_bufferline = false,
        mode = "tabs",
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
    "nvim-treesitter/nvim-treesitter-context",
    opts = { max_lines = 0 },
  },
}
