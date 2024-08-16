vim.filetype.add({
  pattern = {
    ["*.gotmpl"] = "gotmpl",
    [".*%.(%w+)%.tmpl"] = function(_, _, ext)
      return ext
    end,
    ["Dockerfile.*"] = function()
      return "dockerfile"
    end,
  },
})
