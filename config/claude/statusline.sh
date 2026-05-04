#!/usr/bin/env bash


input=$(cat)

cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')
model=$(echo "$input" | jq -r '.model.display_name // empty')
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
transcript=$(echo "$input" | jq -r '.transcript_path // empty')
input_tokens=$(echo "$input" | jq -r '.context_window.total_input_tokens // "0"')
output_tokens=$(echo "$input" | jq -r '.context_window.total_output_tokens // "0"')
lines_added=$(echo "$input" | jq -r '.cost.total_lines_added // "0"')
lines_removed=$(echo "$input" | jq -r '.cost.total_lines_removed // "0"')

# ANSI colors
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
INVERT='\033[7m'
INVERT_BOLD='\033[1;7m'
PRIMARY_BOLD='\033[1;38;2;249;226;175m'
PRIMARY_INVERT_BOLD='\033[1;7;38;2;249;226;175m'
ACCENT_BOLD='\033[1;38;2;137;180;250m'
ACCENT_INVERT_BOLD='\033[1;7;38;2;137;180;250m'
WHITE_BOLD='\033[1;38;2;205;214;244m'
WHITE_INVERT_BOLD='\033[1;7;38;2;205;214;244m'
TOKEN_BOLD='\033[1;38;2;242;205;205m'
TOKEN_INVERT_BOLD='\033[1;7;38;2;242;205;205m'
LINES_BOLD='\033[1;38;2;203;166;247m'
LINES_INVERT_BOLD='\033[1;7;38;2;203;166;247m'
GREEN_DEEP='\033[38;2;64;100;62m'
GREEN_DEEP_BG='\033[1;48;2;64;100;62;38;2;205;214;244m'
RED_DEEP='\033[38;2;120;60;75m'
RED_DEEP_BG='\033[1;48;2;120;60;75;38;2;205;214;244m'
PRIMARY_DIM='\033[1;7;38;2;180;164;120m'
PRIMARY_DIM_FG='\033[1;38;2;180;164;120m'
TOKEN_DIM='\033[1;7;38;2;180;150;150m'
TOKEN_DIM_FG='\033[1;38;2;180;150;150m'

LEFT_SEMI=''
RIGHT_SEMI=''

chip() {
  local color_bold="$1" color_invert_bold="$2" content="$3"
  echo "${color_bold}${LEFT_SEMI}${color_invert_bold}${content}${RESET}${color_bold}${RIGHT_SEMI}${RESET}"
}

GREEN='\033[38;2;166;227;161m'
ORANGE='\033[38;2;249;226;175m'
RED='\033[38;2;243;139;168m'

# --- 1. Repo / folder chip ---
dir="${cwd:-$(pwd)}"
# Try to find git root from the cwd
git_root=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)
repo_label=""
if [ -n "$git_root" ]; then
  repo_name=$(basename "$git_root")
  branch=$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ "$dir" = "$git_root" ]; then
    repo_label=" $repo_name"
  else
    rel=$(realpath --relative-to="$git_root" "$dir" 2>/dev/null || echo "${dir#$git_root/}")
    folder_name=$(basename "$rel")
    repo_label=" ${repo_name}/${folder_name}"
  fi
else
  repo_label="󰉋 $(basename "$dir")"
fi

if [ -n "$branch" ]; then
  repo_chip="${PRIMARY_BOLD}${LEFT_SEMI}${PRIMARY_INVERT_BOLD}${repo_label} ${PRIMARY_DIM} ${branch}${RESET}${PRIMARY_DIM_FG}${RIGHT_SEMI}${RESET}"
else
  repo_chip=$(chip "$PRIMARY_BOLD" "$PRIMARY_INVERT_BOLD" "$repo_label")
fi
# █
# --- 2. Context usage progress bar ---
if [ -n "$used" ] && [ "$used" != "null" ]; then
  used_int=${used%.*}
  used_int=${used_int:-0}
else
  used_int=0
fi

# Interpolate color from green to red starting at 30%
# Below 30%: solid green. 30-100%: green -> yellow -> red
if [ "$used_int" -le 30 ]; then
  cr=166; cg=227; cb=161
else
  # t = 0..100 mapped from 30%..80%, clamped at 100
  t=$(( (used_int - 30) * 100 / 50 ))
  [ "$t" -gt 100 ] && t=100
  # Green(166,227,161) -> Yellow(249,226,175) -> Red(243,139,168)
  if [ "$t" -le 50 ]; then
    # Green -> Yellow (t: 0..50)
    cr=$(( 166  + (249 - 166)  * t / 50 ))
    cg=$(( 227 + (226 - 227) * t / 50 ))
    cb=$(( 161 + (175  - 161) * t / 50 ))
  else
    # Yellow -> Red (t: 50..100)
    t2=$(( t - 50 ))
    cr=$(( 249 + (243 - 249) * t2 / 50 ))
    cg=$(( 226 + (139 - 226) * t2 / 50 ))
    cb=$(( 175  + (168 - 175)  * t2 / 50 ))
  fi
fi
ctx_color="\033[38;2;${cr};${cg};${cb}m"
# Dark variant: ~40% brightness of the main color
dr=$(( cr * 2 / 5 ))
dg=$(( cg * 2 / 5 ))
db=$(( cb * 2 / 5 ))
ctx_color_dark="\033[38;2;${dr};${dg};${db}m"
ctx_color_dark_bg="\033[48;2;${dr};${dg};${db}m"

