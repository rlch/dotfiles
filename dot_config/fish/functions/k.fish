function k --wraps kubectl --description 'kubectl, with $LOCAL_NAMESPACE auto-injection (knl to set, knl -c to clear)'
    if test (count $argv) -eq 0
        k9s
        return
    end

    set -l override 0
    for arg in $argv
        if test "$arg" = -n -o "$arg" = --namespace
            set override 1
        end
    end

    if set -q LOCAL_NAMESPACE; and test $override -eq 0
        kubectl $argv -n $LOCAL_NAMESPACE
    else
        kubectl $argv
    end
end
