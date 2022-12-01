function k --wraps kubectl
  for arg in $argv
    if test "$arg" = "-n"; or test "$arg" = "--namespace"
      set override 0
    end
  end
  if set -q LOCAL_NAMESPACE; and not set -q override
    kubectl $argv -n $LOCAL_NAMESPACE
  else
    kubectl $argv
  end
end
