---@diagnostic disable: missing-fields
return {
  {
    "folke/flash.nvim",
    opts = {
      modes = {
        search = { enabled = false },
      },
    },
  },
  {
    "monaqa/dial.nvim",
    vscode = true,
    keys = {
      {
        "<C-a>",
        function()
          require("dial.map").manipulate("increment", "normal")
        end,
        mode = "n",
      },
      {
        "<C-x>",
        function()
          require("dial.map").manipulate("decrement", "normal")
        end,
        mode = "n",
      },
      {
        "g<C-a>",
        function()
          require("dial.map").manipulate("increment", "gnormal")
        end,
        mode = "n",
      },
      {
        "g<C-x>",
        function()
          require("dial.map").manipulate("decrement", "gnormal")
        end,
        mode = "n",
      },
      {
        "<C-a>",
        function()
          require("dial.map").manipulate("increment", "visual")
        end,
        mode = "v",
      },
      {
        "<C-x>",
        function()
          require("dial.map").manipulate("decrement", "visual")
        end,
        mode = "v",
      },
      {
        "g<C-a>",
        function()
          require("dial.map").manipulate("increment", "gvisual")
        end,
        mode = "v",
      },
      {
        "g<C-x>",
        function()
          require("dial.map").manipulate("decrement", "gvisual")
        end,
        mode = "v",
      },
    },
    config = function()
      local augend = require("dial.augend")
      local default = {
        augend.integer.alias.decimal,
        augend.integer.alias.hex,
        augend.date.alias["%Y/%m/%d"],
        augend.constant.alias.bool,
        augend.constant.new({
          elements = { "and", "or" },
          word = true, -- if false, "sand" is incremented into "sor", "doctor" into "doctand", etc.
          cyclic = true, -- "or" is incremented into "and."
        }),
        augend.constant.new({
          elements = { "&&", "||" },
          word = false,
          cyclic = true,
        }),
        augend.constant.alias.alpha,
        augend.constant.alias.Alpha,
      }
      require("dial.config").augends:register_group({
        default = default,
        typescript = {
          augend.integer.alias.decimal,
          augend.integer.alias.hex,
          augend.constant.new({ elements = { "let", "const" } }),
        },
        dart = vim.tbl_extend("force", default, {}),
        yaml = {
          augend.integer.alias.decimal,
          augend.semver.alias.semver,
          augend.constant.alias.bool,
        },
        visual = {
          augend.integer.alias.decimal,
          augend.integer.alias.hex,
          augend.date.alias["%Y/%m/%d"],
          augend.constant.alias.alpha,
          augend.constant.alias.Alpha,
        },
      })
    end,
  },
  {
    "chrisgrieser/nvim-spider",
    opts = {
      skipInsignificantPunctuation = true,
    },
    vscode = true,
    keys = {
      { "w", "<cmd>lua require('spider').motion('w')<CR>", mode = { "n", "o", "x" }, desc = "Spider-w" },
      { "e", "<cmd>lua require('spider').motion('e')<CR>", mode = { "n", "o", "x" }, desc = "Spider-e" },
      { "b", "<cmd>lua require('spider').motion('b')<CR>", mode = { "n", "o", "x" }, desc = "Spider-b" },
      { "ge", "<cmd>lua require('spider').motion('ge')<CR>", mode = { "n", "o", "x" }, desc = "Spider-ge" },
    },
  },
  {
    "chrisgrieser/nvim-various-textobjs",
    opts = { useDefaults = false },
    vscode = true,
    keys = {
      { "aw", '<cmd>lua require("various-textobjs").subword(false)<CR>', { remap = false }, mode = { "o", "x" } },
      { "iw", '<cmd>lua require("various-textobjs").subword(true)<CR>', { remap = false }, mode = { "o", "x" } },
      { "iW", "iw", mode = { "o", "x" } },
      { "aW", "aw", mode = { "o", "x" } },
    },
  },
  {
    "zbirenbaum/copilot.lua",
    opts = {
      suggestion = {
        enabled = true,
        auto_trigger = true,
        debounce = 75,
        keymap = {
          accept = "<C-l>",
          accept_word = false,
          accept_line = false,
          next = "<M-]>",
          prev = "<M-[>",
          dismiss = "<C-]>",
        },
      },
      panel = { enabled = false },
      filetypes = {
        TelescopePrompt = false,
        ["neo-tree"] = false,
        help = false,
        gitcommit = true,
        gitrebase = true,
      },
    },
  },
  {
    "L3MON4D3/LuaSnip",
    lazy = false,
    build = (not jit.os:find("Windows"))
        and "echo 'NOTE: jsregexp is optional, so not a big deal if it fails to build'; make install_jsregexp"
      or nil,
    dependencies = {
      "rafamadriz/friendly-snippets",
    },
    config = function(_, opts)
      local ls = require("luasnip")
      ls.config.setup(opts)
      ls.filetype_extend("dart", { "flutter" })
      ls.filetype_extend("typescriptreact", { "javascriptreact", "html" })
      require("luasnip.loaders.from_vscode").lazy_load()
      require("luasnip.loaders.from_lua").load({
        paths = { "~/.config/nvim/luasnippets" },
      })
    end,
    opts = function()
      local ls = require("luasnip")
      local types = require("luasnip.util.types")
      local extras = require("luasnip.extras")
      local fmt = require("luasnip.extras.fmt").fmt

      return {
        history = false,
        region_check_events = "CursorMoved,CursorHold,InsertEnter",
        delete_check_events = "TextChanged,InsertLeave",
        update_events = "TextChanged,TextChangedI",
        enable_autosnippets = true,
        ext_opts = {
          [types.choiceNode] = {
            active = {
              hl_mode = "combine",
              virt_text = { { "∨", "Operator" } },
            },
          },
          [types.insertNode] = {
            active = {
              hl_mode = "combine",
              virt_text = { { "●", "Type" } },
            },
          },
        },
        snip_env = {
          fmt = fmt,
          m = extras.match,
          t = ls.text_node,
          f = ls.function_node,
          c = ls.choice_node,
          d = ls.dynamic_node,
          i = ls.insert_node,
          l = extras.lamda,
          snippet = ls.snippet,
        },
      }
    end,
    keys = {
      { "<Tab>", false },
      {
        "<c-k>",
        function()
          local ls = require("luasnip")
          if ls.choice_active() then
            ls.change_choice(1)
          end
        end,
        mode = { "s", "i" },
      },
      {
        "<c-j>",
        function()
          local ls = require("luasnip")
          if ls.choice_active() then
            require("luasnip.extras.select_choice")()
          end
        end,
        mode = { "s", "i" },
      },
    },
  },
  {
    "Wansmer/treesj",
    vscode = true,
    keys = {
      {
        "<leader>cj",
        function()
          require("treesj").toggle()
        end,
        mode = "n",
        desc = "Split/Join",
      },
    },
    opts = {
      max_join_length = 500,
    },
  },
  {
    "andythigpen/nvim-coverage",
    dependencies = "nvim-lua/plenary.nvim",
    opts = {},
  },
  {
    "xzbdmw/colorful-menu.nvim",
  },
  {
    "saghen/blink.cmp",
    dependencies = {
      "xzbdmw/colorful-menu.nvim",
      "Kaiser-Yang/blink-cmp-avante",
    },

    -- TODO: workaround for a codecompanion + blink bug
    -- see <https://github.com/olimorris/codecompanion.nvim/issues/968#issuecomment-2672905893>
    -- see <https://github.com/Saghen/blink.cmp/issues/1303>
    -- tag = "v0.12.2",

    ---@module 'blink.cmp'
    ---@type blink.cmp.Config
    opts = {
      signature = { enabled = true },
      completion = {
        accept = {
          dot_repeat = false,
          auto_brackets = {
            enabled = true,
          },
        },
        menu = {
          draw = {
            columns = {
              { "kind_icon", "kind" },
              { "label", "label_description", gap = 1 },
              { "source_name" },
            },
            treesitter = { "lsp" },
            components = {
              label = {
                text = function(ctx)
                  return require("colorful-menu").blink_components_text(ctx)
                end,
                highlight = function(ctx)
                  return require("colorful-menu").blink_components_highlight(ctx)
                end,
              },
            },
          },
        },
        documentation = {
          auto_show = true,
          auto_show_delay_ms = 200,
        },
        ghost_text = {
          enabled = vim.g.ai_cmp,
        },
      },
      sources = {
        default = { "avante", "lsp", "path", "snippets", "buffer" },
        per_filetype = {
          codecompanion = { "codecompanion", "buffer" },
        },
        providers = {
          avante = {
            module = "blink-cmp-avante",
            name = "Avante",
          },
        },
      },
      cmdline = { enabled = false },
    },
  },
}
