if status is-interactive
    # Commands to run in interactive sessions can go here
end

ulimit -n 10240

set -x GOPATH $HOME/go
set -x PATH $PATH $GOPATH/bin $HOME/.cargo/bin /opt/homebrew/bin $HOME/.pub-cache/bin $HOME/fvm/default/bin /opt/homebrew/opt/gnu-sed/libexec/gnubin /opt/local/bin
set -x XDG_CONFIG_HOME $HOME/.config
set -x PKG_CONFIG_PATH $PKG_CONFIG_PATH /opt/local/lib/pkgconfig

alias t="tmux"
alias tp="tmuxp"
alias v="nvim"
alias g="gitui"
alias cb=clipboard
alias dotfiles='/usr/bin/git --git-dir=/Users/rjm/.dotfiles/ --work-tree=/Users/rjm'
alias dn="say done"
alias luamake=/Users/rjm/.config/nvim/lua-language-server/3rd/luamake/luamake
alias intel="arch -x86_64"

if type -q exa
  alias l "exa -l -g --icons"
  alias ll "exa -l -g --icons"
  alias lla "ll -a"
end

set -x TUT $HOME/Coding/Tutero
set -x MONO $TUT/monorepo

set -x EDITOR nvim
set -x VISUAL nvim
set -x MANPAGER 'nvim +Man!'
set -x MAXWIDTH 999

starship init fish | source
source (pyenv init --path | psub)

source '/Users/rjm/.google-cloud-sdk/path.fish.inc'

[ -f /opt/homebrew/share/autojump/autojump.fish ]; and source /opt/homebrew/share/autojump/autojump.fish
