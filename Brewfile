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
brew "tmux"
brew "tmuxinator"  # YAML-defined tmux session layouts; configs in ~/.config/tmuxinator/

# === Shell ===
brew "bash"        # newer Bash for installers that need 4.3+ (Headroom Docker-native)
brew "fish"

# === Fonts ===
# Nerd Font flavor — adds icon glyphs needed by lazygit, yazi, etc.
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
brew "chafa"       # terminal image viewer (sixel/kitty/ansi)
# Disk / process / system
brew "dust"        # du, but tree-shaped
brew "procs"       # ps, but readable
brew "btop"        # interactive system monitor
brew "yazi"        # async TUI file manager
brew "glow"        # terminal markdown renderer (yazi previewer via piper plugin)

# Mount remote SSH hosts as local folders (sidesteps yazi's still-rough VFS).
# fuse-t is a kext-less FUSE replacement; fuse-t-sshfs is the sshfs binary
# built against it. Used by the `mini-mount`/`mini-umount` fish functions.
tap "macos-fuse-t/cask"
cask "fuse-t"
cask "macos-fuse-t/cask/fuse-t-sshfs"
# Benchmarking
brew "hyperfine"

# === Editor ===
brew "neovim"
brew "lua-language-server"  # Lua LSP — used by LazyVim's own config
brew "stylua"               # Lua formatter — paired with lua-language-server
brew "luarocks"             # Lua package manager — needed by some nvim plugins
brew "tree-sitter"          # library used by some treesitter parsers' install hooks
brew "tree-sitter-cli"      # `tree-sitter` CLI binary (separate formula)
brew "rust-analyzer"        # Rust LSP for nvim
brew "rustup"               # Rust toolchain manager (rustc, cargo)
brew "wasm-pack"            # Rust→WASM build/bundle tool

# === Language runtimes ===
# Available globally so mason.nvim (in nvim) can install LSPs/formatters that
# rely on `npm`, `go`, or python>=3.10. Per-project versions still come from mise.
brew "node"
brew "go"
brew "python@3.13"
brew "uv"          # fast Python package/venv manager (pip + virtualenv replacement)

# === Flutter ===
# Per-project Flutter SDK pinning via .fvmrc (mise doesn't manage Flutter).
tap "leoafarias/fvm"
brew "leoafarias/fvm/fvm"

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

# upterm — instant terminal sharing (pair-programming / remote help over SSH
# tunnel). Shipped as a cask despite being a CLI binary.
tap "owenthereal/upterm"
cask "owenthereal/upterm/upterm"

# === Git / Docker TUIs ===
brew "lazygit"
brew "lazydocker"
# revdiff — file-tree TUI for reviewing diffs, with inline annotations and a
# Claude Code plugin. Replaced diffnav (delta-based pager) for richer review
# UX. Lives in umputun's tap.
tap "umputun/apps"
brew "umputun/apps/revdiff"

# === GitHub + macOS app stores ===
brew "gh"          # GitHub CLI
# gh extensions (gh-dash, gh-enhance) are installed by
# .chezmoiscripts/run_onchange_post-install-gh-extensions.sh.tmpl — neither
# ships on homebrew-core. Invoke as `gh dash` and `gh enhance`.
brew "mas"         # Mac App Store CLI (lets MAS apps live in this Brewfile)

# === Containers ===
cask "orbstack"

# === Cloud SDKs ===
# gcloud + gsutil + bq + friends. Auth via `gcloud auth login`. Components
# (kubectl, beta, etc.) install on demand into /opt/homebrew/share/google-
# cloud-sdk/bin — already on PATH via the brew shim.
cask "gcloud-cli"

# === AI dev tooling ===
cask "claude-code"
cask "codex"       # OpenAI's coding agent CLI
brew "gemini-cli"  # Google's Gemini CLI
brew "rtk"         # CLI proxy that compresses dev-tool output before it reaches the agent's context
brew "ccusage"     # token-spend telemetry for Claude Code session JSONL logs

# === Secrets ===
cask "1password-cli"

# === Screenshot / capture ===
# Native screenshot + screen recording with annotations, OCR, scroll capture.
# Menu-bar app, default global hotkey Cmd-Shift-X (watch for conflicts with
# Ghostty/aerospace/tridactyl bindings). Auto-updates.
cask "macshot"

# === Apps ===
cask "firefox"
cask "obsidian"
# Brave hosts Gather (and any other PWAs) so their lifetime is decoupled
# from Chrome's — Chrome PWAs share Chrome's process tree, so Cmd-Q on
# Chrome kills them. Brave is Chromium so the PWA UX is identical; it is
# NOT a daily browser. (Chrome=Flutter web dev, Firefox=daily, Brave=PWAs.)
cask "brave-browser"
# Ungoogled-Chromium is the dedicated host for `chrome-debug` /
# chrome-devtools-mcp on :9222. Same Blink/V8/DevTools/CDP as Google
# Chrome, but with Google sign-in/sync/telemetry stripped out — clean
# process, distinct icon, manual updates only when you ask. Lets the
# agent-controlled browser be visually & process-wise distinct from any
# manually-opened stable-Chrome window. NOT a daily browser; just a
# CDP host for instrumentation.
cask "ungoogled-chromium"
