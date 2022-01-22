require'bufferline'.setup {
  options = {
    close_command = "bdelete! %d",
    right_mouse_command = "bdelete! %d",
    left_mouse_command = "buffer %d",
    middle_mouse_command = nil,
    -- NOTE: this plugin is designed with this icon in mind,
    -- and so changing this is NOT recommended, this is intended
    -- as an escape hatch for people who cannot bear it for whatever reason
    indicator_icon = '▎',
    buffer_close_icon = '',
    modified_icon = '●',
    close_icon = '',
    left_trunc_marker = '',
    right_trunc_marker = '',
    --- name_formatter can be used to change the buffer's label in the bufferline.
    --- Please note some names can/will break the
    --- bufferline so use this at your discretion knowing that it has
    --- some limitations that will *NOT* be fixed.
    name_formatter = function(buf)  -- buf contains a "name", "path" and "bufnr"
      -- remove extension from markdown files for example
      if buf.name:match('%.md') then
        return vim.fn.fnamemodify(buf.name, ':t:r')
      end
    end,
    max_name_length = 18,
    max_prefix_length = 15, -- prefix used when a buffer is de-duplicated
    tab_size = 18,
    diagnostics = "nvim_lsp",
    diagnostics_update_in_insert = false,
    diagnostics_indicator = function(count, level, diagnostics_dict, context)
      return "("..count..")"
    end,
    offsets = {
      { filetype = "NvimTree", text = "Files", text_align = "center" },
      { filetype = "Flutter Outline", text = "Flutter Outline", text_align = "center" },
    },
    show_buffer_icons = true,
    show_buffer_close_icons = true,
    show_close_icon = true,
    show_tab_indicators = true,
    persist_buffer_sort = true,
    groups = {
      options = {
        toggle_hidden_on_enter = true -- when you re-enter a hidden group this options re-opens that group so the buffer is visible
      },
      items = {
        {
          name = "Tests", -- Mandatory
          highlight = {gui = "underline", guisp = "blue"}, -- Optional
          priority = 2, -- determines where it will appear relative to other groups (Optional)
          icon = "", -- Optional
          matcher = function(buf) -- Mandatory
            return buf.filename:match('%_test') or buf.filename:match('%_spec')
          end,
        },
        {
          name = "Docs",
          highlight = {gui = "undercurl", guisp = "green"},
          auto_close = false,  -- whether or not close this group if it doesn't contain the current buffer
          matcher = function(buf)
            return buf.filename:match('%.md') or buf.filename:match('%.txt')
          end,
          --[[ separator = { -- Optional
            style = require('bufferline.groups').separator.tab
          }, ]]
        },
        {
          name = "Screens",
          -- highlight = {gui = "undercurl", guisp = "green"},
          auto_close = false,  -- whether or not close this group if it doesn't contain the current buffer
          matcher = function(buf)
            return buf.path:match('screens/')
          end,
        },
        {
          name = "Widgets",
          -- highlight = {gui = "undercurl", guisp = "green"},
          auto_close = false,  -- whether or not close this group if it doesn't contain the current buffer
          matcher = function(buf)
            return buf.path:match('widgets/')
          end,
        },
        {
          name = "CF",
          -- highlight = {gui = "undercurl", guisp = "green"},
          auto_close = false,  -- whether or not close this group if it doesn't contain the current buffer
          matcher = function(buf)
            return buf.path:match('functions/')
          end,
        },
      }
    },
    custom_filter = function(buf_number)
      local name = vim.fn.bufname(buf_number)
      if name ~= '' and name ~= '__FLUTTER_DEV_LOG__' and name ~= '.' then
        return true
      end
    end,
    -- can also be a table containing 2 custom separators
    -- [focused and unfocused]. eg: { '|', '|' }
    -- separator_style = "slant" | "thick" | "thin" | { 'any', 'any' },
    --[[ sort_by = function(buffer_a, buffer_b)
      return buffer_a.modified > buffer_b.modified
    end ]]
  }
}
