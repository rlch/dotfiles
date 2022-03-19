local cmp = require 'cmp'
local lspkind = require 'lspkind'
local luasnip = require 'luasnip'

local cmp_autopairs = require 'nvim-autopairs.completion.cmp'
cmp.event:on('confirm_done', cmp_autopairs.on_confirm_done { map_char = { tex = '' } })

local source_mapping = {
  buffer = '[Buffer]',
  nvim_lsp = '[LSP]',
  nvim_lua = '[Lua]',
  path = '[Path]',
  luasnip = '[Snip]',
  tmux = '[tmux]',
}

vim.o.completeopt = 'menu,menuone,noselect'

cmp.setup {
  snippet = {
    expand = function(args)
      require('luasnip').lsp_expand(args.body)
    end,
  },
  mapping = {
    ['<C-D>'] = cmp.mapping.scroll_docs(-4),
    ['<C-F>'] = cmp.mapping.scroll_docs(4),
    -- ['<C-I>'] = cmp.mapping.complete(),
    ['<C-E>'] = cmp.mapping.close(),
    ['<CR>'] = cmp.mapping.confirm { select = false },
    ['<C-N>'] = cmp.mapping.select_next_item { behavior = cmp.SelectBehavior.Insert },
    ['<C-P>'] = cmp.mapping.select_prev_item { behavior = cmp.SelectBehavior.Insert },
    ['<Tab>'] = cmp.mapping(function(fallback)
      fallback()
    end, { 'i', 'c' }),
    ['<S-Tab>'] = cmp.mapping(function(fallback)
      fallback()
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
    { name = 'nvim_lsp' },
    { name = 'luasnip' },
    { name = 'neorg' },
    { name = 'buffer' },
    { name = 'path' },
    { name = 'tmux' },
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
