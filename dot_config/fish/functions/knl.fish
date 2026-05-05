function knl --description 'set $LOCAL_NAMESPACE for k() (knl <ns>); knl -c clears it'
    for arg in $argv
        if test "$arg" = -c -o "$arg" = --clear
            echo "Clearing local namespace"
            set -e LOCAL_NAMESPACE
            return
        end
    end

    set -l ns $argv[1]
    if not test -n "$ns"
        echo "Namespace not provided."
        return 1
    end
    set -g LOCAL_NAMESPACE $ns
    echo "Namespace set to $ns."
end
