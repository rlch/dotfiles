json="$(cat)"
PROJECT_DIR=$(echo "$json" | jq -r '.cwd')
MSG=$(echo "$json" | jq -r '.message // "Done"')

if cd "$PROJECT_DIR" 2>/dev/null && repo=$(basename "$(git rev-parse --show-toplevel)" 2>/dev/null); then
  name="$repo"
else
  name=$(basename "$PROJECT_DIR")
fi

zellij pipe "zjstatus::notify::[$name] $MSG"
