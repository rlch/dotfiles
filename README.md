# `dotfiles`

> 🚀 A comprehensive dotfiles management system for macOS development environments

This repository contains my personal development environment configurations, managed through a Go-based CLI with Dotbot for symlink management. It provides a streamlined setup for a complete macOS development workflow.

<!--toc:start-->

- [`dotfiles`](#dotfiles)
  - [Features](#features)
  - [What's Included](#whats-included)
  - [Getting started](#getting-started)
  - [Installation](#installation)
  - [Making changes](#making-changes)
    - [Updating your own `dotfiles`](#updating-your-own-dotfiles)
    - [Updating template `dotfiles`](#updating-template-dotfiles)
    - [Tracking configuration for new software](#tracking-configuration-for-new-software)
  - [Updating](#updating)
  - [Troubleshooting](#troubleshooting)
  - [Contribution](#contribution)
  <!--toc:end-->

## Features

- **Automated Setup**: Single command installation with `go run .`
- **Idempotent**: Safe to run multiple times without breaking existing configs
- **Backup System**: Automatically backs up existing configs to `.config.bak`
- **Template Support**: Go-based templating for dynamic configuration
- **Modular Structure**: Organized configuration by tool in `config/` directory
- **Version Control**: Easy tracking and sharing of configuration changes

## What's Included

### Development Tools
- **Neovim**: LazyVim-based configuration with extensive customization
- **Fish Shell**: Modern shell with custom functions and abbreviations
- **WezTerm**: GPU-accelerated terminal emulator
- **AeroSpace**: Tiling window manager for macOS
- **Zellij**: Terminal multiplexer with custom layouts and keybindings

### Productivity Tools
- **Starship**: Fast, customizable shell prompt
- **Homebrew**: Package management via Brewfile
- **Claude Code**: AI coding assistant integration

### Development Environments
- Support for multiple project paths (Backend, Frontend, Infrastructure)
- Auto-jumping with Zoxide integration
- Project-specific Zellij layouts

## Getting started

### Prerequisites

1. **Install Homebrew** (macOS package manager):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install required dependencies**:
   ```bash
   brew install gh go jq
   ```

3. **Install WezTerm terminal definitions** (run in bash/zsh):
   ```bash
   tempfile=$(mktemp) \
     && curl -o $tempfile https://raw.githubusercontent.com/wez/wezterm/main/termwiz/data/wezterm.terminfo \
     && tic -x -o ~/.terminfo $tempfile \
     && rm $tempfile
   ```

## Installation

### 1. Authenticate with GitHub

```bash
gh auth login
```

### 2. Fork or Clone Repository

**Option A: Create from template (for Tutero team)**
```bash
GH_USER=$(gh api user | jq -r '.login')
cd ~
gh repo create $GH_USER/dotfiles --private --template=MathGaps/dotfiles
gh repo clone $GH_USER/dotfiles dotfiles
cd dotfiles
git remote add template https://github.com/MathGaps/dotfiles.git
git fetch template
git submodule update --remote
```

**Option B: Fork this repository**
```bash
gh repo fork rlch/dotfiles --clone
cd dotfiles
```

### 3. Configure Base Directory

Edit `config.yaml` and set your home directory:
```yaml
baseDir: "/Users/YOUR_USERNAME"  # No trailing slash
```

### 4. Run Installation

```bash
go run .
```

The installation will:
- Install all Homebrew packages from `Brewfile`
- Create symbolic links for all configurations
- Back up existing configs to `~/.config.bak/`
- Apply system preferences (key repeat rate, etc.)

> [!NOTE]
> If installation hangs for >30 seconds, press `Ctrl-C` and re-run. The process is idempotent.

> [!IMPORTANT]
> After installation, log out and back in to ensure all system changes take effect.

## Making changes

### Updating your own `dotfiles`

Simply make changes to `<repository clone dir>/config/*` or equivalently the symbolic links inside `<baseDir>/.config/*` and push to git as normal. This will make changes to your own `dotfiles` repository, **not the template**.

### Updating template `dotfiles`

Once you've made changes as above, you can:

1. Create a new branch based off `template/main`, inside `origin` with `git fetch template && git checkout -b <new-branch-name> template/main`
2. Make changes to this branch / cherry-pick from your other commits in `origin`.
3. Push your changes to `template` with `git push template HEAD`
4. Create a PR to `MathGaps/dotfiles` with `gh pr create -B main -R MathGaps/dotfiles`; and follow the process.
5. Once merged, let everyone know via Slack if necessary.

### Tracking configuration for new software

If you want to add and track changes to new software, then:

1. Add your configuration to `<repository clone dir>/config/<name>`.

> [!IMPORTANT]
> Make sure your configuration is copied over from `<baseDir>/.config/<name>` before continuing. Any `links` in `install.dotfiles.yaml` will replace existing configuration with the source-of-truth in the repository.

2. Add `$BASE_DIR/.config/<name>: config/<name>` to `install.dotfiles.yaml` so that the CLI knows to symbolically link these directories.
3. Run `go run .` to create the symbolic link.
4. _If you make a PR to the template, make sure to let everyone know. Anyone wanting these changes should also run `go run .`_

## Updating

In order to pull updates from this repository when others make improvements, we need to merge your upstream branch with the template branch. We cannot assume equivalent histories given upstream changes can be made.

```bash
git fetch template
git merge template/main --allow-unrelated-histories
# Resolve any conflicts
```

## Contribution

If you have any improvements, features, fixes, or new software that you think benefit everyone in the team,
