I = function(table, print_pkg)
  local log = vim.inspect(table)
  if print_pkg then
    log = log .. "\n" .. debug.getinfo(2).source:match("@?(.*)")
  end
  return vim.notify(log, vim.log.levels.INFO)
end
