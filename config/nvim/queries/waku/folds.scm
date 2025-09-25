; Folding queries for Waku Lang

; Blocks
(paired_block
  ">" @fold.start
  "</" @fold.end) @fold

; Control flow
(if_statement
  "{" @fold.start
  "}" @fold.end) @fold

(else_if_clause
  "{" @fold.start
  "}" @fold.end) @fold

(else_clause
  "{" @fold.start
  "}" @fold.end) @fold

(for_statement
  "{" @fold.start
  "}" @fold.end) @fold

; Functions
(function_declaration
  body: (_) @fold) @fold

; Match expressions
(match_expression
  "{" @fold.start
  "}" @fold.end) @fold

; Data structures
(object
  "{" @fold.start
  "}" @fold.end) @fold

(list
  "[" @fold.start
  "]" @fold.end) @fold

; Type definitions
(object_type
  "{" @fold.start
  "}" @fold.end) @fold

(enum_definition
  "{" @fold.start
  "}" @fold.end) @fold

; Comments (for multi-line comment support in future)
(comment) @fold