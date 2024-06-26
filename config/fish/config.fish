ulimit -n 10240

fish_add_path /opt/homebrew/opt/gnu-sed/libexec/gnubin $GOPATH/bin $HOME/.cargo/bin /opt/homebrew/bin $HOME/.pub-cache/bin $HOME/fvm/default/bin /opt/homebrew/opt/gnu-sed/libexec/gnubin /opt/local/bin $HOME/.rover/bin $HOME/usr/local/bin $HOME/.local/bin /opt/homebrew/lib/ruby/gems/3.2.0/bin /usr/local/opt/sphinx-doc/bin
set -x TERM wezterm
set -x GOPATH $HOME/go
set -x GOPRIVATE go.buf.build,github.com
set -x XDG_CONFIG_HOME $HOME/.config
set -x PKG_CONFIG_PATH $PKG_CONFIG_PATH /opt/local/lib/pkgconfig
set fish_greeting

set -x EDITOR nvim
set -x GIT_EDITOR nvim
set -x VISUAL nvim
set -x MANPAGER 'nvim +Man!'
set -x MAXWIDTH 999
set -x KITTY_SHELL_INTEGRATION enabled

# Rust
set -x CARGO_HOME $HOME/.cargo
set -x RUSTFLAGS "-L /opt/homebrew/opt/libpq/lib"

# Tutero
set -g TUTERO_REGISTRY "australia-southeast1-docker.pkg.dev/mathgaps-56d5a/registry"

if not status --is-interactive
    return
end
status job-control full

# CLI
abbr t tmux
abbr tp telepresence
abbr h helm
abbr mk minikube
abbr kk k9s
abbr tf terraform
abbr v "fg &>/dev/null || nvim"
abbr zel zellij

alias intel="arch -x86_64"

alias gmt="go mod tidy"
alias gmv="go mod vendor"
alias gmtv="go mod tidy && go mod vendor"

# Neovim entrypoints
alias org="cd ~/neorg/ && nvim index.norg"
alias efish="cd ~/.config/fish && nvim config.fish"
alias etmux="cd ~/.config/tmux && nvim tmux.conf.local"
alias envim="cd ~/.config/nvim && nvim"
alias vo="nvim +\":setlocal filetype=log | setlocal buftype=nofile\" -"

# Sources
alias sfish="source ~/.config/fish/config.fish"

# Misc
alias dn="say done"

if type -q exa
    alias l "exa -l -g --icons"
    alias ll "l -a"
    alias la ll
end

type -q zoxide && zoxide init fish | source
type -q starship && starship init fish | source
type -q kubectl && kubectl completion fish | source
type -q flux && flux completion fish | source
type -q diesel && diesel completions fish | source
type -q pyenv && source (pyenv init --path | psub)
type -q rbenv && source (rbenv init - | psub)
test -e ~/.config/fish/secrets.fish && cat ~/.config/fish/secrets.fish | source
type -q atuin && atuin init fish | source
for f in ~/.config/fish/autoload/*
    source $f
end
for i in (luarocks path | awk '{sub(/PATH=/, "PATH ", $2); print "set -gx "$2}')
    eval $i
end

set -x USE_GKE_GCLOUD_AUTH_PLUGIN True
source "$(brew --prefix)/share/google-cloud-sdk/path.fish.inc"

# Vi mode

set fish_cursor_default block
set fish_cursor_insert line
set fish_cursor_replace_one underscore
set fish_cursor_visual block
set fish_vi_force_cursor 1

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
if test -f ~/miniconda3/bin/conda
    eval ~/miniconda3/bin/conda "shell.fish" hook $argv | source
    conda deactivate
end
# <<< conda initialize <<<

# bun
set --export BUN_INSTALL "$HOME/.bun"
set --export PATH $BUN_INSTALL/bin $PATH

# fzf theme
set -Ux FZF_DEFAULT_OPTS "\
--color=bg+:#363a4f,bg:#24273a,spinner:#f4dbd6,hl:#ed8796 \
--color=fg:#cad3f5,header:#ed8796,info:#c6a0f6,pointer:#f4dbd6 \
--color=marker:#f4dbd6,fg+:#cad3f5,prompt:#c6a0f6,hl+:#ed8796"

set ZELLIJ_AUTO_ATTACH true
set ZELLIJ_AUTO_EXIT false
if not set -q ZELLIJ
    if test "$ZELLIJ_AUTO_ATTACH" = true
        zellij attach --index 0 || zellij
    else
        zellij
    end

    if test "$ZELLIJ_AUTO_EXIT" = true
        kill $fish_pid
    end
end
