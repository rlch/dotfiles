---@diagnostic disable: undefined-global
return {
  snippet(
    "avro-record",
    fmt(
      [[
      {
        "type": "record",
        "name": "<name>",
        "namespace": "<namespace>",
        "fields": [
          <fields>
        ]
      }
      ]],
      {
        name = i(1, "name"),
        namespace = d(2, function()
          local repo_path = vim.fn.system({
            "git",
            "rev-parse",
            "--show-toplevel",
          })
          if repo_path == "" or repo_path == nil then
            return sn(nil, { i(nil, "") })
          end
          local repo_name = repo_path:gsub("^%s*(.*/)([^%s]*)%s*$", "%2")
          repo_name = repo_name:gsub("-", "")
          return sn(nil, { t(repo_name) })
        end),
        fields = i(3, ""),
      },
      { delimiters = "<>" }
    )
  ),
}
