I = function(table)
  local pkg = debug.getinfo(2).source:match("@?(.*)")
  return vim.notify(pkg .. "\n" .. vim.inspect(table), vim.log.levels.INFO)
end
