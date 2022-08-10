function kn
  set ns $argv[1]
  if not test -n "$ns"
    echo "Namespace not provided."
  else
    kubectl config set-context --current --namespace=$argv
  end
end
