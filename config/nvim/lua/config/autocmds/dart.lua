local function augroup(name)
  return vim.api.nvim_create_augroup("dotfiles_" .. name, { clear = true })
end

-- Disable autoformat for Dart files
vim.api.nvim_create_autocmd("FileType", {
  group = augroup("dart_no_autoformat"),
  pattern = "dart",
  callback = function()
    vim.b.autoformat = false
  end,
})

-- Dart color support
local function get_dartls_client()
  for _, client in pairs(vim.lsp.get_clients()) do
    if client.name == "dartls" then
      return client
    end
  end
  return nil
end

local function document_color()
  local params = {
    textDocument = vim.lsp.util.make_text_document_params(),
  }
  local client = get_dartls_client()
  if client and client.server_capabilities.colorProvider then
    client.request("textDocument/documentColor", params, function(err, result, ctx)
      if err or not result then
        return
      end
      -- Clear previous colors
      local ns = vim.api.nvim_create_namespace("dart_document_color")
      vim.api.nvim_buf_clear_namespace(ctx.bufnr, ns, 0, -1)
      -- Apply new colors
      for _, color_info in ipairs(result) do
        local rgba = color_info.color
        local range = color_info.range
        local r = math.floor(rgba.red * 255)
        local g = math.floor(rgba.green * 255)
        local b = math.floor(rgba.blue * 255)
        local hex = string.format("#%02x%02x%02x", r, g, b)
        -- Create highlight group
        local hl_name = "DartColor" .. r .. g .. b
        vim.api.nvim_set_hl(0, hl_name, { fg = hex })
        -- Apply virtual text
        vim.api.nvim_buf_set_extmark(ctx.bufnr, ns, range["end"].line, range["end"].character, {
          virt_text = { { " ◉", hl_name } },
          virt_text_pos = "inline",
        })
      end
    end, 0)
  end
end

-- Dart closing labels/tags
local closing_labels_ns = vim.api.nvim_create_namespace("dart_closing_labels")

local function render_closing_labels(labels)
  vim.api.nvim_buf_clear_namespace(0, closing_labels_ns, 0, -1)
  for _, item in ipairs(labels) do
    local line = tonumber(item.range["end"].line)
    if line <= vim.api.nvim_buf_line_count(0) then
      vim.api.nvim_buf_set_extmark(0, closing_labels_ns, line, -1, {
        virt_text = { { "⇠ " .. item.label, "LspInlayHint" } },
        virt_text_pos = "eol",
        hl_mode = "combine",
        priority = 10,
      })
    end
  end
end

local function closing_labels_handler(err, result, _)
  if err or not result then
    return
  end
  local uri = result.uri
  if uri ~= vim.uri_from_bufnr(0) then
    return
  end
  local labels = result.labels or {}
  render_closing_labels(labels)
end

local function setup_closing_labels_handler(client)
  client.handlers["dart/textDocument/publishClosingLabels"] = closing_labels_handler
end

-- Dart colors
vim.api.nvim_create_autocmd("LspAttach", {
  group = augroup("dart_color"),
  pattern = "*.dart",
  callback = function(event)
    local client = vim.lsp.get_client_by_id(event.data.client_id)
    if client and client.name == "dartls" then
      -- Set up autocmds for color updates
      vim.api.nvim_create_autocmd({ "TextChanged", "TextChangedI", "InsertLeave" }, {
        group = augroup("dart_color_update"),
        buffer = event.buf,
        callback = function()
          vim.defer_fn(document_color, 500) -- Debounce updates
        end,
      })

      -- Initial color request
      vim.defer_fn(document_color, 1000)
    end
  end,
})

-- Dart closing labels
vim.api.nvim_create_autocmd("LspAttach", {
  group = augroup("dart_closing_labels"),
  pattern = "*.dart",
  callback = function(event)
    local client = vim.lsp.get_client_by_id(event.data.client_id)
    if client and client.name == "dartls" then
      -- Set up handler for published closing labels
      setup_closing_labels_handler(client)
    end
  end,
})
