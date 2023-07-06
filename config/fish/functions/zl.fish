function zl
  if not test -f layout.kdl
    return
  end
  set NAME (basename "$PWD")
  for EXISTING in (zellij action query-tab-names)
    if [ "$EXISTING" = "$NAME" ]
      zellij action go-to-tab-name "$NAME"
      return
    end
  end
  zellij action new-tab -l layout.kdl -n "$NAME"
end
