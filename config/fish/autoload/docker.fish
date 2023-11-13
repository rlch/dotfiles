function d --wraps docker
  if test (count $argv) -gt 0
    docker $argv
  else
    lazydocker
  end
end

alias dcub="docker compose up d && lazydocker"
alias dcub="docker compose up --build -d && lazydocker"
alias dcd="docker compose down"
