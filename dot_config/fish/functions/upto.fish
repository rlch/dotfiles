function upto -a where --description 'cd up to a named ancestor directory'
    set -l pieces (pwd | tr / \n)
    if contains -- $where $pieces
        set -l p (contains --index -- $where $pieces)
        set -l dest (printf "%s\n" $pieces[1..$p] | tr \n /)
        cd "$dest"
        return
    end
    return 1
end
