local cmp = require 'cmp'
local has_lspkind, lspkind = pcall(require, 'lspkind')
local has_snip, luasnip = pcall(require, 'luasnip')

local source_mapping = {
  buffer = '[Buf]',
  nvim_lsp = '[LSP]',
  nvim_lua = '[Lua]',
  path = '[Path]',
  luasnip = '[Snip]',
  tmux = '[tmux]',
  cmdline = '[cmd]',
  nvim_lsp_document_symbol = '[LSP]',
  rg = '[rg]',
}

if has_snip then
  source_mapping['luasnip'] = '[Snip]'
end

local has_words_before = function()
  local line, col = unpack(vim.api.nvim_win_get_cursor(0))
  return col ~= 0
    and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]
        :sub(col, col)
        :match '%s'
      == nil
end

local ALL = { 'i', 'c', 's' }

cmp.setup {
  snippet = {
    expand = function(args)
      if has_snip then
        luasnip.lsp_expand(args.body)
      end
    end,
  },
  mapping = {
    ['<C-D>'] = cmp.mapping.scroll_docs(-4),
    ['<C-F>'] = cmp.mapping.scroll_docs(4),
    ['<C-A>'] = cmp.mapping(function(_)
      cmp.complete()
    end, ALL),
    ['<C-E>'] = cmp.mapping(function(_)
      cmp.close()
    end, ALL),
    ['<CR>'] = cmp.mapping.confirm { select = false },
    ['<C-N>'] = cmp.mapping(function()
      cmp.select_next_item { behavior = cmp.SelectBehavior.Insert }
    end, ALL),
    ['<C-P>'] = cmp.mapping(function()
      cmp.select_prev_item { behavior = cmp.SelectBehavior.Insert }
    end, ALL),
    ['<Tab>'] = cmp.mapping(function(fb)
      if has_snip and luasnip.expand_or_jumpable() then
        luasnip.expand_or_jump()
      elseif cmp.visible() then
        cmp.confirm { select = false }
      elseif has_words_before() then
        cmp.complete()
      else
        fb()
      end
    end, ALL),
    ['<S-Tab>'] = cmp.mapping(function(fallback)
      if has_snip and luasnip.jumpable(-1) then
        luasnip.jump(-1)
      elseif cmp.visible() then
        cmp.confirm { select = false }
      else
        fallback()
      end
    end, { 'i', 'c' }),
    ['<C-j>'] = cmp.mapping(function(_)
      if has_snip and luasnip.expand_or_locally_jumpable() then
        luasnip.expand_or_jump()
      end
    end, { 'i', 'c' }),
    ['<C-k>'] = cmp.mapping(function(_)
      if has_snip and luasnip.jumpable(-1) then
        luasnip.jump(-1)
      end
    end, { 'i', 'c' }),
  },
  sources = {
    { name = 'luasnip' },
    { name = 'nvim_lsp' },
    { name = 'neorg' },
    { name = 'buffer' },
    { name = 'path' },
    { name = 'tmux' },
    { name = 'rg' },
    { name = 'nvim_lsp_signature_help' },
  },
  formatting = {
    format = function(entry, vim_item)
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
          item.abbr = truncated_label .. '…'
        elseif string.len(label) < min_width then
          local padding = string.rep(' ', min_width - string.len(label))
          item.abbr = label .. padding
        end
        return item
      end

      return constrain(replace_icon(vim_item))
    end,
  },
}

cmp.setup.cmdline(':', {
  sources = {
    { name = 'cmdline' },
    { name = 'cmdline_history' },
    { name = 'buffer' },
    { name = 'nvim_lsp_document_symbol' },
    { name = 'rg' },
  },
})

cmp.setup.cmdline('/', {
  sources = {
    { name = 'buffer' },
    { name = 'nvim_lsp_document_symbol' },
    { name = 'rg' },
    { name = 'cmdline_history' },
  },
})
