# Homebrew bundle for the chezmoi-managed dotfiles.
# Edit this file directly. Re-run via `chezmoi apply` (which calls
# `brew bundle install` when this file's hash changes), or manually:
#   brew bundle install --file=~/dev/dotfiles/Brewfile

# === Dotfiles management ===
brew "chezmoi"

# === Window manager ===
tap "nikitabobko/tap"
cask "nikitabobko/tap/aerospace"
# Native instant macOS Spaces switching — companion to AeroSpace.
tap "jurplel/tap"
cask "jurplel/tap/instant-space-switcher"

# === Terminal + multiplexer ===
cask "ghostty"
brew "zellij"

# === Shell ===
brew "fish"

# === Fonts ===
# Nerd Font flavor — adds icon glyphs needed by zjstatus, lazygit, yazi, etc.
cask "font-jetbrains-mono-nerd-font"

# === Prompt + shell history + tool versions ===
brew "starship"
brew "atuin"
brew "zoxide"
brew "mise"

# === Modern CLI baseline ===
# Find / search / read
brew "ripgrep"
brew "fd"
brew "fzf"
brew "eza"
brew "bat"
brew "git-delta"
brew "sd"          # readable find-and-replace (sed for the 90% case)
brew "tree"        # plain directory tree (when dust's size view is overkill)
# JSON / data
brew "jq"
brew "tokei"       # code line counter by language
# Image manipulation — used by scratchpad-Ghostty icon builder
brew "imagemagick"
# Disk / process / system
brew "dust"        # du, but tree-shaped
brew "procs"       # ps, but readable
brew "btop"        # interactive system monitor
brew "yazi"        # async TUI file manager
# Benchmarking
brew "hyperfine"

# === Editor ===
brew "neovim"
brew "lua-language-server"  # Lua LSP — used by LazyVim's own config
brew "stylua"               # Lua formatter — paired with lua-language-server
brew "tree-sitter"          # CLI used by some treesitter parsers' install hooks
brew "rust-analyzer"        # Rust LSP for nvim (no rustup needed)

# === Language runtimes ===
# Available globally so mason.nvim (in nvim) can install LSPs/formatters that
# rely on `npm`, `go`, or python>=3.10. Per-project versions still come from mise.
brew "node"
brew "go"
brew "python@3.13"

# === Project + dev workflow ===
brew "just"        # command runner, Make alternative
brew "direnv"      # per-directory env vars / shell hooks
brew "watchexec"   # rerun a command when files change

# === Network / HTTP ===
brew "xh"          # friendlier curl / httpie alternative
# sshpass — non-interactive ssh password auth (one-shot bootstrap of new hosts).
# Removed from homebrew-core; lives in this third-party tap.
tap "hudochenkov/sshpass"
brew "hudochenkov/sshpass/sshpass"

# === Git / Docker TUIs ===
brew "lazygit"
brew "lazydocker"

# === GitHub + macOS app stores ===
brew "gh"          # GitHub CLI
brew "mas"         # Mac App Store CLI (lets MAS apps live in this Brewfile)

# === Containers ===
cask "orbstack"

# === AI dev tooling ===
cask "claude-code"
cask "codex"       # OpenAI's coding agent CLI

# === Secrets ===
cask "1password-cli"

# === Apps ===
cask "firefox"
cask "obsidian"
