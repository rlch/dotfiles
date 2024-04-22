function _tabjump
    zl
    if test "$argv" != - -a $status -ne 0
        cd -
    end
end

function c --wraps z
    z $argv
    _tabjump $argv
end

function cc --wraps z
    z $argv
end

function ci --wraps zi
    zi $argv
    _tabjump $argv
end
