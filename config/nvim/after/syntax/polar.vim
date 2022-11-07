" Polar syntax file
" Language:     Polar
" Maintainer:   Weihang Lo
" URL:          https://github.com/weihanglo/polar.vim

if exists("b:current_syntax")
    finish
endif

syn match   polarInlineQuery    /?=/
syn match   polarSemicolon      /;/

syn keyword polarKeyword        and cut debug forall if in isa matches mod new not or print rem

syn keyword polarTodo           contained TODO FIXME NOTE
syn region  polarComment        start=/#/ end=/$/ contains=polarTodo,@Spell

syn match   polarOperator       /:=/
syn match   polarOperator       "[*/+\-|]"
syn match   polarOperator       /[=!<>]=\?/

syn keyword polarBoolean        true false
syn match   polarNumber         /\<[+\-]\?\d*\.\?\d\+\([eE][+\-]\?\d\+\)\?\>/
syn region  polarString         start=+"+ skip=+\\\\\|\\"+ end=+"+ contains=polarEscape
syn match   polarEscape         contained /\\\([nrt0\\'"]\|x\x\{2}\)/ display

syn match   polarHeadName       /\<\K\k*\>\ze\_s*(/ skipwhite skipempty nextgroup=polarHeadArgs
syn region  polarHeadArgs       contained start=/(/  end=/)/ contains=@polarExpression,polarHeadArgType nextgroup=polarSemicolon
syn match   polarHeadArgType    contained /:\_s*\zs\<\K\k*\>/
syn region  polarBody           contained start=/\<if\>/ end=/;/ contains=@polarExpression

syn match   polarClassName      /\<\K\k*\>\ze\_s*{/ skipwhite skipempty nextgroup=polarClassFields
syn region  polarClassFields    contained start=/{/ end=/}/ contains=@polarExpression

syntax cluster polarExpression  contains=
    \polarSemicolon,polarComment,polarKeyword,polarOperator,
    \polarBoolean,polarNumber,polarString,
    \polarHeadName,polarHeadArgs,polarBody,polarClassName,polarClassFields

hi def link polarInlineQuery    Macro
hi def link polarSemicolon      Ignore
hi def link polarKeyword        Keyword
hi def link polarTodo           Todo
hi def link polarComment        Comment
hi def link polarOperator       Operator
hi def link polarBoolean        Boolean
hi def link polarNumber         Number
hi def link polarString         String
hi def link polarEscape         Special
hi def link polarHeadName       Function
hi def link polarHeadArgType    Type
hi def link polarClassName      Type
