ulimit -n 10240

set -x TERM xterm-kitty
set -x GOPATH $HOME/go
set -x GOPRIVATE go.buf.build,github.com
set -x PATH /opt/homebrew/opt/gnu-sed/libexec/gnubin $PATH $GOPATH/bin $HOME/.cargo/bin /opt/homebrew/bin $HOME/.pub-cache/bin $HOME/fvm/default/bin /opt/homebrew/opt/gnu-sed/libexec/gnubin /opt/local/bin $HOME/.rover/bin $HOME/usr/local/bin $HOME/.local/bin /opt/homebrew/lib/ruby/gems/3.2.0/bin /usr/local/opt/sphinx-doc/bin
set -x XDG_CONFIG_HOME $HOME/.config
set -x PKG_CONFIG_PATH $PKG_CONFIG_PATH /opt/local/lib/pkgconfig
set fish_greeting

set -x EDITOR nvim
set -x VISUAL nvim
set -x MANPAGER 'nvim +Man!'
set -x MAXWIDTH 999

status job-control full
set -x KITTY_SHELL_INTEGRATION enabled

# GAR
set -g TUTERO_REGISTRY "australia-southeast1-docker.pkg.dev/mathgaps-56d5a/registry"

# Rust
set -x CARGO_HOME $HOME/.cargo
set -x RUSTFLAGS "-L /opt/homebrew/opt/libpq/lib"

# CLI
abbr t "tmux"
abbr tp "tmuxp"
abbr h "helm"
abbr mk "minikube"
abbr kk "k9s"
abbr tf "terraform"
abbr v "fg &> /dev/null || nvim"
abbr c "cd"
abbr zel "zellij"

alias cb=clipboard
alias intel="arch -x86_64"

alias gmt="go mod tidy"
alias gmv="go mod vendor"
alias gmtv="go mod tidy && go mod vendor"

# Neovim entrypoints
alias org="cd ~/neorg/ && nvim index.norg"
alias efish="cd ~/.config/fish && nvim config.fish"
alias etmux="cd ~/.config/tmux && nvim tmux.conf.local"
alias envim="cd ~/.config/nvim && nvim"

# Sources
alias sfish="source ~/.config/fish/config.fish"
 
# Misc
alias vo="nvim +\":setlocal filetype=log | setlocal buftype=nofile\" -"
alias dn="say done"

# Docker
alias dcub="docker compose up d && lazydocker"
alias dcub="docker compose up --build -d && lazydocker"
alias dcd="docker compose down"

if type -q exa
  alias l "exa -l -g --icons"
  alias la "l -a"
end

starship init fish | source
kubectl completion fish | source
flux completion fish | source
diesel completions fish | source
source (pyenv init --path | psub)
source (rbenv init - | psub)
cat ~/.config/fish/secrets.fish | source
for i in (luarocks path | awk '{sub(/PATH=/, "PATH ", $2); print "set -gx "$2}'); eval $i; end

set -x USE_GKE_GCLOUD_AUTH_PLUGIN True
[ -f ~/.google-cloud-sdk/path.fish.inc ]; and source '/Users/rjm/.google-cloud-sdk/path.fish.inc'

# test -n "$TMUX" || tmux a || tmux

# Vi mode

set fish_cursor_default block
set fish_cursor_insert line
set fish_cursor_replace_one underscore
set fish_cursor_visual block

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/rjm/Downloads/google-cloud-sdk/path.fish.inc' ]; . '/Users/rjm/Downloads/google-cloud-sdk/path.fish.inc'; end
