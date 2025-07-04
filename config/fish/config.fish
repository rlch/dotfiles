# =============================================================================
# Fish Shell Configuration
# =============================================================================

# System limits
ulimit -n 10240
# PATH configuration 
fish_add_path -g \ /opt/homebrew/opt/gnu-sed/libexec/gnubin \ $GOPATH/bin \ $HOME/.cargo/bin \
    /opt/homebrew/bin \
    $HOME/.pub-cache/bin \
    $HOME/fvm/default/bin \
    /opt/local/bin \
    $HOME/.rover/bin \
    $HOME/usr/local/bin \
    $HOME/.local/bin \
    /opt/homebrew/lib/ruby/gems/3.2.0/bin \
    /usr/local/opt/sphinx-doc/bin \
    $HOME/.gem/bin \
    $HOME/.config/fish/bin/named-claude

# =============================================================================
# Environment Variables
# =============================================================================

# Terminal and display
set -x TERM wezterm
set -x XDG_CONFIG_HOME $HOME/.config
set -x MAXWIDTH 999
set -x KITTY_SHELL_INTEGRATION enabled
set fish_greeting

# Editor configuration
set -x EDITOR nvim
set -x GIT_EDITOR nvim
set -x VISUAL nvim
set -x MANPAGER 'nvim +Man!'

# Development tools
set -x GOPATH $HOME/go
set -x GOPRIVATE go.buf.build,github.com
set -x PKG_CONFIG_PATH $PKG_CONFIG_PATH /opt/local/lib/pkgconfig
set -x sponge_purge_only_on_exit true

# Language-specific environments
set -x CARGO_HOME $HOME/.cargo
set -x RUSTFLAGS "-L /opt/homebrew/opt/libpq/lib"

# Project-specific
set -g TUTERO_REGISTRY "australia-southeast1-docker.pkg.dev/mathgaps-56d5a/registry"

# =============================================================================
# Interactive Shell Setup
# =============================================================================

if not status --is-interactive
    return
end
status job-control full

# =============================================================================
# Abbreviations and Aliases
# =============================================================================

# Development tools
abbr f spf
abbr t tmux
abbr tp telepresence
abbr h helm
abbr mk minikube
abbr kk k9s
abbr tf terraform
abbr v "fg &>/dev/null || nvim"
abbr zel zellij

# System aliases
alias intel="arch -x86_64"

# Editor shortcuts
alias org="cd ~/neorg/ && nvim index.norg"
alias efish="cd ~/.config/fish && nvim config.fish"
alias etmux="cd ~/.config/tmux && nvim tmux.conf.local"
alias envim="cd ~/.config/nvim && nvim"
alias vo="nvim +\":setlocal filetype=log | setlocal buftype=nofile\" -"

# Configuration management
alias sfish="source ~/.config/fish/config.fish"

alias cl="claude --ide --continue || claude --ide"

# Utilities
alias dn="say done"

# File listing with eza
if type -q eza
    alias l "eza -l -g --icons"
    alias ll "l -a"
    alias la ll
end

# =============================================================================
# Tool Initialization and Completions
# =============================================================================

# Navigation and prompt
type -q zoxide && zoxide init fish | source
type -q starship && starship init fish | source
type -q atuin && atuin init fish | source

# Command completions
type -q kubectl && kubectl completion fish | source
type -q flux && flux completion fish | source
type -q diesel && diesel completions fish | source

# Language environment managers
type -q pyenv && source (pyenv init --path | psub)
type -q rbenv && source (rbenv init - | psub)

# Load secrets and autoload functions
test -e ~/.config/fish/secrets.fish && cat ~/.config/fish/secrets.fish | source
for f in ~/.config/fish/autoload/*
    source $f
end

# Lua rocks path configuration
for i in (luarocks path | awk '{sub(/PATH=/, "PATH ", $2); print "fish_add_path \"$2\""}')
    eval $i
end

# =============================================================================
# Cloud and External Tool Configuration
# =============================================================================

# Google Cloud SDK
set -x USE_GKE_GCLOUD_AUTH_PLUGIN True
source "$(brew --prefix)/share/google-cloud-sdk/path.fish.inc"

# =============================================================================
# Vi Mode Configuration
# =============================================================================

set fish_cursor_default block
set fish_cursor_insert line
set fish_cursor_replace_one underscore
set fish_cursor_visual block
set fish_vi_force_cursor 1

# =============================================================================
# Package Managers and Runtime Environments
# =============================================================================

# Conda initialization
if test -f ~/miniconda3/bin/conda
    eval ~/miniconda3/bin/conda "shell.fish" hook $argv | source
    conda deactivate
end

# Bun JavaScript runtime
set --export BUN_INSTALL "$HOME/.bun"
set --export PATH $BUN_INSTALL/bin $PATH

# pnpm package manager
set -gx PNPM_HOME /Users/rjm/Library/pnpm
if not string match -q -- $PNPM_HOME $PATH
    set -gx PATH "$PNPM_HOME" $PATH
end

# =============================================================================
# Terminal Multiplexer and Theme Configuration
# =============================================================================

# FZF theme (Catppuccin Macchiato)
set -Ux FZF_DEFAULT_OPTS "\
--color=bg+:#363a4f,bg:#24273a,spinner:#f4dbd6,hl:#ed8796 \
--color=fg:#cad3f5,header:#ed8796,info:#c6a0f6,pointer:#f4dbd6 \
--color=marker:#f4dbd6,fg+:#cad3f5,prompt:#c6a0f6,hl+:#ed8796"

# Zellij terminal multiplexer auto-attach
set ZELLIJ_AUTO_ATTACH true
set ZELLIJ_AUTO_EXIT false
if not set -q ZELLIJ; and test "$TERM_PROGRAM" != vscode
    if test "$ZELLIJ_AUTO_ATTACH" = true
        zellij attach --index 0 || zellij
    else
        zellij
    end

    if test "$ZELLIJ_AUTO_EXIT" = true
        kill $fish_pid
    end
end

# =============================================================================
# External Integrations
# =============================================================================

# OrbStack integration
source ~/.orbstack/shell/init2.fish 2>/dev/null || :
