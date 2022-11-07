if status is-interactive
    # Commands to run in interactive sessions can go here
end

set -x TERM xterm-kitty

ulimit -n 10240

set -x GOPATH $HOME/go
set -x GOPRIVATE go.buf.build,github.com
set -x PATH /opt/homebrew/opt/gnu-sed/libexec/gnubin $PATH $GOPATH/bin $HOME/.cargo/bin /opt/homebrew/bin $HOME/.pub-cache/bin $HOME/fvm/default/bin /opt/homebrew/opt/gnu-sed/libexec/gnubin /opt/local/bin $HOME/.rover/bin $HOME/usr/local/bin $HOME/.local/bin
set -x XDG_CONFIG_HOME $HOME/.config
set -x PKG_CONFIG_PATH $PKG_CONFIG_PATH /opt/local/lib/pkgconfig
set -g TUTERODEV_DOCKER "australia-southeast1-docker.pkg.dev/mathgaps-dev-b044f/tuterodev"
set fish_greeting

# CLI
alias t="tmux"
alias tp="tmuxp"
alias v="fg &> /dev/null || nvim"
alias cb=clipboard
alias intel="arch -x86_64"
alias h="helm"
alias mk="minikube"
alias tf="terraform"

# Nvim entrypoints
alias org="cd ~/neorg/ && v index.norg"
alias efish="cd ~/.config/fish && v config.fish"
alias etmux="cd ~/.config/tmux && v tmux.conf.local"
alias envim="cd ~/.config/nvim && v ."

# Sources
alias sfish="source ~/.config/fish/config.fish"
 
# Misc
alias vo="nvim +\":setlocal filetype=log | setlocal buftype=nofile\" -"
alias dn="say done"

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

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
# eval /Users/rjm/miniforge3/bin/conda "shell.fish" "hook" $argv | source
# <<< conda initialize <<<
