vim.filetype.add({
  extension = {
    waku = "waku",
    gotmpl = "gotmpl",
    vars = "vars",
    query = "query",
  },
  pattern = {
    [".*%.taskmaster/docs/.*%.txt"] = "md",
    -- ["*.vars"] = "env",
    -- ["*.gotmpl"] = "gotmpl",
    -- [".*%.(%w+)%.tmpl"] = function(_, _, ext)
    --   return ext
    -- end,
    ["Dockerfile.*"] = function()
      return "dockerfile"
    end,
  },
})
