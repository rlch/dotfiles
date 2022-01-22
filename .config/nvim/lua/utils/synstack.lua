return {
  get_highlight_groups = function()
    local groups = " "
    for _,val in pairs(vim.fn.synstack(vim.fn.line("."), vim.fn.col("."))) do
     groups = groups .. vim.fn.synIDattr(val, "name") .. " "
    end
    print(groups)
  end
}
