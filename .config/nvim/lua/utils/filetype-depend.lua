return function(filetype_table)
	return function()
		local bufnr = vim.api.nvim_get_current_buf()
		local ft = vim.api.nvim_buf_get_option(bufnr, 'filetype')

		local cmd = filetype_table[ft] or filetype_table['_']
		if type(cmd) == 'function' then
			cmd()
		end
	end
end
