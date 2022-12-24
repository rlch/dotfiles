function d --wraps docker
  if test (count $argv) -gt 0
    docker $argv
  else
    lazydocker
  end
end
