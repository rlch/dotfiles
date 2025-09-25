local wezterm = require("wezterm")
local act = wezterm.action
local config = {}

if wezterm.config_builder then
	config = wezterm.config_builder()
end

config.color_scheme = "Catppuccin Mocha"
config.font = wezterm.font("JetBrains Mono")
config.enable_tab_bar = false
config.default_prog = { "/opt/homebrew/bin/fish", "-l" }
config.enable_kitty_keyboard = true
config.window_padding = {
	left = 1,
	right = 1,
	top = 1,
	bottom = 1,
}
config.keys = {
	{
		key = "v",
		mods = "CMD",
		action = act.PasteFrom("Clipboard"),
	},
	{
		key = "h",
		mods = "CTRL|SHIFT",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "j",
		mods = "CTRL|SHIFT",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "k",
		mods = "CTRL|SHIFT",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "l",
		mods = "CTRL|SHIFT",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "Delete",
		action = wezterm.action.SendKey({ key = "Delete" }),
	},
	-- {
	-- 	key = "f",
	-- 	mods = "CTRL",
	-- 	action = wezterm.action.DisableDefaultAssignment,
	-- },
	{
		key = "Enter",
		mods = "ALT",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "Enter",
		mods = "SHIFT",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "LeftArrow",
		mods = "CTRL",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "RightArrow",
		mods = "CTRL",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "Space",
		mods = "CTRL",
		action = wezterm.action.DisableDefaultAssignment,
	},
	{
		key = "p",
		mods = "CTRL|SHIFT",
		action = wezterm.action.DisableDefaultAssignment,
	},
}

config.window_decorations = "RESIZE"
config.hyperlink_rules = wezterm.default_hyperlink_rules()
-- make username/project paths clickable. this implies paths like the following are for github.
-- ( "nvim-treesitter/nvim-treesitter" | wbthomason/packer.nvim | wez/wezterm | "wez/wezterm.git" )
-- as long as a full url hyperlink regex exists above this it should not match a full url to
-- github or gitlab / bitbucket (i.e. https://gitlab.com/user/project.git is still a whole clickable url)
table.insert(config.hyperlink_rules, {
	regex = [[["]?([\w\d]{1}[-\w\d]+)(/){1}([-\w\d\.]+)["]?]],
	format = "https://www.github.com/$1/$3",
})

config.notification_handling = "AlwaysShow"

config.front_end = "WebGpu"

wezterm.on("window-config-reloaded", function(window, _)
	window:toast_notification("wezterm", "configuration reloaded!", nil, 4000)
end)

return config
