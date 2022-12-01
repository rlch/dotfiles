---@diagnostic disable: lowercase-global

local g = vim.g
local wk = require "which-key"
local map = vim.keymap.set

-- Leader bindings
map("n", " ", "<nop>")
g.mapleader = " "
g.maplocalleader = ","

-- ; > :
map("n", ";", ":", { remap = true })
map("v", ";", ":", { remap = true })

-- Better movements
map("n", "H", "^", { remap = true })
map("v", "H", "^", { remap = true })
map("n", "L", "$", { remap = true })
map("v", "L", "$", { remap = true })
map("n", "Q", "@q", { remap = true })
map("n", "Y", "y$", { remap = true })

-- Make S/Tab less quirky
map("i", "<Tab>", "<C-i>")
map("i", "<S-Tab>", "<C-d>")
map("n", "<S-Tab>", "<<")
map("v", "<Tab>", ">gv")
map("v", "<S-Tab>", "<gv")
map("v", ">", ">gv")
map("v", "<", "<gv")

-- Paste without delete ring
map("v", "<leader>p", '"_dp')
map("v", "<leader>P", '"_dP')

-- VSC style shifting
-- mapx("n", "<C-j>", "MoveLine(1)", { silent = true })
-- mapx("n", "<C-k>", "MoveLine(-1)", { silent = true })
map("v", "J", ":m '>+1<cr>gv=gv", { remap = true })
map("v", "K", ":m '<-2<cr>gv=gv", { remap = true })

-- Remove highlights
map("n", "<leader><leader>", "<cmd>noh<cr>")

-- LSP
map("n", "gd", vim.lsp.buf.definition)
map("n", "gD", vim.lsp.buf.declaration)
map("n", "gi", vim.lsp.buf.implementation)
map("n", "gr", vim.lsp.buf.rename)
map("n", "<leader>lf", vim.lsp.buf.format)
map("n", "<leader>a", vim.lsp.buf.code_action)
map("n", "<leader>lr", "<cmd>LspRestart<cr>")
map("n", "K", vim.lsp.buf.hover, { remap = true })
map("n", "<leader>dh", function()
  vim.diagnostic.open_float(nil, { focusable = false, width = 50 })
end, { silent = true })

-- Jump to next/prev error; prioritizing ERROR severity.
map("n", "<leader>dk", function()
  local errors = vim.diagnostic.get(0, { severity = "ERROR" })
  if #errors == 0 then
    vim.diagnostic.goto_prev()
  else
    vim.diagnostic.goto_prev {
      severity = "ERROR",
    }
  end
end, { silent = true })
map("n", "<leader>dj", function()
  local errors = vim.diagnostic.get(0, { severity = "ERROR" })
  if #errors == 0 then
    vim.diagnostic.goto_next()
  else
    vim.diagnostic.goto_next {
      severity = "ERROR",
    }
  end
end, { silent = true })

-- Open URLs
map("n", "gx", 'viW"ay:!open <C-R>a &<cr>')

-- Packer
map("n", "<leader>ss", "<cmd>PackerSync<cr>")


-- Plugin mappings

-- require("legendary").setup {
--   select_prompt = " keymaps ",
--   include_builtin = false,
--   which_key = {
--     auto_register = true,
--     do_binding = true,
--   },
-- }

require("which-key").setup {
  plugins = {
    spelling = {
      enabled = true,
      suggestions = 20,
    },
  },
  triggers = { "<localleader>" },
}

---@alias ModeEnum "n" | "v" | "i" | "c"
---@alias Mode ModeEnum | {number: ModeEnum}
---@alias KeymapOpts {cmd: boolean, mapping_prefix: string, mapping_suffix: string, decorator: (fun(inner: function): function), mode: Mode, prefix: string, buffer: number, silent: boolean, noremap: boolean, nowait: boolean}
---@alias Keymap string | {number:string|function, mode: Mode, prefix: string, buffer: number, silent: boolean, noremap: boolean, nowait: boolean}
---@alias KeymapTable {string: string | Keymap | KeymapTable, name: string}
--- map uses which-key to recursively create keybinds, using the provided opts as defaults.
---@param keymap_table {[string]: Keymap | KeymapTable}
---@param opts? KeymapOpts
keymap = function(keymap_table, opts)
  if opts
      and (
      opts.cmd
          or opts.mapping_prefix ~= ""
          or opts.mapping_suffix ~= ""
          or opts.decorator ~= nil
      )
  then
    ---@param node string|function|{[number|string]:string|function|table}
    ---@param hooks {on_string:(fun(string):string), on_function:(fun(inner:function):function), on_table:(fun(table):table)}
    ---@return string|function|table
    local function recurse(node, hooks)
      handle_scalar = function(n)
        if type(n) == "string" then
          return hooks.on_string(n)
        elseif type(n) == "function" then
          return hooks.on_function(n)
        end
        return nil
      end
      local mapping = handle_scalar(node)
      if mapping ~= nil then
        -- Keymap without metadata
        return mapping
      elseif node[1] ~= nil then
        -- Keymap with metadata
        node[1] = handle_scalar(node[1])
        return node
      else
        -- KeymapTable
        node = hooks.on_table(node)
        for k, v in pairs(node) do
          if k == "name" then
            goto continue
          end
          node[k] = recurse(v, hooks)
          ::continue::
        end
      end
      return node
    end

    ---@diagnostic disable-next-line: cast-local-type
    keymap_table = recurse(keymap_table, {
      on_string = function(s)
        if opts.mapping_prefix ~= nil then
          s = opts.mapping_prefix .. s
        end
        if opts.mapping_suffix ~= nil then
          s = s .. opts.mapping_suffix
        end
        if opts.cmd then
          s = "<cmd>" .. s .. "<cr>"
        end
        return s
      end,
      on_function = function(f)
        if opts.decorator then
          return opts.decorator(f)
        end
        return f
      end,
      on_table = function(t)
        -- if opts.key_prefix then
        --   new_tbl = {}
        --   for k, v in pairs(t) do
        --     if type(k) == "string" then
        --       new_tbl[opts.key_prefix .. k] = v else
        --       new_tbl[k] = v
        --     end
        --   end
        --   return new_tbl
        -- end
        return t
      end,
    })

    -- Remove extra params
    for k, _ in pairs(opts) do
      if not vim.tbl_contains({ "mode", "prefix", "buffer", "silent", "noremap", "nowait" }, k) then
        opts[k] = nil
      end
    end
  end

  wk.register(keymap_table, opts or {})
end