# Build a 15-char progress bar with percentage label in the middle
bar_width=15
filled=$((used_int * bar_width / 100))
label="${used_int}%"
label_len=${#label}
label_start=$(((bar_width - label_len) / 2))
label_end=$((label_start + label_len))

ctx_color_bg="${ctx_color//38;2/48;2}"
dark_fg='\033[38;2;30;30;30m'
light_fg='\033[38;2;180;180;180m'

# Start cap (pill left)
if [ 0 -lt "$filled" ]; then
  bar="${ctx_color}${LEFT_SEMI}${RESET}"
else
  bar="${ctx_color_dark}${LEFT_SEMI}${RESET}"
fi
for i in $(seq 0 $((bar_width - 1))); do
  is_label=false
  if [ "$i" -ge "$label_start" ] && [ "$i" -lt "$label_end" ]; then
    is_label=true
    char="${label:$((i - label_start)):1}"
  else
    char="█"
  fi

  if [ "$is_label" = true ]; then
    # Label chars: per-character filled/unfilled coloring
    if [ "$i" -lt "$filled" ]; then
      # Filled label: dark fg on bright bg
      bar="${bar}${BOLD}${ctx_color_bg}${ctx_color_dark}${char}${RESET}"
    else
      # Unfilled label: bright fg on dark bg
      bar="${bar}${BOLD}${ctx_color_dark_bg}${ctx_color}${char}${RESET}"
    fi
  else
    # Block chars
    if [ "$i" -lt "$filled" ]; then
      bar="${bar}${ctx_color}${char}${RESET}"
    else
      bar="${bar}${ctx_color_dark}${char}${RESET}"
    fi
  fi
done
# End cap (pill right)
if [ "$((bar_width - 1))" -lt "$filled" ]; then
  bar="${bar}${ctx_color}${RIGHT_SEMI}${RESET}"
else
  bar="${bar}${ctx_color_dark}${RIGHT_SEMI}${RESET}"
fi

ctx_segment=" ${bar}"

# --- 3. Model segment ---
model_segment=""
if [ -n "$model" ] && [ "$model" != "null" ]; then
  model_segment=" $(chip "$ACCENT_BOLD" "$ACCENT_INVERT_BOLD" "✦ $model")"
fi

# --- 4. Session duration ---
duration_segment=""
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  # Get modification time of transcript file as a proxy for last activity
  # Use creation time of transcript directory as session start
  transcript_dir=$(dirname "$transcript")
  if stat --version >/dev/null 2>&1; then
    # GNU stat
    start_epoch=$(stat -c %Y "$transcript" 2>/dev/null)
    # Walk up to find oldest mtime in session dir as approximation
    start_epoch=$(stat -c %W "$transcript" 2>/dev/null || stat -c %Y "$transcript" 2>/dev/null)
  else
    # BSD stat (macOS)
    start_epoch=$(stat -f %B "$transcript" 2>/dev/null || stat -f %m "$transcript" 2>/dev/null)
  fi
  if [ -n "$start_epoch" ] && [ "$start_epoch" != "0" ]; then
    now_epoch=$(date +%s)
    elapsed=$((now_epoch - start_epoch))
    hours=$((elapsed / 3600))
    minutes=$(((elapsed % 3600) / 60))
    if [ "$hours" -gt 0 ]; then
      duration_segment=" $(chip "$WHITE_BOLD" "$WHITE_INVERT_BOLD" "󰥔 ${hours}h${minutes}m")"
    else
      duration_segment=" $(chip "$WHITE_BOLD" "$WHITE_INVERT_BOLD" "󰥔 ${minutes}m")"
    fi
  fi
fi

# --- 5. Token count chip ---
fmt_tokens() {
  local t=$1
  if [ "$t" -ge 1000000 ]; then
    printf "%.1fM" "$(echo "$t / 1000000" | bc -l)"
  elif [ "$t" -ge 1000 ]; then
    printf "%.1fk" "$(echo "$t / 1000" | bc -l)"
  else
    echo "$t"
  fi
}
in_fmt=$(fmt_tokens "$input_tokens")
out_fmt=$(fmt_tokens "$output_tokens")
token_segment="${TOKEN_BOLD}${LEFT_SEMI}${TOKEN_INVERT_BOLD} ${in_fmt} ${TOKEN_DIM} ${out_fmt}${RESET}${TOKEN_DIM_FG}${RIGHT_SEMI}${RESET}"

# --- 6. Lines changed chip ---
lines_segment="${GREEN_DEEP}${LEFT_SEMI}${GREEN_DEEP_BG} ${lines_added} ${RED_DEEP_BG}  ${lines_removed}${RESET}${RED_DEEP}${RIGHT_SEMI}${RESET}"

# --- 7. Caveman mode chip ---
caveman_segment=""
caveman_flag="$HOME/.claude/.caveman-active"
if [ -f "$caveman_flag" ]; then
  caveman_mode=$(cat "$caveman_flag" 2>/dev/null)
  if [ -n "$caveman_mode" ] && [ "$caveman_mode" != "off" ]; then
    CAVEMAN_BOLD='\033[1;38;2;215;153;33m'
    CAVEMAN_INVERT_BOLD='\033[1;7;38;2;215;153;33m'
    caveman_suffix=$(echo "$caveman_mode" | tr '[:lower:]' '[:upper:]')
    caveman_label="󱢷 ${caveman_suffix}"
    caveman_segment=" $(chip "$CAVEMAN_BOLD" "$CAVEMAN_INVERT_BOLD" "$caveman_label")"
  fi
fi

echo -e "${repo_chip}${model_segment}${duration_segment}${ctx_segment} ${token_segment} ${lines_segment}${caveman_segment}"
