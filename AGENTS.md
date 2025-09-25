# AGENTS.md

Agent guidance for this dotfiles repository.

## Commands

### Build/Lint/Test

- **Install**: `go run .` - Main installation (idempotent)
- **Dependencies**: `brew bundle` - Install/update Homebrew packages
- **Neovim lint**: `stylua config/nvim/lua/` - Format Neovim Lua code
- **Neovim plugins**: `:Lazy sync` (in Neovim) - Update plugins
- **Single test**: Not applicable (dotfiles repo)

### Development

- **Format**: `stylua config/nvim/lua/` - Format Neovim config
- **Validate**: `nvim --headless -c "checkhealth" -c "qa"` - Check Neovim health

## Code Style

### Lua (Neovim config)

- 2-space indentation, 120 column width
- Double quotes for strings, Unix line endings
- Local scope preferred: `local var = value`
- No trailing semicolons
- Plugin configs in `config/nvim/lua/plugins/{category}.lua`

### Go (CLI tool)

- Standard Go formatting with `gofmt`
- CamelCase for exports, error wrapping with `%w`

### General

- Follow existing patterns in each config directory
- Symlinks managed via dotbot from `config/` to `~/.config/`
- Leader key: `<space>`, Local leader: `,`

## Architecture

- `/config/` - All configuration files
- `main.go` - Installation CLI with templating
- `install.dotfiles.yaml` - Dotbot symlink definitions
- LazyVim-based Neovim with custom overrides
