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
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/Comment.nvim",
    url = "https://github.com/numToStr/Comment.nvim"
  },
  LuaSnip = {
    config = { "require('config.luasnip')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/LuaSnip",
    url = "https://github.com/L3MON4D3/LuaSnip"
  },
  aniseed = {
    config = { "\27LJ\2\nU\0\0\3\0\3\0\0056\0\0\0009\0\1\0'\2\2\0B\0\2\1K\0\1\0006            let g:aniseed#env = v:true\n          \bcmd\bvim\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/aniseed",
    url = "https://github.com/Olical/aniseed"
  },
  ["bufresize.nvim"] = {
    config = { "\27LJ\2\n;\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\14bufresize\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/bufresize.nvim",
    url = "https://github.com/kwkarlwang/bufresize.nvim"
  },
  cmp = {
    config = { "require('config.nvim-cmp')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp",
    url = "https://github.com/hrsh7th/nvim-cmp"
  },
  ["cmp-buffer"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-buffer",
    url = "https://github.com/hrsh7th/cmp-buffer"
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
  ["cmp-path"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/cmp-path",
    url = "https://github.com/hrsh7th/cmp-path"
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
    after = { "lualine.nvim", "vim-better-comments" },
    loaded = true,
    only_config = true
  },
  ["conflict-marker.vim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/conflict-marker.vim",
    url = "https://github.com/rhysd/conflict-marker.vim"
  },
  conjure = {
    config = { "\27LJ\2\nÁ\2\0\0\3\0\3\0\0056\0\0\0009\0\1\0'\2\2\0B\0\2\1K\0\1\0«\2            let g:conjure#filetypes = [\n            \\'clojure',\n            \\'fennel',\n            \\'janet',\n            \\'racket',\n            \\'scheme',\n            \\'scm',\n            \\'hy',\n            \\'lisp'\n            \\]\n            let g:conjure#client#fennel#aniseed#aniseed_module_prefix = \"aniseed.\"\n          \bcmd\bvim\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/conjure",
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
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/dart-vim-plugin",
    url = "https://github.com/rlch/dart-vim-plugin"
  },
  ["dial.nvim"] = {
    config = { "require('config.dial')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/dial.nvim",
    url = "https://github.com/monaqa/dial.nvim"
  },
  ["dim.lua"] = {
    config = { "\27LJ\2\n5\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\bdim\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/dim.lua",
    url = "https://github.com/narutoxy/dim.lua"
  },
  ["flutter-tools.nvim"] = {
    config = { "require('config.flutter-tools')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/flutter-tools.nvim",
    url = "https://github.com/akinsho/flutter-tools.nvim"
  },
  ["friendly-snippets"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/friendly-snippets",
    url = "https://github.com/rafamadriz/friendly-snippets"
  },
  ["github-notifications.nvim"] = {
    config = { "require('config.github-notifications')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/github-notifications.nvim",
    url = "/Users/rjm/Coding/Personal/github-notifications.nvim"
  },
  ["go.nvim"] = {
    config = { "\27LJ\2\n0\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\ago\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/go.nvim",
    url = "https://github.com/ray-x/go.nvim"
  },
  ["impatient.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/impatient.nvim",
    url = "https://github.com/lewis6991/impatient.nvim"
  },
  ["lsp-fastaction.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/lsp-fastaction.nvim",
    url = "/Users/rjm/Coding/Personal/lsp-fastaction.nvim"
  },
  ["lsp-status.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/lsp-status.nvim",
    url = "https://github.com/nvim-lua/lsp-status.nvim"
  },
  ["lspkind-nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/lspkind-nvim",
    url = "https://github.com/onsails/lspkind-nvim"
  },
  ["lspsaga.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/lspsaga.nvim",
    url = "https://github.com/tami5/lspsaga.nvim"
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
    loaded = false,
    needs_bufread = false,
    only_cond = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/markdown-preview.nvim",
    url = "https://github.com/iamcco/markdown-preview.nvim"
  },
  ["nest.nvim"] = {
    config = { "\27LJ\2\n'\0\0\3\0\2\0\0046\0\0\0'\2\1\0B\0\2\1K\0\1\0\fkeymaps\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nest.nvim",
    url = "https://github.com/LionC/nest.nvim"
  },
  ["nui.nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nui.nvim",
    url = "https://github.com/MunifTanjim/nui.nvim"
  },
  ["null-ls.nvim"] = {
    config = { "require('config.null-ls')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/null-ls.nvim",
    url = "https://github.com/jose-elias-alvarez/null-ls.nvim"
  },
  ["nvim-autopairs"] = {
    config = { "require('config.npairs')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-autopairs",
    url = "https://github.com/windwp/nvim-autopairs"
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
    config = { "require('config.lsp-config')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/nvim-lspconfig",
    url = "https://github.com/neovim/nvim-lspconfig"
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
    url = "/Users/rjm/Coding/Personal/nvim-tree.lua"
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
  popup = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/popup",
    url = "https://github.com/nvim-lua/popup.nvim"
  },
  ["pounce.nvim"] = {
    config = { "\27LJ\2\nè\1\0\0\3\0\4\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0B\0\2\1K\0\1\0\1\0\4\16accept_keys\31JFKDLSAHGNUVRBYTMICEOXWPQZ\17multi_window\2\20accept_best_key\f<enter>\ndebug\1\nsetup\vpounce\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/pounce.nvim",
    url = "https://github.com/rlane/pounce.nvim"
  },
  ["project.nvim"] = {
    config = { "require('config.project')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/project.nvim",
    url = "https://github.com/ahmedkhalf/project.nvim"
  },
  ["renamer.nvim"] = {
    config = { "require('config.renamer')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/renamer.nvim",
    url = "https://github.com/filipdutescu/renamer.nvim"
  },
  ["rust-tools.nvim"] = {
    config = { "require('config.rust-tools')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/rust-tools.nvim",
    url = "https://github.com/simrat39/rust-tools.nvim",
    wants = { "popup", "plenary", "nvim-telescope/telescope.nvim" }
  },
  sniprun = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/sniprun",
    url = "https://github.com/michaelb/sniprun"
  },
  ["stabilize.nvim"] = {
    config = { "\27LJ\2\n7\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\14stabilize\frequire\0" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/stabilize.nvim",
    url = "https://github.com/luukvbaal/stabilize.nvim"
  },
  ["stylua-nvim"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/stylua-nvim",
    url = "https://github.com/ckipp01/stylua-nvim"
  },
  tabular = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/tabular",
    url = "https://github.com/godlygeek/tabular"
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
    config = { "require('config.autoswap')" },
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-autoswap",
    url = "https://github.com/gioele/vim-autoswap"
  },
  ["vim-better-comments"] = {
    load_after = {},
    loaded = true,
    needs_bufread = false,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/opt/vim-better-comments",
    url = "https://github.com/jbgutierrez/vim-better-comments"
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
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-markdown",
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
  ["vim-surround-funk"] = {
    loaded = true,
    path = "/Users/rjm/.local/share/nvim/site/pack/packer/start/vim-surround-funk",
    url = "https://github.com/Matt-A-Bennett/vim-surround-funk"
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
-- Config for: colorscheme
time([[Config for colorscheme]], true)
require('config.colorscheme')
time([[Config for colorscheme]], false)
-- Config for: vim-markdown
time([[Config for vim-markdown]], true)
try_loadstring("\27LJ\2\nê\1\0\0\2\0\5\0\r6\0\0\0009\0\1\0)\1\1\0=\1\2\0006\0\0\0009\0\1\0)\1\1\0=\1\3\0006\0\0\0009\0\1\0)\1\2\0=\1\4\0K\0\1\0&vim_markdown_new_list_item_indent\31vim_markdown_strikethrough\22vim_markdown_math\6g\bvim\0", "config", "vim-markdown")
time([[Config for vim-markdown]], false)
-- Config for: pounce.nvim
time([[Config for pounce.nvim]], true)
try_loadstring("\27LJ\2\nè\1\0\0\3\0\4\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0B\0\2\1K\0\1\0\1\0\4\16accept_keys\31JFKDLSAHGNUVRBYTMICEOXWPQZ\17multi_window\2\20accept_best_key\f<enter>\ndebug\1\nsetup\vpounce\frequire\0", "config", "pounce.nvim")
time([[Config for pounce.nvim]], false)
-- Config for: cmp
time([[Config for cmp]], true)
require('config.nvim-cmp')
time([[Config for cmp]], false)
-- Config for: project.nvim
time([[Config for project.nvim]], true)
require('config.project')
time([[Config for project.nvim]], false)
-- Config for: renamer.nvim
time([[Config for renamer.nvim]], true)
require('config.renamer')
time([[Config for renamer.nvim]], false)
-- Config for: rust-tools.nvim
time([[Config for rust-tools.nvim]], true)
require('config.rust-tools')
time([[Config for rust-tools.nvim]], false)
-- Config for: conjure
time([[Config for conjure]], true)
try_loadstring("\27LJ\2\nÁ\2\0\0\3\0\3\0\0056\0\0\0009\0\1\0'\2\2\0B\0\2\1K\0\1\0«\2            let g:conjure#filetypes = [\n            \\'clojure',\n            \\'fennel',\n            \\'janet',\n            \\'racket',\n            \\'scheme',\n            \\'scm',\n            \\'hy',\n            \\'lisp'\n            \\]\n            let g:conjure#client#fennel#aniseed#aniseed_module_prefix = \"aniseed.\"\n          \bcmd\bvim\0", "config", "conjure")
time([[Config for conjure]], false)
-- Config for: github-notifications.nvim
time([[Config for github-notifications.nvim]], true)
require('config.github-notifications')
time([[Config for github-notifications.nvim]], false)
-- Config for: stabilize.nvim
time([[Config for stabilize.nvim]], true)
try_loadstring("\27LJ\2\n7\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\14stabilize\frequire\0", "config", "stabilize.nvim")
time([[Config for stabilize.nvim]], false)
-- Config for: copilot.vim
time([[Config for copilot.vim]], true)
require('config.copilot')
time([[Config for copilot.vim]], false)
-- Config for: dart-vim-plugin
time([[Config for dart-vim-plugin]], true)
require('config.dart-vim-plugin')
time([[Config for dart-vim-plugin]], false)
-- Config for: dial.nvim
time([[Config for dial.nvim]], true)
require('config.dial')
time([[Config for dial.nvim]], false)
-- Config for: nvim-dap
time([[Config for nvim-dap]], true)
require('config.dap')
time([[Config for nvim-dap]], false)
-- Config for: dim.lua
time([[Config for dim.lua]], true)
try_loadstring("\27LJ\2\n5\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\bdim\frequire\0", "config", "dim.lua")
time([[Config for dim.lua]], false)
-- Config for: CamelCaseMotion
time([[Config for CamelCaseMotion]], true)
require('config.camelcasemotion')
time([[Config for CamelCaseMotion]], false)
-- Config for: telescope.nvim
time([[Config for telescope.nvim]], true)
require('config.telescope')
time([[Config for telescope.nvim]], false)
-- Config for: nvim-treesitter
time([[Config for nvim-treesitter]], true)
require('config.nvim-treesitter')
time([[Config for nvim-treesitter]], false)
-- Config for: Colorizer
time([[Config for Colorizer]], true)
try_loadstring("\27LJ\2\nh\0\0\2\0\5\0\t6\0\0\0009\0\1\0'\1\3\0=\1\2\0006\0\0\0009\0\1\0)\1\1\0=\1\4\0K\0\1\0\31colorizer_disable_bufleave\blog\28colorizer_auto_filetype\6g\bvim\0", "config", "Colorizer")
time([[Config for Colorizer]], false)
-- Config for: nvim-lspconfig
time([[Config for nvim-lspconfig]], true)
require('config.lsp-config')
time([[Config for nvim-lspconfig]], false)
-- Config for: nvim-spectre
time([[Config for nvim-spectre]], true)
try_loadstring("\27LJ\2\n9\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\fspectre\frequire\0", "config", "nvim-spectre")
time([[Config for nvim-spectre]], false)
-- Config for: nest.nvim
time([[Config for nest.nvim]], true)
try_loadstring("\27LJ\2\n'\0\0\3\0\2\0\0046\0\0\0'\2\1\0B\0\2\1K\0\1\0\fkeymaps\frequire\0", "config", "nest.nvim")
time([[Config for nest.nvim]], false)
-- Config for: nvim-neoclip.lua
time([[Config for nvim-neoclip.lua]], true)
try_loadstring("\27LJ\2\nf\0\0\3\0\5\0\f6\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\0016\0\0\0'\2\3\0B\0\2\0029\0\4\0'\2\1\0B\0\2\1K\0\1\0\19load_extension\14telescope\nsetup\fneoclip\frequire\0", "config", "nvim-neoclip.lua")
time([[Config for nvim-neoclip.lua]], false)
-- Config for: flutter-tools.nvim
time([[Config for flutter-tools.nvim]], true)
require('config.flutter-tools')
time([[Config for flutter-tools.nvim]], false)
-- Config for: vim-autoswap
time([[Config for vim-autoswap]], true)
require('config.autoswap')
time([[Config for vim-autoswap]], false)
-- Config for: nvim-tree.lua
time([[Config for nvim-tree.lua]], true)
require('config.nvim-tree')
time([[Config for nvim-tree.lua]], false)
-- Config for: LuaSnip
time([[Config for LuaSnip]], true)
require('config.luasnip')
time([[Config for LuaSnip]], false)
-- Config for: null-ls.nvim
time([[Config for null-ls.nvim]], true)
require('config.null-ls')
time([[Config for null-ls.nvim]], false)
-- Config for: trouble.nvim
time([[Config for trouble.nvim]], true)
require('config.trouble')
time([[Config for trouble.nvim]], false)
-- Config for: aniseed
time([[Config for aniseed]], true)
try_loadstring("\27LJ\2\nU\0\0\3\0\3\0\0056\0\0\0009\0\1\0'\2\2\0B\0\2\1K\0\1\0006            let g:aniseed#env = v:true\n          \bcmd\bvim\0", "config", "aniseed")
time([[Config for aniseed]], false)
-- Config for: nvim-autopairs
time([[Config for nvim-autopairs]], true)
require('config.npairs')
time([[Config for nvim-autopairs]], false)
-- Config for: go.nvim
time([[Config for go.nvim]], true)
try_loadstring("\27LJ\2\n0\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\ago\frequire\0", "config", "go.nvim")
time([[Config for go.nvim]], false)
-- Config for: nvim-colorizer.lua
time([[Config for nvim-colorizer.lua]], true)
try_loadstring("\27LJ\2\nG\0\0\3\0\4\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0005\2\3\0B\0\2\1K\0\1\0\1\3\0\0\6*\n!dart\nsetup\14colorizer\frequire\0", "config", "nvim-colorizer.lua")
time([[Config for nvim-colorizer.lua]], false)
-- Config for: bufresize.nvim
time([[Config for bufresize.nvim]], true)
try_loadstring("\27LJ\2\n;\0\0\3\0\3\0\a6\0\0\0'\2\1\0B\0\2\0029\0\2\0004\2\0\0B\0\2\1K\0\1\0\nsetup\14bufresize\frequire\0", "config", "bufresize.nvim")
time([[Config for bufresize.nvim]], false)
-- Config for: Comment.nvim
time([[Config for Comment.nvim]], true)
try_loadstring("\27LJ\2\n5\0\0\3\0\3\0\0066\0\0\0'\2\1\0B\0\2\0029\0\2\0B\0\1\1K\0\1\0\nsetup\fComment\frequire\0", "config", "Comment.nvim")
time([[Config for Comment.nvim]], false)
-- Load plugins in order defined by `after`
time([[Sequenced loading]], true)
vim.cmd [[ packadd vim-better-comments ]]
vim.cmd [[ packadd lualine.nvim ]]

-- Config for: lualine.nvim
require('config.lualine')

time([[Sequenced loading]], false)

-- Command lazy-loads
time([[Defining lazy-load commands]], true)
pcall(vim.cmd, [[command -nargs=* -range -bang -complete=file StartupTime lua require("packer.load")({'vim-startuptime'}, { cmd = "StartupTime", l1 = <line1>, l2 = <line2>, bang = <q-bang>, args = <q-args>, mods = "<mods>" }, _G.packer_plugins)]])
time([[Defining lazy-load commands]], false)

vim.cmd [[augroup packer_load_aucmds]]
vim.cmd [[au!]]
  -- Filetype lazy-loads
time([[Defining lazy-load filetype autocommands]], true)
vim.cmd [[au FileType markdown ++once lua require("packer.load")({'markdown-preview.nvim'}, { ft = "markdown" }, _G.packer_plugins)]]
time([[Defining lazy-load filetype autocommands]], false)
vim.cmd("augroup END")
if should_profile then save_profiles(1) end

end)

if not no_errors then
  error_msg = error_msg:gsub('"', '\\"')
  vim.api.nvim_command('echohl ErrorMsg | echom "Error in packer_compiled: '..error_msg..'" | echom "Please check your config for correctness" | echohl None')
end
