; Local variable definitions and scopes for Waku Lang

; Scopes
[
  (document)
  (if_statement)
  (else_if_clause)
  (else_clause)
  (for_statement)
  (function_declaration)
  (lambda)
  (match_arm)
] @local.scope

; Definitions
(variable_declaration
  pattern: (pattern (identifier) @local.definition.var))

(function_declaration
  name: (identifier) @local.definition.function)

(function_parameter
  name: (identifier) @local.definition.parameter)

(lambda_parameter
  name: (identifier) @local.definition.parameter)

(for_statement
  pattern: (identifier) @local.definition.var)

(type_definition
  name: (identifier) @local.definition.type)

(enum_definition
  name: (identifier) @local.definition.type)

(enum_variant
  name: (identifier) @local.definition.enum_variant)

; Pattern definitions
(tuple_pattern
  (pattern (identifier) @local.definition.var))

(array_pattern
  (pattern (identifier) @local.definition.var))

(object_pattern_field
  pattern: (pattern (identifier) @local.definition.var))

(as_pattern
  name: (identifier) @local.definition.var)

(rest_pattern
  (identifier) @local.definition.var)

; References
(identifier) @local.reference