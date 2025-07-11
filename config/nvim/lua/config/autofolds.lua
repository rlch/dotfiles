-- Auto-folding system using TreeSitter
local tsutils = require("nvim-treesitter.ts_utils")
local lazyutil = require("lazyvim.util")
---@module "vim.treesitter"
local ts = vim.treesitter

---@alias FoldTextFunction fun(lines: string[], captures: table<string, string>): string|any[]

---@class FoldPatternConfig
---@field query string TreeSitter query string
---@field start_padding? integer Optional padding for fold start line
---@field end_padding? integer Optional padding for fold end line
---@field fold_text? string|FoldTextFunction Optional custom text to display when folded, or function that takes lines array

---@class FoldRange
---@field start_line integer Starting line of the fold
---@field end_line integer Ending line of the fold
---@field pattern_config FoldPatternConfig Configuration for the fold pattern
---@field captures table<string, string> Captured variables from the TreeSitter query

-- Fold pattern definitions
---@type table<string, table<string, FoldPatternConfig>>
local fold_patterns = {
  go = {
    otel = {
      query = [[
        (
          (short_var_declaration) @start (#match? @start "otel\\.GetTracerProvider")
          .
          (defer_statement) @end
        )
      ]],
      start_padding = -1, -- Include line before the assignment
      fold_text = "<span>",
    },
    error_handling = {
      query = [[
        (
          if_statement
            condition: (binary_expression
                         left: (identifier) @err
                         right: (nil)) (#eq? @err "err")
            consequence: (block
                           (return_statement
                             (expression_list
                               (_) @return
                               (_) @errReturn))) (#match? @errReturn "err")

            !initializer
            !alternative
          ) @start
      ]],
      start_padding = -1,
      end_padding = 0,
      fold_text = function(_, captures)
        return {
          { " ? ", "ErrorMsg" },
          { "{ " .. captures["return"] .. ", " .. captures["errReturn"] .. " }", "Comment" },
        }
      end,
    },
  },
}

-- Track auto-created fold ranges per buffer with their pattern configs
---@type table<integer, FoldRange[]>
local auto_fold_ranges = {}

-- Virtual text namespace for fold indicators
local fold_ns = vim.api.nvim_create_namespace("auto_fold_virtual_text")

-- Function to create virtual text for a fold (only when closed)
---@param bufnr integer Buffer number
---@param range FoldRange The fold range containing all necessary information
local function create_fold_virtual_text(bufnr, range)
  if range.pattern_config.fold_text == nil then
    return
  end

  -- Check if the fold is actually closed
  local fold_closed = vim.fn.foldclosed(range.start_line) ~= -1

  if not fold_closed then
    return -- Don't show virtual text if fold is open
  end

  -- Get all lines in the fold
  local lines = vim.api.nvim_buf_get_lines(bufnr, range.start_line - 1, range.end_line, false)

  -- Generate virtual text based on fold_text type
  local virtual_text
  if type(range.pattern_config.fold_text) == "function" then
    virtual_text = range.pattern_config.fold_text(lines, range.captures)
  elseif type(range.pattern_config.fold_text) == "string" then
    virtual_text = range.pattern_config.fold_text
  end

  if not virtual_text or virtual_text == "" then
    return
  end

  local virt_text_table
  if type(virtual_text) == "table" then
    virt_text_table = virtual_text
  elseif type(virtual_text) == "string" then
    virt_text_table = { { " " .. virtual_text, "Comment" } }
  else
    return
  end

  -- Set virtual text at the end of the line to avoid interfering with syntax highlighting
  vim.api.nvim_buf_set_extmark(bufnr, fold_ns, range.start_line - 1, -1, {
    virt_text = virt_text_table,
    virt_text_pos = "inline", -- eol misbehaves with fold text
  })
end

-- Track fold states to avoid unnecessary updates
local fold_states = {}

-- Function to update virtual text based on fold state
local function update_fold_virtual_text(force)
  local bufnr = vim.api.nvim_get_current_buf()
  local ranges = auto_fold_ranges[bufnr]

  if not ranges then
    return
  end

  -- Check if fold states have changed
  local current_fold_states = {}
  for _, range in ipairs(ranges) do
    local fold_closed = vim.fn.foldclosed(range.start_line) ~= -1
    current_fold_states[range.start_line] = fold_closed
  end

  -- Compare with previous states (skip if force is true)
  if not force and fold_states[bufnr] then
    local states_changed = false

    -- Check if number of folds changed
    local old_count = 0
    for _ in pairs(fold_states[bufnr]) do
      old_count = old_count + 1
    end

    local new_count = 0
    for _ in pairs(current_fold_states) do
      new_count = new_count + 1
    end

    if old_count ~= new_count then
      states_changed = true
    else
      -- Check if states changed for existing folds
      for line, state in pairs(current_fold_states) do
        if fold_states[bufnr][line] ~= state then
          states_changed = true
          break
        end
      end

      -- Also check for removed folds
      if not states_changed then
        for line, _ in pairs(fold_states[bufnr]) do
          if current_fold_states[line] == nil then
            states_changed = true
            break
          end
        end
      end
    end

    if not states_changed then
      return
    end
  end

  -- Update stored states
  fold_states[bufnr] = current_fold_states

  -- Clear existing virtual text
  vim.api.nvim_buf_clear_namespace(bufnr, fold_ns, 0, -1)

  -- Get current fold patterns for this buffer
  local filetype = vim.bo[bufnr].filetype
  local patterns = fold_patterns[filetype]

  if not patterns then
    return
  end

  -- Recreate virtual text for closed folds
  for _, range in ipairs(ranges) do
    create_fold_virtual_text(bufnr, range)
  end
end

-- Generic function to create fold levels from TreeSitter patterns
local function create_fold_levels_for_lang(bufnr, lang)
  local patterns = fold_patterns[lang]
  if not patterns then
    return {}
  end

  local parser = ts.get_parser(bufnr, lang)
  if not parser then
    return {}
  end

  local tree = parser:parse()[1]
  local all_levels = {}

  -- Initialize auto fold ranges for this buffer
  auto_fold_ranges[bufnr] = {}

  -- Clear existing virtual text
  vim.api.nvim_buf_clear_namespace(bufnr, fold_ns, 0, -1)

  -- Process each fold pattern for this language
  for _, pattern_config in pairs(patterns) do
    local query = ts.query.parse(lang, pattern_config.query)

    for _, match in query:iter_matches(tree:root(), bufnr, 0, -1) do
      local captures = {}
      local start_line, end_line = nil, nil

      -- Process all captures in this match
      for id, nodes in pairs(match) do
        local name = query.captures[id]
        for _, node in ipairs(nodes) do
          local start_row, _, end_row, _ = node:range()

          local node_text = ts.get_node_text(node, bufnr)
          captures[name] = node_text

          if name == "start" then
            start_line = start_row + 1
            end_line = end_row + 1 -- Single-node pattern assumption
          elseif name == "end" then
            end_line = end_row + 1
          end
        end
      end

      -- Create fold range for this match
      if start_line and end_line then
        -- Apply padding
        local start_padding = pattern_config.start_padding or 0
        local end_padding = pattern_config.end_padding or 0

        local fold_start = math.max(1, start_line + start_padding)
        local fold_end = end_line + end_padding

        -- Track this as an auto-created fold range with pattern config and captures
        table.insert(auto_fold_ranges[bufnr], {
          start_line = fold_start,
          end_line = fold_end,
          pattern_config = pattern_config,
          captures = captures,
        })

        -- Set fold levels for this range
        all_levels[fold_start] = ">1" -- Start fold
        for line = fold_start + 1, fold_end - 1 do
          all_levels[line] = "1" -- Inside fold
        end
        all_levels[fold_end] = "<1" -- End fold
      end
    end
  end

  return all_levels
end

-- Memoized fold level computation
local auto_fold_levels = tsutils.memoize_by_buf_tick(function(bufnr)
  local filetype = vim.bo[bufnr].filetype
  return create_fold_levels_for_lang(bufnr, filetype)
end)

-- Global fold expression function
function _G.auto_foldexpr()
  local bufnr = vim.api.nvim_get_current_buf()
  local lnum = vim.v.lnum
  local levels = auto_fold_levels(bufnr)
  return levels[lnum] or lazyutil.ui.foldexpr()
end

-- Function to close only auto-created folds
local function close_auto_folds()
  local bufnr = vim.api.nvim_get_current_buf()
  local ranges = auto_fold_ranges[bufnr]

  if not ranges then
    return
  end

  for _, range in ipairs(ranges) do
    -- Close the specific fold range
    pcall(vim.cmd, string.format("%d,%dfoldclose", range.start_line, range.end_line))
  end
end

-- Create augroup helper
local function augroup(name)
  return vim.api.nvim_create_augroup("autofolds_" .. name, { clear = true })
end

-- Setup auto-folding for supported filetypes
local function setup_auto_folding()
  local supported_filetypes = vim.tbl_keys(fold_patterns)
  local patterns = {}

  for _, ft in ipairs(supported_filetypes) do
    table.insert(patterns, "*." .. ft)
  end

  vim.api.nvim_create_autocmd({ "BufReadPost", "BufWinEnter", "FileType", "BufWritePost" }, {
    group = augroup("auto_folding"),
    pattern = patterns,
    callback = function()
      local filetype = vim.bo.filetype
      if fold_patterns[filetype] then
        vim.opt_local.foldmethod = "expr"
        vim.opt_local.foldexpr = "v:lua.auto_foldexpr()"

        -- Auto-close only our custom folds after a short delay
        vim.defer_fn(function()
          close_auto_folds()
          -- Update virtual text after folds are closed (force update)
          update_fold_virtual_text(true)
        end, 200)
      end
    end,
  })

  -- Override fold commands to update virtual text
  local function setup_fold_keymaps()
    local function wrap_fold_command(key, command)
      vim.keymap.set("n", key, function()
        vim.cmd(command)
        -- Force update virtual text to reflect fold state changes
        update_fold_virtual_text(true)
      end, { buffer = true, desc = "Fold command with virtual text update" })
    end

    -- Common fold commands
    wrap_fold_command("zo", "normal! zo") -- Open fold
    wrap_fold_command("zc", "normal! zc") -- Close fold
    wrap_fold_command("za", "normal! za") -- Toggle fold
    wrap_fold_command("zO", "normal! zO") -- Open all folds recursively
    wrap_fold_command("zC", "normal! zC") -- Close all folds recursively
    wrap_fold_command("zA", "normal! zA") -- Toggle all folds recursively
    wrap_fold_command("zR", "normal! zR") -- Open all folds
    wrap_fold_command("zM", "normal! zM") -- Close all folds
    wrap_fold_command("zr", "normal! zr") -- Reduce fold level
    wrap_fold_command("zm", "normal! zm") -- Increase fold level
  end

  -- Set up fold keymaps for supported filetypes
  vim.api.nvim_create_autocmd({ "BufReadPost", "BufWinEnter", "FileType", "CursorMoved", "CursorMovedI" }, {
    group = augroup("fold_keymaps"),
    pattern = patterns,
    callback = function()
      local filetype = vim.bo.filetype
      if fold_patterns[filetype] then
        setup_fold_keymaps()
      end
      update_fold_virtual_text(false)
    end,
  })
end

-- Initialize the auto-folding system
setup_auto_folding()
