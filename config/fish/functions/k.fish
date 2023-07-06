function k --wraps kubectl
  if test (count $argv) -eq 0
    k9s
  end
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

function kn
  set ns $argv[1]
  if not test -n "$ns"
    echo "Namespace not provided."
  else
    kubectl config set-context --current --namespace=$argv
  end
end

function knl
  for arg in $argv
    if test "$arg" = "-c"; or test "$arg" = "--clear"
      echo "Clearing local namespace"
      set -e LOCAL_NAMESPACE
      return
    end
  end

  set ns $argv[1]
  if not test -n "$ns"
    echo "Namespace not provided."
  else
    set -g LOCAL_NAMESPACE $ns
    echo "Namespace set to $ns."
  end
end

