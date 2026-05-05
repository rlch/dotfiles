# =============================================================================
# Fish entry — runs after conf.d/*.fish (which is where fisher-installed
# plugins live: done, sponge, fzf.fish, fish-ai).
# =============================================================================

# Quiet shell.
set fish_greeting

# --- PATH -------------------------------------------------------------------
# Keep this list short and intentional. Tool-specific PATH entries belong
# to mise (`mise use <tool>`) or the tool's own installer.
fish_add_path -g \
    /opt/homebrew/bin \
    /opt/homebrew/opt/gnu-sed/libexec/gnubin \
    /opt/homebrew/opt/python@3.13/libexec/bin \
    $HOME/.local/bin \
    $HOME/.cargo/bin \
    $HOME/go/bin

# --- Env --------------------------------------------------------------------
set -x EDITOR    nvim
set -x VISUAL    nvim
set -x GIT_EDITOR nvim
set -x MANPAGER  'nvim +Man!'
set -x XDG_CONFIG_HOME $HOME/.config

# Go
set -x GOPATH    $HOME/go
set -x GOPRIVATE go.buf.build,github.com

# Rust
set -x CARGO_HOME $HOME/.cargo
set -x RUSTFLAGS  "-L /opt/homebrew/opt/libpq/lib"

# Sourcegraph amp (used by `ai` abbr)
set -x AMP_URL 'http://localhost:8317'

# fzf — Catppuccin Mocha (matches zellij + ghostty)
set -gx FZF_DEFAULT_OPTS "\
--color=bg+:#313244,bg:#1E1E2E,spinner:#F5E0DC,hl:#F38BA8 \
--color=fg:#CDD6F4,header:#F38BA8,info:#CBA6F7,pointer:#F5E0DC \
--color=marker:#B4BEFE,fg+:#CDD6F4,prompt:#CBA6F7,hl+:#F38BA8 \
--color=selected-bg:#45475A \
--color=border:#6C7086,label:#CDD6F4"

# --- Abbreviations ----------------------------------------------------------
# Tools
abbr tm  task-master
abbr wr  wrangler
abbr tp  telepresence
abbr h   helm
abbr mk  minikube
abbr kk  k9s
abbr tf  terraform
abbr v   "fg &>/dev/null || nvim"
abbr zel zellij
abbr gw  worktree-tui
abbr cld 'cl --dangerously-skip-permissions'
abbr n   pnpm
abbr frb flutter_rust_bridge_codegen
abbr ai  'amp --ide --dangerously-allow-all'

# CLI utilities
abbr f   yazi
abbr j   just
abbr bt  btop
abbr we  watchexec

# chezmoi (dotfiles management)
abbr cz   'chezmoi apply -v'
abbr czd  'chezmoi diff'
abbr cze  'chezmoi edit -a'
abbr czcd 'chezmoi cd'
abbr czre 'chezmoi re-add'

# Edit configs (open the chezmoi source in nvim — apply via `cz` after).
abbr efish 'nvim ~/dev/dotfiles/dot_config/fish/config.fish'
abbr envim 'nvim ~/dev/dotfiles/dot_config/nvim'
abbr edot  'cd ~/dev/dotfiles && nvim'

# Flutter helpers
alias fpg  "flutter pub get"
alias fc   "flutter clean"
alias frm  "flutter run -d macos"
alias frc  "flutter run -d chrome"
alias frcc "flutter run -d chrome --web-header=Cross-Origin-Opener-Policy=same-origin --web-header=Cross-Origin-Embedder-Policy=require-corp"

# Docker compose (the `d` function handles bare `docker` / `lazydocker`)
alias dcub "docker compose up --build -d && lazydocker"
alias dcd  "docker compose down"

# Misc
alias intel "arch -x86_64"
alias dn    "say done"
alias vo    "nvim +\":setlocal filetype=log | setlocal buftype=nofile\" -"
alias cbo   "tee /dev/tty | cb"
alias sfish "source ~/.config/fish/config.fish"

# eza file listing
if type -q eza
    alias l  "eza -l -g --icons"
    alias ll "l -a"
    alias la ll
end

# --- Vi mode ----------------------------------------------------------------
set fish_cursor_default     block
set fish_cursor_insert      line
set fish_cursor_replace_one underscore
set fish_cursor_visual      block
set fish_vi_force_cursor    1

# --- Interactive-only setup -------------------------------------------------
status --is-interactive; or return
status job-control full

# --- Tool init --------------------------------------------------------------
type -q zoxide   && zoxide init fish | source
type -q starship && starship init fish | source
type -q atuin    && atuin init fish | source
type -q mise     && mise activate fish | source
type -q direnv   && direnv hook fish | source

# Completions for tools that don't ship fish completions natively.
type -q kubectl     && kubectl completion fish | source
type -q flux        && flux completion fish | source
type -q claude-squad && claude-squad completion fish | source

# --- Secrets (not tracked) --------------------------------------------------
test -e ~/.config/fish/secrets.fish && source ~/.config/fish/secrets.fish

# Note: zellij is NOT auto-attached on startup — type `zellij` (or `zel`) when
# you want a multiplexed session.
