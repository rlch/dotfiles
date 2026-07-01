# Homebrew bundle — CORE packages, installed on EVERY machine.
#
# Optional packages live in Brewfile.d/<module>.brewfile and are bundled only
# when that module is enabled (see .chezmoidata.yaml + the install script,
# run_onchange_install-packages.sh.tmpl). Owner-only packages live in the
# private overlay's Brewfile. Machine-local extras go in Brewfile.personal
# (gitignored — never conflicts on upstream pull).
#
# Edit directly. `chezmoi apply` re-bundles when the hash changes; or manually:
#   brew bundle install --file=~/dev/dotfiles/Brewfile

# === Dotfiles management ===
brew "chezmoi"

# === Terminal (cmux is the daily driver; its app + config are not brew-managed) ===
cask "ghostty"

# === Shell ===
brew "bash"        # newer Bash for installers that need 4.3+
brew "fish"

# === Fonts ===
cask "font-jetbrains-mono-nerd-font"   # Nerd Font glyphs for lazygit, yazi, etc.

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
brew "tree"
brew "coreutils"   # GNU coreutils (g-prefixed). Provides `timeout` via timeout.fish — NOT gnubin-on-PATH, to avoid shadowing every BSD coreutil
# JSON / data
brew "jq"
brew "yq"          # jq for YAML/TOML/XML
brew "gron"        # flatten JSON to greppable `path = value` lines
brew "tokei"       # code line counter by language
brew "imagemagick" # convert/magick — pulled in by misc one-off scripts
brew "chafa"       # terminal image viewer (sixel/kitty/ansi)
# Disk / process / system
brew "dust"        # du, but tree-shaped
brew "procs"       # ps, but readable
brew "btop"        # interactive system monitor
brew "yazi"        # async TUI file manager
brew "glow"        # terminal markdown renderer (yazi previewer via piper)
brew "hyperfine"   # benchmarking
brew "xh"          # friendlier curl / httpie alternative

# === Editor (Neovim + LazyVim toolchain) ===
brew "neovim"
cask "neovide-app"          # GPU Neovim GUI. Opens files via its OWN Info.plist
                            # associations — do NOT add a duti script to force broad
                            # filetypes: it cascaded Neovide into the default browser
                            # slot and hijacked Slack/url opens (2026-06-25).
brew "duti"                 # macOS default-app (LaunchServices) handler management
brew "lua-language-server"  # Lua LSP — used by LazyVim's own config
brew "stylua"               # Lua formatter
brew "luarocks"             # Lua package manager — needed by some nvim plugins
brew "tree-sitter"          # library used by some treesitter parsers' install hooks
brew "tree-sitter-cli"      # `tree-sitter` CLI binary (separate formula)

# === Language runtimes ===
# Global so mason.nvim can install LSPs/formatters that rely on npm/go/python.
# Per-project versions still come from mise.
brew "node"
brew "go"
brew "python@3.13"
brew "uv"          # fast Python package/venv manager

# === Build tools + project workflow ===
brew "cmake"
brew "ninja"
brew "just"        # command runner, Make alternative
brew "direnv"      # per-directory env vars / shell hooks
brew "watchexec"   # rerun a command when files change

# === Git ===
brew "lazygit"
brew "git-absorb"  # slot `git add -p`'d fixes into the right ancestor (`git ab`)
brew "difftastic"  # structural diff, invoked on demand as `git dft`
brew "gh"          # GitHub CLI (gh-dash / gh-enhance added via extension script)
brew "mas"         # Mac App Store CLI

# === Secrets ===
cask "1password-cli"

# === AI (core CLI; extra agents are in the `aistack` module) ===
cask "claude-code"

# === Browser (daily; extra browsers are in the `browsers` module) ===
cask "firefox"

# === Utilities ===
cask "macshot"          # screenshot/recording w/ annotations + OCR (Cmd-Shift-X)
cask "the-unarchiver"   # RAR/7z/tar.zst + long-tail archive formats

# === Manual installs — intentionally NOT brew-managed ===
# These ship .pkg installers that need `sudo /usr/sbin/installer`, which can't
# read a password from chezmoi's non-interactive `brew bundle` — every apply
# would stall + purge the Caskroom entry and retry forever. Install once by hand
# in a real tty (Touch ID / password prompt); they self-update afterward:
#   brew install --cask tailscale-app     # mesh VPN
#   brew install --cask google-drive      # Drive for Desktop (~/Library/CloudStorage/…)
