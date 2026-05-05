function kn --description 'kubectl set-context namespace (kubeconfig-level switch)'
    set -l ns $argv[1]
    if not test -n "$ns"
        echo "Namespace not provided."
        return 1
    end
    kubectl config set-context --current --namespace=$ns
end
