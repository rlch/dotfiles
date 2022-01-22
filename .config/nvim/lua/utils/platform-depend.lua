local mt = {
	__index = {
		linux = nil,
		macos = nil,
		windows = nil,
	},
}

return function(options)
	options = setmetatable(options, mt)

	if vim.fn.has("mac") == 1 then
		return options.macos
	elseif vim.fn.has("unix") == 1 then
		return options.linux
	else
		return options.windows
	end
end
