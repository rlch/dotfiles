; Keywords
[
  "if"
  "else"
] @keyword.conditional

[
  "for"
] @keyword.repeat

[
  "fn"
] @keyword.function

[
  "type"
  "enum"
] @keyword.type

[
  "match"
  "template"
] @keyword



; Operators
[
  "="
  "->"
  "."
  "|"
  "@"
  "..."
] @operator

; Binary operators
(addition_operator) @operator
(multiplication_operator) @operator
(comparison_operator) @operator
(equality_operator) @operator
(and_operator) @operator
(or_operator) @operator

; Unary operators
"!" @operator

; Punctuation
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
  "/"
] @punctuation.bracket

[
  ","
  ":"
] @punctuation.delimiter

; Comments
(comment) @comment

; Literals
(string) @string
(escape_sequence) @string.escape
(integer) @number
(float) @number.float
(boolean) @boolean

; Types
(basic_type) @type.builtin
(block_type) @type.builtin

; Type annotations
(type_annotation) @type
(type_definition name: (identifier) @type.definition)
(enum_definition name: (identifier) @type.definition)
(enum_variant name: (identifier) @constructor)

; Functions
(function_declaration name: (identifier) @function)
(call function: (identifier) @function.call)
(method_call method: (identifier) @function.method.call)

; Parameters
(function_parameter name: (identifier) @variable.parameter)
(lambda_parameter name: (identifier) @variable.parameter)

; Variables
(variable_declaration pattern: (pattern (identifier) @variable))
(identifier) @variable

; Patterns
(wildcard_pattern) @variable.builtin
(as_pattern name: (identifier) @variable)

; Blocks/Elements
(paired_block name: (identifier) @tag)
(paired_block close_name: (identifier) @tag)
(self_closing_block name: (identifier) @tag)
(template_call name: (identifier) @tag)

; Tag delimiters
["<" ">" "</" "/>"] @tag.delimiter

; Attributes
(attribute name: (identifier) @tag.attribute)

; Fields
(field_access field: (identifier) @variable.member)
(object_field key: (identifier) @property)
(object_pattern_field key: (identifier) @property)
(type_field name: (identifier) @property)

