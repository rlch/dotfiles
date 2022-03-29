local cmp = require 'cmp'
local lspkind = require 'lspkind'
local luasnip = require 'luasnip'

local cmp_autopairs = require 'nvim-autopairs.completion.cmp'
cmp.event:on('confirm_done', cmp_autopairs.on_confirm_done { map_char = { tex = '' } })

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

vim.o.completeopt = 'menu,menuone,noselect'
local has_words_before = function()
  local line, col = unpack(vim.api.nvim_win_get_cursor(0))
  return col ~= 0 and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match '%s' == nil
end

cmp.setup {
  snippet = {
    expand = function(args)
      require('luasnip').lsp_expand(args.body)
    end,
  },
  mapping = {
    ['<C-D>'] = cmp.mapping.scroll_docs(-4),
    ['<C-F>'] = cmp.mapping.scroll_docs(4),
    ['<C-A>'] = cmp.mapping.complete(),
    ['<C-E>'] = cmp.mapping.close(),
    ['<CR>'] = cmp.mapping.confirm { select = false },
    ['<C-N>'] = cmp.mapping.select_next_item { behavior = cmp.SelectBehavior.Insert },
    ['<C-P>'] = cmp.mapping.select_prev_item { behavior = cmp.SelectBehavior.Insert },
    ['<Tab>'] = cmp.mapping(function(fallback)
      if luasnip.expand_or_jumpable() then
        luasnip.expand_or_jump()
      elseif has_words_before() then
        cmp.complete()
      else
        fallback()
      end
    end, { 'i', 'c' }),
    ['<S-Tab>'] = cmp.mapping(function(fallback)
      if luasnip.jumpable(-1) then
        luasnip.jump(-1)
      else
        fallback()
      end
    end, { 'i', 'c' }),
    ['<C-j>'] = cmp.mapping(function(_)
      if luasnip.expand_or_jumpable() then
        luasnip.expand_or_jump()
      end
    end, { 'i', 'c' }),
    ['<C-k>'] = cmp.mapping(function(_)
      if luasnip.jumpable(-1) then
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
  },
  formatting = {
    format = function(entry, vim_item)
      local menu = source_mapping[entry.source.name]
      vim_item.kind = lspkind.presets.default[vim_item.kind]
      vim_item.menu = menu
      return vim_item
    end,
  },
}

cmp.setup.cmdline(':', {
  sources = {
    { name = 'cmdline' },
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
  },
})
