function gmv --description 'go mod vendor (or go work vendor inside a workspace)'
    if test -n (go env GOWORK)
        go work vendor
    else
        go mod vendor
    end
end
