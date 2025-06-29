vim.filetype.add({
  extension = {
    gotmpl = "gotmpl",
    vars = "vars",
    query = "query",
  },
  pattern = {
    ["*.vars"] = "env",
    ["*.gotmpl"] = "gotmpl",
    [".*%.(%w+)%.tmpl"] = function(_, _, ext)
      return ext
    end,
    ["Dockerfile.*"] = function()
      return "dockerfile"
    end,
  },
})
