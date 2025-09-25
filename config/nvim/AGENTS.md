# AGENTS.md

Agent guidance for this Neovim configuration.

## Commands

### Build/Lint/Test
- **Lint**: `stylua lua/` - Format Lua code with 2-space indent, 120 cols
- **Plugin sync**: `:Lazy sync` - Update all plugins
- **Health check**: `nvim --headless -c "checkhealth" -c "qa"` - Validate config
- **Single test**: Not applicable (config repo)

### Development
- **Format**: `stylua lua/` - Auto-format Lua files
- **Plugin management**: `:Lazy` - Open plugin manager UI
- **LSP restart**: `:LspRestart` - Restart language servers

## Code Style

### Lua (Primary)
- 2-space indentation, 120 column width
- Double quotes for strings, Unix line endings
- Local scope preferred: `local var = value`
- No trailing semicolons
- Plugin configs in `lua/plugins/{category}.lua`

### Structure
- Entry: `init.lua` → `lua/config/init.lua`
- Core config: `lua/config/` (options, keymaps, autocmds)
- Plugins: `lua/plugins/` organized by category
- Leader: `<space>`, Local leader: `,`

## Architecture
- LazyVim-based with custom overrides
- FZF as default picker (`vim.g.lazyvim_picker = "fzf"`)
- Autoformat enabled (`vim.g.autoformat = true`)
- Custom autocmds/keymaps override LazyVim defaults

When determining an optimal solution out of multiple, prompt me with the solution-set so I can determine.