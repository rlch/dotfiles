local api = vim.api
local cmp = require 'cmp'
local lspkind = require 'lspkind'
local luasnip = require 'luasnip'

local cmp_autopairs = require 'nvim-autopairs.completion.cmp'
cmp.event:on('confirm_done', cmp_autopairs.on_confirm_done { map_char = { tex = '' } })

local function t(str)
  return api.nvim_replace_termcodes(str, true, true, true)
end

local source_mapping = {
  buffer = '[Buffer]',
  nvim_lsp = '[LSP]',
  nvim_lua = '[Lua]',
  path = '[Path]',
  luasnip = '[Snippet]',
}

local function feed(key, mode)
  api.nvim_feedkeys(t(key), mode or '', true)
end

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
    ['<C-I>'] = cmp.mapping.complete(),
    ['<C-E>'] = cmp.mapping.close(),
    ['<CR>'] = cmp.mapping.confirm { select = true },
    ['<C-N>'] = cmp.mapping.select_next_item { behavior = cmp.SelectBehavior.Insert },
    ['<C-P>'] = cmp.mapping.select_prev_item { behavior = cmp.SelectBehavior.Insert },
    ['<Tab>'] = cmp.mapping(function(fallback)
      if luasnip.expand_or_locally_jumpable() then
        luasnip.expand_or_jump()
      elseif api.nvim_get_mode().mode == 'c' then
        fallback()
      else
        feed '<Plug>(Tabout)'
      end
    end, {
      'i',
      'c',
    }),
    ['<S-Tab>'] = cmp.mapping(function(fallback)
      if luasnip.jumpable(-1) then
        luasnip.jump(-1)
      elseif api.nvim_get_mode().mode == 'c' then
        fallback()
      else
        feed '<Plug>(TaboutBack)'
      end
    end, {
      'i',
      'c',
    }),
  },
  sources = {
    { name = 'nvim_lsp' },
    { name = 'luasnip' },
    { name = 'neorg' },
    { name = 'buffer' },
    { name = 'path' },
  },
  formatting = {
    format = function(entry, vim_item)
      vim_item.kind = lspkind.presets.default[vim_item.kind]
      local menu = source_mapping[entry.source.name]
      --[[ if entry.source.name == 'cmp_tabnine' then
        if entry.completion_item.data ~= nil and entry.completion_item.data.detail ~= nil then
          menu = entry.completion_item.data.detail .. ' ' .. menu
        end
        vim_item.kind = ''
      end ]]
      vim_item.menu = menu
      return vim_item
    end,
  },
}
