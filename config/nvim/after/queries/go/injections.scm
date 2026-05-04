; extends

; Cypher injection for neogo adapter
; Matches .Cypher(`...`) method calls
((call_expression
  function: (selector_expression
    field: (field_identifier) @_method)
  arguments: (argument_list
    (raw_string_literal
      (raw_string_literal_content) @injection.content)))
  (#eq? @_method "Cypher")
  (#set! injection.language "cypher")
  (#set! injection.combined))
