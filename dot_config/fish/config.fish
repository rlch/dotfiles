# =============================================================================
# Fish entry — runs after conf.d/*.fish (which is where fisher-installed
# plugins live: done, sponge, fzf.fish).
# =============================================================================

# Quiet shell.
set fish_greeting

# --- PATH -------------------------------------------------------------------
# Keep this list short and intentional. Tool-specific PATH entries belong
# to mise (`mise use <tool>`) or the tool's own installer.
fish_add_path -g \
    /opt/homebrew/opt/rustup/bin \
    /opt/homebrew/bin \
    /opt/homebrew/opt/gnu-sed/libexec/gnubin \
    /opt/homebrew/opt/python@3.13/libexec/bin \
    $HOME/.local/bin \
    $HOME/.cargo/bin \
    $HOME/go/bin \
    $HOME/fvm/default/bin   # fvm's globally-selected Flutter — populated by `fvm global <ver>`

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

# gh enhance — bubbletint theme id (https://lrstanley.github.io/bubbletint/).
set -x ENHANCE_THEME catppuccin_mocha

# revdiff — UI theme (status bar/borders/panels) + chroma syntax theme +
# vim-style motions. UI theme is initialized on first install via
# `revdiff --init-themes` — see .chezmoiscripts/run_onchange_post-install-revdiff.sh.tmpl.
set -x REVDIFF_THEME        mocha-clear
set -x REVDIFF_CHROMA_STYLE catppuccin-mocha
set -x REVDIFF_VIM_MOTION   true
set -x REVDIFF_LINE_NUMBERS true
set -x REVDIFF_WORD_DIFF    true

# Point SSH_AUTH_SOCK at 1Password's agent so non-OpenSSH clients (Go-based
# tools like upterm, terraform, gcloud, yazi VFS, etc.) find the keys. The
# `ssh` binary itself reads `IdentityAgent` from ~/.ssh/config and ignores
# this var, so OpenSSH behaviour is unchanged.
set -gx SSH_AUTH_SOCK "$HOME/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"

# Claude Code — flicker-free fullscreen TUI (alt-screen renderer with
# virtualized scrollback). Equivalent to `/tui fullscreen`, but persistent
# across sessions. https://code.claude.com/docs/en/env-vars
set -gx CLAUDE_CODE_NO_FLICKER 1

# Headroom — local LLM context-compression proxy. Persistent Docker container
# managed by the Docker-native `headroom install` wrapper.
set -gx HEADROOM_PORT     8787
set -gx HEADROOM_HOST     127.0.0.1
set -gx HEADROOM_MODE     token
set -gx HEADROOM_BACKEND  anthropic
set -gx ANTHROPIC_BASE_URL http://127.0.0.1:8787

# fzf — Catppuccin Mocha (matches tmux + ghostty)
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
abbr tx  tmux
abbr gw  worktree-tui
abbr cld 'cl --dangerously-skip-permissions'
abbr n   pnpm
abbr frb flutter_rust_bridge_codegen
abbr ai  cl

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

# Docker compose
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
type -q atuin    && atuin init fish --disable-up-arrow | source
type -q mise     && mise activate fish | source
type -q direnv   && direnv hook fish | source

# Completions for tools that don't ship fish completions natively.
type -q kubectl     && kubectl completion fish | source
type -q flux        && flux completion fish | source
type -q claude-squad && claude-squad completion fish | source

# --- Secrets (not tracked) --------------------------------------------------
test -e ~/.config/fish/secrets.fish && source ~/.config/fish/secrets.fish

# Note: tmux is NOT auto-attached on startup — type `tmux` (or `tx`) when
# you want a multiplexed session.

# Added by OrbStack: command-line tools and integration
# This won't be added again if you remove it.
source ~/.orbstack/shell/init2.fish 2>/dev/null || :
