-- Automatically generated packer.nvim plugin loader code

if vim.api.nvim_call_function('has', {'nvim-0.5'}) ~= 1 then
  vim.api.nvim_command('echohl WarningMsg | echom "Invalid Neovim version for packer.nvim! | echohl None"')
  return
end

vim.api.nvim_command('packadd packer.nvim')

local no_errors, error_msg = pcall(function()

  local time
  local profile_info
  local should_profile = true
  if should_profile then
    local hrtime = vim.loop.hrtime
    profile_info = {}
    time = function(chunk, start)
      if start then
        profile_info[chunk] = hrtime()
      else
        profile_info[chunk] = (hrtime() - profile_info[chunk]) / 1e6
      end
    end
  else
    time = function(chunk, start) end
  end
  
local function save_profiles(threshold)
  local sorted_times = {}
  for chunk_name, time_taken in pairs(profile_info) do
    sorted_times[#sorted_times + 1] = {chunk_name, time_taken}
  end
  table.sort(sorted_times, function(a, b) return a[2] > b[2] end)
  local results = {}
  for i, elem in ipairs(sorted_times) do
    if not threshold or threshold and elem[2] > threshold then
      results[i] = elem[1] .. ' took ' .. elem[2] .. 'ms'
    end
  end

  _G._packer = _G._packer or {}
  _G._packer.profile_output = results
end

time([[Luarocks path setup]], true)
local package_path_str = "/Users/rjm/.cache/nvim/packer_hererocks/2.1.0-beta3/share/lua/5.1/?.lua;/Users/rjm/.cache/nvim/packer_hererocks/2.1.0-beta3/share/lua/5.1/?/init.lua;/Users/rjm/.cache/nvim/packer_hererocks/2.1.0-beta3/lib/luarocks/rocks-5.1/?.lua;/Users/rjm/.cache/nvim/packer_hererocks/2.1.0-beta3/lib/luarocks/rocks-5.1/?/init.lua"
local install_cpath_pattern = "/Users/rjm/.cache/nvim/packer_hererocks/2.1.0-beta3/lib/lua/5.1/?.so"
if not string.find(package.path, package_path_str, 1, true) then
  package.path = package.path .. ';' .. package_path_str
end

if not string.find(package.cpath, install_cpath_pattern, 1, true) then
  package.cpath = package.cpath .. ';' .. install_cpath_pattern
end

time([[Luarocks path setup]], false)
time([[try_loadstring definition]], true)
local function try_loadstring(s, component, name)
  local success, result = pcall(loadstring(s), name, _G.packer_plugins[name])
  if not success then
    vim.schedule(function()
      vim.api.nvim_notify('packer.nvim: Error running ' .. component .. ' for ' .. name .. ': ' .. result, vim.log.levels.ERROR, {})
    end)
  end
  return result
end

time([[try_loadstring definition]], false)
time([[Defining packer_plugins]], true)
_G.packer_plugins = {
  CamelCaseMotion = {
    config = { "require('config.camelcasemotion')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/CamelCaseMotion",
    url = "https://github.com/bkad/CamelCaseMotion"
  },
  Colorizer = {
    config = { "\27LJ\2\nh\0\0\2\0\5\0\t6\0\0\0009\0\1\0'\1\3\0=\1\2\0006\0\0\0009\0\1\0)\1\1\0=\1\4\0K\0\1\0\31colorizer_disable_bufleave\blog\28colorizer_auto_filetype\6g\bvim\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/Colorizer",
    url = "https://github.com/chrisbra/Colorizer"
  },
  ["Comment.nvim"] = {
    config = { "\27LJ\2\n5\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\fComment\frequire\0" },
    loaded = false,
    needs_bufread = false,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/Comment.nvim",
    url = "https://github.com/numToStr/Comment.nvim"
  },
  LuaSnip = {
    config = { "require('config.luasnip')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/LuaSnip",
    url = "https://github.com/L3MON4D3/LuaSnip"
  },
  aniseed = {
    after = { "conjure" },
    config = { "\27LJ\2\nU\0\0\3\0\3\0\0056\0\0\0009\0\1\0'\2\2\0B\0\2\1K\0\1\0006            let g:aniseed#env = v:true\n          \bcmd\bvim\0" },
    loaded = false,
    needs_bufread = true,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/aniseed",
    url = "https://github.com/Olical/aniseed"
  },
  ["bufresize.nvim"] = {
    config = { "\27LJ\2\n;\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\14bufresize\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/bufresize.nvim",
    url = "https://github.com/kwkarlwang/bufresize.nvim"
  },
  ["cmp-buffer"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-buffer",
    url = "https://github.com/hrsh7th/cmp-buffer"
  },
  ["cmp-cmdline"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-cmdline",
    url = "https://github.com/hrsh7th/cmp-cmdline"
  },
  ["cmp-git"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-git",
    url = "https://github.com/petertriho/cmp-git"
  },
  ["cmp-nvim-lsp"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-nvim-lsp",
    url = "https://github.com/hrsh7th/cmp-nvim-lsp"
  },
  ["cmp-nvim-lsp-document-symbol"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-nvim-lsp-document-symbol",
    url = "https://github.com/hrsh7th/cmp-nvim-lsp-document-symbol"
  },
  ["cmp-path"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-path",
    url = "https://github.com/hrsh7th/cmp-path"
  },
  ["cmp-rg"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-rg",
    url = "https://github.com/lukas-reineke/cmp-rg"
  },
  ["cmp-tmux"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-tmux",
    url = "https://github.com/andersevenrud/cmp-tmux"
  },
  cmp_luasnip = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp_luasnip",
    url = "https://github.com/saadparwaiz1/cmp_luasnip"
  },
  colorscheme = {
    after = { "lualine.nvim", "todo-comments.nvim" },
    loaded = true,
    only_config = true
  },
  conjure = {
    config = { "\27LJ\2\n±\3\0\0\3\0\3\0\0056\0\0\0009\0\1\0'\2\2\0B\0\2\1K\0\1\0ë\3            let g:conjure#filetypes = [\n            \\'clojure',\n            \\'fennel',\n            \\'janet',\n            \\'racket',\n            \\'scheme',\n            \\'scm',\n            \\'hy',\n            \\'lisp'\n            \\]\n            let g:conjure#client#fennel#aniseed#aniseed_module_prefix = \"aniseed.\"\n            let g:conjure#filetype#fennel = \"conjure.client.fennel.stdio\"\n          \bcmd\bvim\0" },
    load_after = {
      aniseed = true
    },
    loaded = false,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/conjure",
    url = "https://github.com/Olical/conjure"
  },
  ["copilot.vim"] = {
    config = { "require('config.copilot')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/copilot.vim",
    url = "https://github.com/github/copilot.vim"
  },
  ["dart-vim-plugin"] = {
    config = { "require('config.dart-vim-plugin')" },
    load_after = {},
    loaded = true,
    needs_bufread = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/dart-vim-plugin",
    url = "https://github.com/dart-lang/dart-vim-plugin"
  },
  ["dial.nvim"] = {
    config = { "require('config.dial')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/dial.nvim",
    url = "https://github.com/monaqa/dial.nvim"
  },
  ["diffview.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/diffview.nvim",
    url = "https://github.com/sindrets/diffview.nvim"
  },
  ["dim.lua"] = {
    config = { "\27LJ\2\n5\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\bdim\frequire\0" },
    load_after = {},
    loaded = true,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/dim.lua",
    url = "https://github.com/narutoxy/dim.lua"
  },
  ["dressing.nvim"] = {
    config = { "\27LJ\2\nY\0\0\4\0\6\0\t6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\4\0005\3\3\0=\3\5\2B\0\2\1K\0\1\0\ninput\1\0\0\1\0\1\rwinblend\3\0\nsetup\rdressing\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/dressing.nvim",
    url = "https://github.com/stevearc/dressing.nvim"
  },
  ["fennel.vim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/fennel.vim",
    url = "https://github.com/bakpakin/fennel.vim"
  },
  ["flutter-tools.nvim"] = {
    after = { "dart-vim-plugin" },
    loaded = true,
    only_config = true
  },
  ["friendly-snippets"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/friendly-snippets",
    url = "https://github.com/rafamadriz/friendly-snippets"
  },
  ["git-conflict.nvim"] = {
    config = { "\27LJ\2\n¥\2\0\0\4\0\t\0\r6\0\0\0009\0\1\0'\2\2\0B\0\2\0016\0\3\0'\2\4\0B\0\2\0029\0\5\0005\2\6\0005\3\a\0=\3\b\2B\0\2\1K\0\1\0\15highlights\1\0\2\rincoming\25ConflictMarkerTheirs\fcurrent\23ConflictMarkerOurs\1\0\1\24disable_diagnostics\2\nsetup\17git-conflict\frequire{          highlight ConflictMarkerOurs guibg=#2e5049\n          highlight ConflictMarkerTheirs guibg=#344f69\n          \bcmd\bvim\0" },
    loaded = false,
    needs_bufread = false,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/git-conflict.nvim",
    url = "https://github.com/akinsho/git-conflict.nvim"
  },
  ["github-notifications.nvim"] = {
    config = { "require('config.github-notifications')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/github-notifications.nvim",
    url = "/Users/rjm/Coding/Personal/github-notifications.nvim"
  },
  ["gitsigns.nvim"] = {
    config = { "\27LJ\2\n_\0\0\3\0\a\0\n6\0\0\0009\0\1\0'\1\3\0=\1\2\0006\0\4\0'\2\5\0B\0\2\0029\0\6\0B\0\1\1K\0\1\0\nsetup\rgitsigns\frequire\vauto:1\15signcolumn\awo\bvim\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/gitsigns.nvim",
    url = "https://github.com/lewis6991/gitsigns.nvim"
  },
  ["go.nvim"] = {
    config = { "\27LJ\2\n0\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\ago\frequire\0" },
    loaded = false,
    needs_bufread = false,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/go.nvim",
    url = "https://github.com/ray-x/go.nvim"
  },
  ["impatient.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/impatient.nvim",
    url = "https://github.com/lewis6991/impatient.nvim"
  },
  ["lsp-fastaction.nvim"] = {
    config = { "\27LJ\2\n√\a\0\0\6\0\25\0/6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0005\3\19\0004\4\16\0005\5\4\0>\5\1\0045\5\5\0>\5\2\0045\5\6\0>\5\3\0045\5\a\0>\5\4\0045\5\b\0>\5\5\0045\5\t\0>\5\6\0045\5\n\0>\5\a\0045\5\v\0>\5\b\0045\5\f\0>\5\t\0045\5\r\0>\5\n\0045\5\14\0>\5\v\0045\5\15\0>\5\f\0045\5\16\0>\5\r\0045\5\17\0>\5\14\0045\5\18\0>\5\15\4=\4\20\0034\4\3\0005\5\21\0>\5\1\0045\5\22\0>\5\2\4=\4\23\3=\3\24\2B\0\2\1K\0\1\0\16action_data\15typescript\1\0\3\bkey\6i\norder\3\1\fpattern\16from module\1\0\3\bkey\6a\norder\3\2\fpattern#to existing import declaration\tdart\1\0\0\1\0\3\bkey\6s\norder\3\2\fpattern\rsetstate\1\0\3\bkey\6f\norder\3\2\fpattern\ffor%-in\1\0\3\bkey\6t\norder\3\2\fpattern\15try%-catch\1\0\3\bkey\6i\norder\3\2\fpattern\24surround with %'if'\1\0\3\bkey\6d\norder\3\5\fpattern\vremove\1\0\3\bkey\6S\norder\3\5\fpattern\28wrap with streambuilder\1\0\3\bkey\6b\norder\3\5\fpattern\22wrap with builder\1\0\3\bkey\6p\norder\3\4\fpattern\fpadding\1\0\3\bkey\6E\norder\3\4\fpattern\21wrap with center\1\0\3\bkey\6C\norder\3\4\fpattern\24wrap with container\1\0\3\bkey\6s\norder\3\3\fpattern\23wrap with sizedbox\1\0\3\bkey\6r\norder\3\3\fpattern\18wrap with row\1\0\3\bkey\6c\norder\3\3\fpattern\21wrap with column\1\0\3\bkey\6w\norder\3\2\fpattern\21wrap with widget\1\0\3\bkey\6i\norder\3\1\fpattern\19import library\1\0\1\16hide_cursor\2\nsetup\19lsp-fastaction\frequire\0" },
    load_after = {},
    loaded = true,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/lsp-fastaction.nvim",
    url = "/Users/rjm/Coding/Personal/lsp-fastaction.nvim"
  },
  ["lspkind-nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/lspkind-nvim",
    url = "https://github.com/onsails/lspkind-nvim"
  },
  ["lualine.nvim"] = {
    config = { "require('config.lualine')" },
    load_after = {},
    loaded = true,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/lualine.nvim",
    url = "https://github.com/nvim-lualine/lualine.nvim"
  },
  ["markdown-preview.nvim"] = {
    loaded = true,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/markdown-preview.nvim",
    url = "https://github.com/iamcco/markdown-preview.nvim"
  },
  neogit = {
    config = { "require('config.neogit')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/neogit",
    url = "https://github.com/TimUntersberger/neogit"
  },
  ["nest.nvim"] = {
    config = { "\27LJ\2\n'\0\0\3\0\2\0\0046\0\0\0'\2\1\0B\0\2\1K\0\1\0\fkeymaps\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nest.nvim",
    url = "https://github.com/LionC/nest.nvim"
  },
  ["null-ls.nvim"] = {
    config = { "require('config.null-ls')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/null-ls.nvim",
    url = "https://github.com/jose-elias-alvarez/null-ls.nvim"
  },
  ["nvim-autopairs"] = {
    config = { "require('config.npairs')" },
    load_after = {},
    loaded = true,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/nvim-autopairs",
    url = "https://github.com/windwp/nvim-autopairs"
  },
  ["nvim-cmp"] = {
    after = { "nvim-autopairs" },
    loaded = true,
    only_config = true
  },
  ["nvim-colorizer.lua"] = {
    config = { "\27LJ\2\nG\0\0\3\0\4\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0B\0\2\1K\0\1\0\1\3\0\0\6*\n!dart\nsetup\14colorizer\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-colorizer.lua",
    url = "https://github.com/norcalli/nvim-colorizer.lua"
  },
  ["nvim-dap"] = {
    config = { "require('config.dap')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-dap",
    url = "https://github.com/mfussenegger/nvim-dap"
  },
  ["nvim-dap-ui"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-dap-ui",
    url = "https://github.com/rcarriga/nvim-dap-ui"
  },
  ["nvim-lsp-ts-utils"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-lsp-ts-utils",
    url = "https://github.com/jose-elias-alvarez/nvim-lsp-ts-utils"
  },
  ["nvim-lspconfig"] = {
    after = { "lsp-fastaction.nvim", "dim.lua" },
    loaded = true,
    only_config = true
  },
  ["nvim-neoclip.lua"] = {
    config = { "\27LJ\2\nf\0\0\3\0\5\0\f6\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\0016\0\0\0'\2\3\0B\0\2\0029\0\4\0'\2\1\0B\0\2\1K\0\1\0\19load_extension\14telescope\nsetup\fneoclip\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-neoclip.lua",
    url = "https://github.com/AckslD/nvim-neoclip.lua"
  },
  ["nvim-notify"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-notify",
    url = "https://github.com/rcarriga/nvim-notify"
  },
  ["nvim-spectre"] = {
    config = { "\27LJ\2\n9\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\fspectre\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-spectre",
    url = "https://github.com/windwp/nvim-spectre"
  },
  ["nvim-tree.lua"] = {
    config = { "require('config.nvim-tree')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-tree.lua",
    url = "https://github.com/kyazdani42/nvim-tree.lua"
  },
  ["nvim-treesitter"] = {
    config = { "require('config.nvim-treesitter')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-treesitter",
    url = "https://github.com/nvim-treesitter/nvim-treesitter"
  },
  ["nvim-web-devicons"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-web-devicons",
    url = "https://github.com/kyazdani42/nvim-web-devicons"
  },
  ["packer.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/packer.nvim",
    url = "https://github.com/wbthomason/packer.nvim"
  },
  playground = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/playground",
    url = "https://github.com/nvim-treesitter/playground"
  },
  plenary = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/plenary",
    url = "https://github.com/nvim-lua/plenary.nvim"
  },
  ["plenary.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/plenary.nvim",
    url = "https://github.com/nvim-lua/plenary.nvim"
  },
  popup = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/popup",
    url = "https://github.com/nvim-lua/popup.nvim"
  },
  ["pounce.nvim"] = {
    config = { "\27LJ\2\nè\1\0\0\3\0\4\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0B\0\2\1K\0\1\0\1\0\4\17multi_window\2\20accept_best_key\f<enter>\ndebug\1\16accept_keys\31JFKDLSAHGNUVRBYTMICEOXWPQZ\nsetup\vpounce\frequire\0" },
    loaded = false,
    needs_bufread = false,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/pounce.nvim",
    url = "https://github.com/rlane/pounce.nvim"
  },
  ["project.nvim"] = {
    config = { "require('config.project')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/project.nvim",
    url = "https://github.com/ahmedkhalf/project.nvim"
  },
  ["rust-tools.nvim"] = {
    config = { "require('config.rust-tools')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/rust-tools.nvim",
    url = "https://github.com/simrat39/rust-tools.nvim",
    wants = { "popup", "plenary", "nvim-telescope/telescope.nvim" }
  },
  ["stabilize.nvim"] = {
    config = { "\27LJ\2\n7\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\14stabilize\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/stabilize.nvim",
    url = "https://github.com/luukvbaal/stabilize.nvim"
  },
  ["stylua-nvim"] = {
    loaded = false,
    needs_bufread = false,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/stylua-nvim",
    url = "https://github.com/ckipp01/stylua-nvim"
  },
  ["telescope-fzf-native.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/telescope-fzf-native.nvim",
    url = "https://github.com/nvim-telescope/telescope-fzf-native.nvim"
  },
  ["telescope.nvim"] = {
    config = { "require('config.telescope')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/telescope.nvim",
    url = "https://github.com/nvim-telescope/telescope.nvim"
  },
  ["todo-comments.nvim"] = {
    load_after = {},
    loaded = true,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/todo-comments.nvim",
    url = "https://github.com/folke/todo-comments.nvim"
  },
  ["trouble.nvim"] = {
    config = { "require('config.trouble')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/trouble.nvim",
    url = "https://github.com/folke/trouble.nvim"
  },
  ["vim-abolish"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-abolish",
    url = "https://github.com/tpope/vim-abolish"
  },
  ["vim-autoswap"] = {
    config = { "\27LJ\2\n6\0\0\2\0\3\0\0056\0\0\0009\0\1\0)\1\1\0=\1\2\0K\0\1\0\25autoswap_detect_tmux\6g\bvim\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-autoswap",
    url = "https://github.com/gioele/vim-autoswap"
  },
  ["vim-dispatch"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-dispatch",
    url = "https://github.com/tpope/vim-dispatch"
  },
  ["vim-dispatch-neovim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-dispatch-neovim",
    url = "https://github.com/radenling/vim-dispatch-neovim"
  },
  ["vim-fugitive"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-fugitive",
    url = "https://github.com/tpope/vim-fugitive"
  },
  ["vim-illuminate"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-illuminate",
    url = "https://github.com/RRethy/vim-illuminate"
  },
  ["vim-log-highlighting"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-log-highlighting",
    url = "https://github.com/mtdl9/vim-log-highlighting"
  },
  ["vim-markdown"] = {
    config = { "\27LJ\2\nê\1\0\0\2\0\5\0\r6\0\0\0009\0\1\0)\1\1\0=\1\2\0006\0\0\0009\0\1\0)\1\1\0=\1\3\0006\0\0\0009\0\1\0)\1\2\0=\1\4\0K\0\1\0&vim_markdown_new_list_item_indent\31vim_markdown_strikethrough\22vim_markdown_math\6g\bvim\0" },
    loaded = false,
    needs_bufread = true,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/vim-markdown",
    url = "https://github.com/plasticboy/vim-markdown"
  },
  ["vim-repeat"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-repeat",
    url = "https://github.com/tpope/vim-repeat"
  },
  ["vim-startuptime"] = {
    commands = { "StartupTime" },
    config = { "require('config.startuptime')" },
    loaded = false,
    needs_bufread = false,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/vim-startuptime",
    url = "https://github.com/dstein64/vim-startuptime"
  },
  ["vim-surround"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-surround",
    url = "https://github.com/tpope/vim-surround"
  },
  ["vim-test"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-test",
    url = "https://github.com/vim-test/vim-test"
  },
  ["vim-ultest"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-ultest",
    url = "https://github.com/rcarriga/vim-ultest"
  },
  ["which-key.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/which-key.nvim",
    url = "https://github.com/folke/which-key.nvim"
  },
  winresizer = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/winresizer",
    url = "https://github.com/simeji/winresizer"
  }
}

time([[Defining packer_plugins]], false)
-- Setup for: markdown-preview.nvim
time([[Setup for markdown-preview.nvim]], true)
try_loadstring("\27LJ\2\n=\0\0\2\0\4\0\0056\0\0\0009\0\1\0005\1\3\0=\1\2\0K\0\1\0\1\2\0\0\rmarkdown\19mkdp_filetypes\6g\bvim\0", "setup", "markdown-preview.nvim")
time([[Setup for markdown-preview.nvim]], false)
time([[packadd for markdown-preview.nvim]], true)
vim.cmd [[packadd markdown-preview.nvim]]
time([[packadd for markdown-preview.nvim]], false)
-- Config for: CamelCaseMotion
time([[Config for CamelCaseMotion]], true)
require('config.camelcasemotion')
time([[Config for CamelCaseMotion]], false)
-- Config for: nest.nvim
time([[Config for nest.nvim]], true)
try_loadstring("\27LJ\2\n'\0\0\3\0\2\0\0046\0\0\0'\2\1\0B\0\2\1K\0\1\0\fkeymaps\frequire\0", "config", "nest.nvim")
time([[Config for nest.nvim]], false)
-- Config for: dressing.nvim
time([[Config for dressing.nvim]], true)
try_loadstring("\27LJ\2\nY\0\0\4\0\6\0\t6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\4\0005\3\3\0=\3\5\2B\0\2\1K\0\1\0\ninput\1\0\0\1\0\1\rwinblend\3\0\nsetup\rdressing\frequire\0", "config", "dressing.nvim")
time([[Config for dressing.nvim]], false)
-- Config for: github-notifications.nvim
time([[Config for github-notifications.nvim]], true)
require('config.github-notifications')
time([[Config for github-notifications.nvim]], false)
-- Config for: colorscheme
time([[Config for colorscheme]], true)
require('config.colorscheme')
time([[Config for colorscheme]], false)
-- Config for: nvim-lspconfig
time([[Config for nvim-lspconfig]], true)
require('config.lsp-config')
time([[Config for nvim-lspconfig]], false)
-- Config for: nvim-spectre
time([[Config for nvim-spectre]], true)
try_loadstring("\27LJ\2\n9\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\fspectre\frequire\0", "config", "nvim-spectre")
time([[Config for nvim-spectre]], false)
-- Config for: stabilize.nvim
time([[Config for stabilize.nvim]], true)
try_loadstring("\27LJ\2\n7\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\14stabilize\frequire\0", "config", "stabilize.nvim")
time([[Config for stabilize.nvim]], false)
-- Config for: rust-tools.nvim
time([[Config for rust-tools.nvim]], true)
require('config.rust-tools')
time([[Config for rust-tools.nvim]], false)
-- Config for: nvim-neoclip.lua
time([[Config for nvim-neoclip.lua]], true)
try_loadstring("\27LJ\2\nf\0\0\3\0\5\0\f6\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\0016\0\0\0'\2\3\0B\0\2\0029\0\4\0'\2\1\0B\0\2\1K\0\1\0\19load_extension\14telescope\nsetup\fneoclip\frequire\0", "config", "nvim-neoclip.lua")
time([[Config for nvim-neoclip.lua]], false)
-- Config for: project.nvim
time([[Config for project.nvim]], true)
require('config.project')
time([[Config for project.nvim]], false)
-- Config for: flutter-tools.nvim
time([[Config for flutter-tools.nvim]], true)
require('config.flutter-tools')
time([[Config for flutter-tools.nvim]], false)
-- Config for: copilot.vim
time([[Config for copilot.vim]], true)
require('config.copilot')
time([[Config for copilot.vim]], false)
-- Config for: bufresize.nvim
time([[Config for bufresize.nvim]], true)
try_loadstring("\27LJ\2\n;\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\14bufresize\frequire\0", "config", "bufresize.nvim")
time([[Config for bufresize.nvim]], false)
-- Config for: neogit
time([[Config for neogit]], true)
require('config.neogit')
time([[Config for neogit]], false)
-- Config for: vim-autoswap
time([[Config for vim-autoswap]], true)
try_loadstring("\27LJ\2\n6\0\0\2\0\3\0\0056\0\0\0009\0\1\0)\1\1\0=\1\2\0K\0\1\0\25autoswap_detect_tmux\6g\bvim\0", "config", "vim-autoswap")
time([[Config for vim-autoswap]], false)
-- Config for: null-ls.nvim
time([[Config for null-ls.nvim]], true)
require('config.null-ls')
time([[Config for null-ls.nvim]], false)
-- Config for: gitsigns.nvim
time([[Config for gitsigns.nvim]], true)
try_loadstring("\27LJ\2\n_\0\0\3\0\a\0\n6\0\0\0009\0\1\0'\1\3\0=\1\2\0006\0\4\0'\2\5\0B\0\2\0029\0\6\0B\0\1\1K\0\1\0\nsetup\rgitsigns\frequire\vauto:1\15signcolumn\awo\bvim\0", "config", "gitsigns.nvim")
time([[Config for gitsigns.nvim]], false)
-- Config for: LuaSnip
time([[Config for LuaSnip]], true)
require('config.luasnip')
time([[Config for LuaSnip]], false)
-- Config for: nvim-cmp
time([[Config for nvim-cmp]], true)
require('config.nvim-cmp')
time([[Config for nvim-cmp]], false)
-- Config for: nvim-treesitter
time([[Config for nvim-treesitter]], true)
require('config.nvim-treesitter')
time([[Config for nvim-treesitter]], false)
-- Config for: nvim-colorizer.lua
time([[Config for nvim-colorizer.lua]], true)
try_loadstring("\27LJ\2\nG\0\0\3\0\4\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0B\0\2\1K\0\1\0\1\3\0\0\6*\n!dart\nsetup\14colorizer\frequire\0", "config", "nvim-colorizer.lua")
time([[Config for nvim-colorizer.lua]], false)
-- Config for: nvim-dap
time([[Config for nvim-dap]], true)
require('config.dap')
time([[Config for nvim-dap]], false)
-- Config for: nvim-tree.lua
time([[Config for nvim-tree.lua]], true)
require('config.nvim-tree')
time([[Config for nvim-tree.lua]], false)
-- Config for: trouble.nvim
time([[Config for trouble.nvim]], true)
require('config.trouble')
time([[Config for trouble.nvim]], false)
-- Config for: Colorizer
time([[Config for Colorizer]], true)
try_loadstring("\27LJ\2\nh\0\0\2\0\5\0\t6\0\0\0009\0\1\0'\1\3\0=\1\2\0006\0\0\0009\0\1\0)\1\1\0=\1\4\0K\0\1\0\31colorizer_disable_bufleave\blog\28colorizer_auto_filetype\6g\bvim\0", "config", "Colorizer")
time([[Config for Colorizer]], false)
-- Config for: telescope.nvim
time([[Config for telescope.nvim]], true)
require('config.telescope')
time([[Config for telescope.nvim]], false)
-- Config for: dial.nvim
time([[Config for dial.nvim]], true)
require('config.dial')
time([[Config for dial.nvim]], false)
-- Load plugins in order defined by `after`
time([[Sequenced loading]], true)
vim.cmd [[ packadd dart-vim-plugin ]]

-- Config for: dart-vim-plugin
require('config.dart-vim-plugin')

vim.cmd [[ packadd dim.lua ]]

-- Config for: dim.lua
try_loadstring("\27LJ\2\n5\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\bdim\frequire\0", "config", "dim.lua")

vim.cmd [[ packadd lsp-fastaction.nvim ]]

-- Config for: lsp-fastaction.nvim
try_loadstring("\27LJ\2\n√\a\0\0\6\0\25\0/6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0005\3\19\0004\4\16\0005\5\4\0>\5\1\0045\5\5\0>\5\2\0045\5\6\0>\5\3\0045\5\a\0>\5\4\0045\5\b\0>\5\5\0045\5\t\0>\5\6\0045\5\n\0>\5\a\0045\5\v\0>\5\b\0045\5\f\0>\5\t\0045\5\r\0>\5\n\0045\5\14\0>\5\v\0045\5\15\0>\5\f\0045\5\16\0>\5\r\0045\5\17\0>\5\14\0045\5\18\0>\5\15\4=\4\20\0034\4\3\0005\5\21\0>\5\1\0045\5\22\0>\5\2\4=\4\23\3=\3\24\2B\0\2\1K\0\1\0\16action_data\15typescript\1\0\3\bkey\6i\norder\3\1\fpattern\16from module\1\0\3\bkey\6a\norder\3\2\fpattern#to existing import declaration\tdart\1\0\0\1\0\3\bkey\6s\norder\3\2\fpattern\rsetstate\1\0\3\bkey\6f\norder\3\2\fpattern\ffor%-in\1\0\3\bkey\6t\norder\3\2\fpattern\15try%-catch\1\0\3\bkey\6i\norder\3\2\fpattern\24surround with %'if'\1\0\3\bkey\6d\norder\3\5\fpattern\vremove\1\0\3\bkey\6S\norder\3\5\fpattern\28wrap with streambuilder\1\0\3\bkey\6b\norder\3\5\fpattern\22wrap with builder\1\0\3\bkey\6p\norder\3\4\fpattern\fpadding\1\0\3\bkey\6E\norder\3\4\fpattern\21wrap with center\1\0\3\bkey\6C\norder\3\4\fpattern\24wrap with container\1\0\3\bkey\6s\norder\3\3\fpattern\23wrap with sizedbox\1\0\3\bkey\6r\norder\3\3\fpattern\18wrap with row\1\0\3\bkey\6c\norder\3\3\fpattern\21wrap with column\1\0\3\bkey\6w\norder\3\2\fpattern\21wrap with widget\1\0\3\bkey\6i\norder\3\1\fpattern\19import library\1\0\1\16hide_cursor\2\nsetup\19lsp-fastaction\frequire\0", "config", "lsp-fastaction.nvim")

vim.cmd [[ packadd todo-comments.nvim ]]
vim.cmd [[ packadd lualine.nvim ]]

-- Config for: lualine.nvim
require('config.lualine')

vim.cmd [[ packadd nvim-autopairs ]]

-- Config for: nvim-autopairs
require('config.npairs')

time([[Sequenced loading]], false)

-- Command lazy-loads
time([[Defining lazy-load commands]], true)
pcall(vim.cmd, [[command -nargs=* -range -bang -complete=file StartupTime lua require("packer.load")({'vim-startuptime'}, { cmd = "StartupTime", l1 = <line1>, l2 = <line2>, bang = <q-bang>, args = <q-args>, mods = "<mods>" }, _G.packer_plugins)]])
time([[Defining lazy-load commands]], false)

vim.cmd [[augroup packer_load_aucmds]]
vim.cmd [[au!]]
  -- Filetype lazy-loads
time([[Defining lazy-load filetype autocommands]], true)
vim.cmd [[au FileType lua ++once lua require("packer.load")({'stylua-nvim'}, { ft = "lua" }, _G.packer_plugins)]]
vim.cmd [[au FileType lisp ++once lua require("packer.load")({'aniseed'}, { ft = "lisp" }, _G.packer_plugins)]]
vim.cmd [[au FileType scm ++once lua require("packer.load")({'aniseed'}, { ft = "scm" }, _G.packer_plugins)]]
vim.cmd [[au FileType scheme ++once lua require("packer.load")({'aniseed'}, { ft = "scheme" }, _G.packer_plugins)]]
vim.cmd [[au FileType hy ++once lua require("packer.load")({'aniseed'}, { ft = "hy" }, _G.packer_plugins)]]
vim.cmd [[au FileType fennel ++once lua require("packer.load")({'aniseed'}, { ft = "fennel" }, _G.packer_plugins)]]
vim.cmd [[au FileType janet ++once lua require("packer.load")({'aniseed'}, { ft = "janet" }, _G.packer_plugins)]]
vim.cmd [[au FileType racket ++once lua require("packer.load")({'aniseed'}, { ft = "racket" }, _G.packer_plugins)]]
vim.cmd [[au FileType clojure ++once lua require("packer.load")({'aniseed'}, { ft = "clojure" }, _G.packer_plugins)]]
vim.cmd [[au FileType markdown ++once lua require("packer.load")({'vim-markdown'}, { ft = "markdown" }, _G.packer_plugins)]]
vim.cmd [[au FileType go ++once lua require("packer.load")({'go.nvim'}, { ft = "go" }, _G.packer_plugins)]]
time([[Defining lazy-load filetype autocommands]], false)
  -- Event lazy-loads
time([[Defining lazy-load event autocommands]], true)
vim.cmd [[au BufEnter * ++once lua require("packer.load")({'pounce.nvim', 'git-conflict.nvim'}, { event = "BufEnter *" }, _G.packer_plugins)]]
vim.cmd [[au InsertEnter * ++once lua require("packer.load")({'Comment.nvim'}, { event = "InsertEnter *" }, _G.packer_plugins)]]
time([[Defining lazy-load event autocommands]], false)
vim.cmd("augroup END")
vim.cmd [[augroup filetypedetect]]
time([[Sourcing ftdetect script at: /Users/rjm/.local/share/nvim/site/pack/packer/opt/vim-markdown/ftdetect/markdown.vim]], true)
vim.cmd [[source /Users/rjm/.local/share/nvim/site/pack/packer/opt/vim-markdown/ftdetect/markdown.vim]]
time([[Sourcing ftdetect script at: /Users/rjm/.local/share/nvim/site/pack/packer/opt/vim-markdown/ftdetect/markdown.vim]], false)
time([[Sourcing ftdetect script at: /Users/rjm/.local/share/nvim/site/pack/packer/opt/aniseed/ftdetect/fennel.vim]], true)
vim.cmd [[source /Users/rjm/.local/share/nvim/site/pack/packer/opt/aniseed/ftdetect/fennel.vim]]
time([[Sourcing ftdetect script at: /Users/rjm/.local/share/nvim/site/pack/packer/opt/aniseed/ftdetect/fennel.vim]], false)
vim.cmd("augroup END")
if should_profile then save_profiles(1) end

end)

if not no_errors then
  error_msg = error_msg:gsub('"', '\\"')
  vim.api.nvim_command('echohl ErrorMsg | echom "Error in packer_compiled: '..error_msg..'" | echom "Please check your config for correctness" | echohl None')
end
