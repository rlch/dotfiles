local function augroup(name)
  return vim.api.nvim_create_augroup("dotfiles_" .. name, { clear = true })
end

-- GraphQL goto definition
local function setup_graphql_gd(buf)
  vim.keymap.set("n", "gd", function()
    local word = vim.fn.expand("<cword>")
    if word == "" then
      return
    end

    -- Search for GraphQL definitions using word boundaries
    local result = vim.fn.system({
      "grep",
      "-rn",
      "--include=*.graphql",
      "-E",
      string.format("(type|input|enum|interface|scalar|union) %s\\b", word),
      ".",
    })

    if vim.v.shell_error == 0 and result ~= "" then
      -- Parse the first match (format: filename:line:content)
      local parts = vim.split(result, "\n")[1]
      local file_line = vim.split(parts, ":")
      if #file_line >= 2 then
        local filename = file_line[1]
        local line_num = tonumber(file_line[2]) or 1
        vim.cmd("edit " .. filename)
        vim.api.nvim_win_set_cursor(0, { line_num, 0 })
      end
    else
      vim.notify("Definition for '" .. word .. "' not found", vim.log.levels.WARN)
    end
  end, { buffer = buf, desc = "Go to GraphQL type definition" })
end

vim.api.nvim_create_autocmd("FileType", {
  group = augroup("graphql_goto_definition"),
  pattern = "graphql",
  callback = function(event)
    setup_graphql_gd(event.buf)
  end,
})

vim.api.nvim_create_autocmd("BufEnter", {
  group = augroup("graphql_goto_definition"),
  pattern = "*.graphql",
  callback = function(event)
    if vim.bo[event.buf].filetype == "graphql" then
      setup_graphql_gd(event.buf)
    end
  end,
})