# fzf.fish tuning — augments the PatrickF1/fzf.fish plugin loaded via fisher.
# These vars are read at search time, so setting them in conf.d is enough; they
# layer on top of the Catppuccin FZF_DEFAULT_OPTS set in config.fish.

# Drive file/directory search through fd (fast, respects .gitignore).
set -gx fzf_fd_opts --hidden --exclude=.git

# Preview pane for the directory search (⌃⌥F): eza for dirs, bat for files.
set -gx fzf_directory_opts \
    --preview 'test -d {} && eza -la --icons --color=always {} || bat --color=always --style=numbers {}'

# Reminders (no config needed — these bindings ship with the plugin):
#   ⌃⌥F  search files/dirs      ⌃R   search history
#   ⌃⌥L  browse git log         ⌃⌥S  browse git status
#   ⌃⌥P  search processes       ⌃V   search $variables
