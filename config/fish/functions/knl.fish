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

