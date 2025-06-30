# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a dotfiles repository for managing development environment configurations on macOS. It uses a Go-based CLI with Dotbot for symlink management.

## Common Commands

### Installation and Setup

- `go run .` - Main installation command (idempotent, can be run multiple times)
- `brew bundle` - Install/update Homebrew dependencies from Brewfile
- `./install` - Alternative installation using dotbot directly
- `./install_fisher` - Install Fish shell plugin manager
- `./install_fonts` - Install custom fonts

### Development Commands

- Edit configurations in `config/` directory (changes are immediately reflected via symlinks)
- `vale sync` - Update Vale prose linting styles
- For Neovim updates: `:Lazy sync` (update plugins), `:Lazy clean` (remove unused)

## Architecture

### Directory Structure

- `/config/` - All configuration files organized by tool:
  - `nvim/` - Neovim configuration (LazyVim-based)
  - `fish/` - Fish shell configuration
  - `ghostty/`, `wezterm/` - Terminal emulators
  - `aerospace/`, `yabai/` - Window managers
  - `starship.toml` - Shell prompt
- `/dotbot/` - Dotfile management submodule
- `/styles/` - Vale prose linting styles

### Key Files

- `main.go` - Go CLI that handles templating and installation
- `config.yaml` - Base configuration (directories, project paths)
- `install.dotfiles.yaml` - Dotbot configuration defining symlinks
- `Brewfile` - Homebrew package dependencies

### Configuration Flow

1. `config.yaml` defines base directory and project paths
2. `main.go` processes templates and runs dotbot
3. Dotbot creates symlinks from `config/*` to `~/.config/*`
4. Existing configs are backed up to `.config.bak`

## Important Context

### Neovim Configuration

- Based on LazyVim with extensive customization
- Config location: `config/nvim/`
- See `config/nvim/CLAUDE.md` for detailed Neovim guidance

### Shell Configuration

- Fish is the default shell
- Config location: `config/fish/`
- Fisher manages Fish plugins

### Zellij Integration

- **`zl`** - Create/switch to project tab with layout:
  - Creates new tab with `layout.kdl` if present, otherwise uses `compact` layout for git repos
  - Switches to existing tab if one exists with the same name
  - Applies layout when switching to existing tabs
  - Tab names use `repo/subdir` format for git repos, directory name otherwise
- **`zr`** - Enable automatic tab renaming when changing directories
- **`c`/`ci`** - Autojump commands that create new Zellij tabs for navigation

### Project Paths (from config.yaml)

- Backend: `~/Coding/Tutero/Backend/`
- Frontend: `~/Coding/Tutero/Frontend/`
- Infrastructure: `~/Coding/Tutero/Infrastructure/`
- Playground: `~/Coding/Playground/`

