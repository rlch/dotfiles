vim.filetype.add({
  pattern = {
    [".*%.(%w+)%.tmpl"] = function(_, _, ext)
      return ext
    end,
    ["Dockerfile.*"] = function()
      return "dockerfile"
    end,
  },
})
