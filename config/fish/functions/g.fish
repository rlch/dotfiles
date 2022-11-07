function g
  if test (count $argv) -gt 0
    git $argv
  else
    gitui
  end
end
