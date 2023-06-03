local cmp = require "cmp"
local has_lspkind, lspkind = pcall(require, "lspkind")
local has_snip, luasnip = pcall(require, "luasnip")
-- local has_copilot, copilot_cmp = pcall(require, "copilot_cmp")
-- if has_copilot then
--   copilot_cmp.setup {
--     method = "getCompletionsCycling",
--   }
-- end

local source_mapping = {
  copilot = "(AI)",
  nvim_lsp = "(LSP)",
  buffer = "(Buf)",
  nvim_lsp_document_symbol = "(LSP)",
  nvim_lua = "(Lua)",
  path = "(Path)",
  luasnip = "(Snip)",
  tmux = "(tmux)",
  cmdline = "(cmd)",
  rg = "(rg)",
}

local has_words_before = function()
  if vim.api.nvim_buf_get_option(0, "buftype") == "prompt" then
    return false
  end
  local line, col = unpack(vim.api.nvim_win_get_cursor(0))
  return col ~= 0
    and vim.api.nvim_buf_get_text(0, line - 1, 0, line - 1, col, {})[1]:match "^%s*$"
      == nil
end

local ALL = { "i", "c", "s" }

cmp.setup {
  experimental = {
    ghost_text = false,
  },
  snippet = {
    expand = function(args)
      if has_snip then
        luasnip.lsp_expand(args.body)
      end
    end,
  },
  mapping = {
    ["<C-l>"] = cmp.mapping(function()
      require("copilot.suggestion").accept()
    end),
    -- ["<C-D>"] = cmp.mapping.scroll_docs(-4),
    -- ["<C-F>"] = cmp.mapping.scroll_docs(4),
    ["<C-A>"] = cmp.mapping(function(_)
      cmp.complete()
    end, ALL),
    ["<C-E>"] = cmp.mapping(function(_)
      cmp.close()
    end, ALL),
    ["<CR>"] = cmp.mapping.confirm { select = false },
    ["<C-N>"] = cmp.mapping(function()
      cmp.select_next_item { behavior = cmp.SelectBehavior.Insert }
    end, ALL),
    ["<C-P>"] = cmp.mapping(function()
      cmp.select_prev_item { behavior = cmp.SelectBehavior.Insert }
    end, ALL),
    ["<Tab>"] = cmp.mapping(function(fb)
      if has_snip and luasnip.expand_or_jumpable() then
        luasnip.expand_or_jump()
      elseif cmp.visible() and has_words_before() then
        cmp.confirm { select = true }
        -- cmp.complete()
      else
        fb()
      end
    end, ALL),
    ["<S-Tab>"] = cmp.mapping(function(fallback)
      if has_snip and luasnip.jumpable(-1) then
        luasnip.jump(-1)
      elseif cmp.visible() then
        cmp.confirm { select = false }
      else
        fallback()
      end
    end, { "i", "c" }),
  },
  sources = {
    -- { name = "copilot" },
    { name = "luasnip", priority = 20 },
    { name = "nvim_lsp", priority = 10 },
    { name = "nvim_lsp_signature_help", priority = 6 },
    { name = "buffer", priority = 5 },
    { name = "neorg", priority = 5 },
    { name = "path", priority = 7 },
    { name = "tmux", priority = 3 },
    { name = "rg", priority = 2 },
  },
  formatting = {
    format = lspkind.cmp_format {
      mode = "symbol_text",
      max_width = 25,
      symbol_map = { Copilot = "" },
      before = function(entry, vim_item)
        local replace_icon = function(item)
          if has_lspkind then
            local menu = source_mapping[entry.source.name]
            item.kind = lspkind.presets.default[item.kind]
            item.menu = menu
            return item
          end
          return item
        end

        local constrain = function(item)
          local max_width = 20
          local min_width = 20

          local label = item.abbr
          local truncated_label = vim.fn.strcharpart(label, 0, max_width)
          if truncated_label ~= label then
            item.abbr = truncated_label .. "…"
          elseif string.len(label) < min_width then
            local padding = string.rep(" ", min_width - string.len(label))
            item.abbr = label .. padding
          end
          return item
        end

        return constrain(replace_icon(vim_item))
      end,
    },
  },
  view = {
    entries = { name = "custom" },
  },
}

cmp.setup.cmdline(":", {
  sources = {
    { name = "cmdline" },
    { name = "cmdline_history" },
    { name = "buffer" },
    { name = "nvim_lsp_document_symbol" },
    { name = "rg" },
  },
})

cmp.setup.cmdline("/", {
  sources = {
    { name = "buffer" },
    { name = "nvim_lsp_document_symbol" },
    { name = "rg" },
    { name = "cmdline_history" },
  },
})

-- cmp.event:on("menu_opened", function()
--   vim.b.copilot_suggestion_hidden = true
-- end)
--
-- cmp.event:on("menu_closed", function()
--   vim.b.copilot_suggestion_hidden = false
-- end)
