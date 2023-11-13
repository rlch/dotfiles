local wezterm = require("wezterm")
local config = {}

if wezterm.config_builder then
	config = wezterm.config_builder()
end

config.color_scheme = "catppuccin-macchiato"
config.font = wezterm.font("JetBrains Mono")
config.enable_tab_bar = false
config.default_prog = { "/opt/homebrew/bin/fish", "-l" }
config.enable_kitty_keyboard = true
config.window_padding = {
	left = 0,
	right = 0,
	top = 0,
	bottom = 0,
}

return config
