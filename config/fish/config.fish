if status is-interactive
    # Commands to run in interactive sessions can go here
end

set -x TERM xterm-kitty

ulimit -n 10240

set -x GOPATH $HOME/go
set -x GOPRIVATE go.buf.build,github.com
set -x PATH /opt/homebrew/opt/gnu-sed/libexec/gnubin $PATH $GOPATH/bin $HOME/.cargo/bin /opt/homebrew/bin $HOME/.pub-cache/bin $HOME/fvm/default/bin /opt/homebrew/opt/gnu-sed/libexec/gnubin /opt/local/bin $HOME/.rover/bin $HOME/usr/local/bin $HOME/.local/bin /usr/local/opt/sphinx-doc/bin
set -x XDG_CONFIG_HOME $HOME/.config
set -x PKG_CONFIG_PATH $PKG_CONFIG_PATH /opt/local/lib/pkgconfig
set fish_greeting

# GAR
set -g TUTERO_REGISTRY "australia-southeast1-docker.pkg.dev/mathgaps-56d5a/registry"

# CLI
abbr t "tmux"
abbr tp "tmuxp"
abbr h "helm"
abbr mk "minikube"
abbr kk "k9s"
abbr tf "terraform"
abbr v "fg &> /dev/null || nvim"
alias cb=clipboard
alias intel="arch -x86_64"

# Nvim entrypoints
alias org="cd ~/neorg/ && nvim index.norg"
alias efish="cd ~/.config/fish && nvim config.fish"
alias etmux="cd ~/.config/tmux && nvim tmux.conf.local"
alias envim="cd ~/.config/nvim && nvim ."

# Sources
alias sfish="source ~/.config/fish/config.fish"
 
# Misc
alias vo="nvim +\":setlocal filetype=log | setlocal buftype=nofile\" -"
alias dn="say done"

# Docker
abbr d "lazydocker"
alias dcub="docker compose up d && lazydocker"
alias dcub="docker compose up --build -d && lazydocker"
alias dcd="docker compose down"

if type -q exa
  alias l "exa -l -g --icons"
  alias la "l -a"
  alias ll "exa -l -g --icons"
  alias lla "ll -a"
end

set -x EDITOR nvim
set -x VISUAL nvim
set -x MANPAGER 'nvim +Man!'
set -x MAXWIDTH 999

starship init fish | source
kubectl completion fish | source
flux completion fish | source
source (pyenv init --path | psub)
for i in (luarocks path | awk '{sub(/PATH=/, "PATH ", $2); print "set -gx "$2}'); eval $i; end

set -x USE_GKE_GCLOUD_AUTH_PLUGIN True
[ -f ~/.google-cloud-sdk/path.fish.inc ]; and source '/Users/rjm/.google-cloud-sdk/path.fish.inc'
[ -f /opt/homebrew/share/autojump/autojump.fish ]; and source /opt/homebrew/share/autojump/autojump.fish

test -n "$TMUX" || tmux a || tmux

# Vi mode

set fish_cursor_default block
set fish_cursor_insert line
set fish_cursor_replace_one underscore
set fish_cursor_visual block
