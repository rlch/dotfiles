function zl
  set NAME (basename "$PWD")
  set LAYOUT_NAME ""
  if test -f layout.kdl
    set LAYOUT_NAME layout.kdl
  else if git rev-parse --is-inside-work-tree &>/dev/null
    set NAME (basename (git rev-parse --show-toplevel))
    set LAYOUT_NAME compact
  end
  if test -z $LAYOUT_NAME
    return 0
  end

  for EXISTING in (zellij action query-tab-names)
    if [ "$EXISTING" = "$NAME" ]
      zellij action go-to-tab-name "$NAME"
      return 1
    end
  end
  zellij action new-tab -l $LAYOUT_NAME -n "$NAME"
  return 2
end
