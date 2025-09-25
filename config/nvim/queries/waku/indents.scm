; Indents for Waku Lang

; Increase indent for block bodies
[
  (paired_block)
  (if_statement)
  (else_if_clause)
  (else_clause)
  (for_statement)
  (match_expression)
  (object)
  (object_type)
  (list)
  (tuple)
  (function_declaration)
  (enum_definition)
] @indent.begin

; Specific nodes that end indentation
[
  "}"
  "]"
  ")"
  ">"
] @indent.end

; Nodes that should have their bodies indented
(paired_block
  body: (_) @indent.align)

(if_statement
  "{" @indent.begin
  "}" @indent.end)

(else_if_clause
  "{" @indent.begin
  "}" @indent.end)

(else_clause
  "{" @indent.begin
  "}" @indent.end)

(for_statement
  "{" @indent.begin
  "}" @indent.end)

(match_expression
  "{" @indent.begin
  "}" @indent.end)

; Don't indent closing tags at same level as opening
(paired_block
  close_name: (_) @indent.branch)