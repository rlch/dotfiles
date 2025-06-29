# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Neovim configuration based on LazyVim, using the lazy.nvim plugin manager. The configuration is organized modularly with custom plugins and settings while leveraging LazyVim's extras system.

## Architecture

### Entry Points
- `init.lua` - Main entry point that requires the config module
- `lua/config/init.lua` - Bootstraps lazy.nvim and loads all plugin specifications

### Configuration Structure
- `lua/config/` - Core configuration files
  - `globals.lua` - Global variables and settings
  - `options.lua` - Neovim options (leader key is space, localleader is comma)
  - `keymaps.lua` - Custom key mappings
  - `autocmds.lua` - Auto commands
- `lua/plugins/` - Plugin configurations organized by category
  - `ai.lua` - AI assistance plugins (Copilot enabled)
  - `coding.lua` - Coding enhancement plugins
  - `colorscheme.lua` - Theme configurations
  - `editor.lua` - Editor enhancement plugins
  - `lsp.lua` - Language Server Protocol configurations
  - `ui.lua` - UI enhancement plugins
  - `lang.lua` - Language-specific configurations

### Plugin Management

This configuration uses lazy.nvim with LazyVim as a base. LazyVim extras are imported for:
- Languages: Go, Rust, Python, TypeScript, Elixir, Docker, Terraform, YAML, JSON, Markdown
- Formatting: Black, Prettier
- Editor: FZF (picker), dial, inc-rename, outline
- Coding: Copilot, luasnip, mini-surround, yanky
- Testing & Debugging: DAP core, neotest

### Code Style

- Lua formatting: Stylua with 2-space indentation, 120 column width
- Quote style: Auto-prefer double quotes
- Line endings: Unix

## Development Commands

### Neovim Plugin Management
- `:Lazy` - Open lazy.nvim UI for plugin management
- `:Lazy sync` - Update all plugins
- `:Lazy clean` - Remove unused plugins

### LSP Commands
- `:LspInfo` - Show LSP server information
- `:LspRestart` - Restart LSP servers
- `<leader>lf` - Format code (force)
- `<leader>lr` - Restart LSP
- `<leader>li` - LSP Info

### Key Mappings
- Leader: `<space>`
- Local leader: `,`
- `;` remapped to `:` for easier command mode access
- `H`/`L` for beginning/end of line navigation
- `<leader>p`/`<leader>P` - Paste without affecting registers

## Notes

- LazyVim's default autocmds and keymaps are disabled in favor of custom configurations
- FZF is configured as the default picker (`vim.g.lazyvim_picker = "fzf"`)
- Autoformat is enabled by default (`vim.g.autoformat = true`)
- The configuration includes custom development paths at `~/Coding/Personal/`