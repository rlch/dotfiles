function gmt
    go mod tidy
end

function gmv
    if test -n "$(go env GOWORK)"
        go work vendor
    else
        go mod vendor
    end
end

function gmtv
    gmt
    gmv
end
