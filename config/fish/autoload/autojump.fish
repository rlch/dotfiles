function _tabjump
    set -x GUARD_TAB 1
    zl
    # return to previous directory if zl succeeded
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
