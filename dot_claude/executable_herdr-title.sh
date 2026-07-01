#!/bin/sh
# herdr-title.sh — drive herdr's agents-list rows (and tab labels) from Claude
# Code's own conversation title, so the priority/attention panel is scannable
# instead of a wall of identical "claude" rows.
#
# herdr agents-list row is two lines: `<workspace> · <tab>` / `<state> · <display_agent>`.
# We map them so each line carries DIFFERENT info (no double-up):
#
#   workspace     → git repo / dir basename        (line 1 left  — WHERE)
#   tab           → Claude's ai-title (the topic)   (line 1 right — WHAT)
#   display_agent → git branch / worktree          (line 2 right — WHICH branch)
#   state         → working/idle/… (untouched)      (line 2 left  — STATUS)
#   pane label    → DISABLED (never set)            (border stays default)
#
# The topic comes from Claude Code's `ai-title` transcript record (the text it
# also emits as the OSC-2 terminal title). herdr — unlike a normal terminal —
# doesn't map OSC-2, so we bridge it. Zero LLM cost: Claude already
# computed the title; we just forward it.
#
# Wired to the Stop hook (turn-end): fresh title, non-blocking. Refresh on
# change; provenance = we only update while herdr still shows what we last set,
# so a manual `herdr … rename` wins and we back off (clearing re-opens).
#
# Safety: always exits 0, writes nothing to stdout (a Stop hook must not block
# turn-end or leak output). No `set -e`.

[ "${HERDR_ENV:-}" = "1" ]      || exit 0
[ -n "${HERDR_PANE_ID:-}" ]     || exit 0
[ -n "${HERDR_SOCKET_PATH:-}" ] || exit 0
command -v herdr   >/dev/null 2>&1 || exit 0
command -v python3 >/dev/null 2>&1 || exit 0

HERDR_TITLE_PAYLOAD="$(cat 2>/dev/null || true)" \
python3 - "$HERDR_PANE_ID" "${HERDR_TAB_ID:-}" "${HERDR_WORKSPACE_ID:-}" <<'PY' >/dev/null 2>&1 || true
import json, os, re, subprocess, sys

pane_id = sys.argv[1]
tab_id  = sys.argv[2] or None
ws_id   = sys.argv[3] or None

def herdr(*args):
    try:
        return subprocess.run(["herdr", *args], capture_output=True, text=True, timeout=5).stdout
    except Exception:
        return ""

def herdr_result(*args):
    try:
        return json.loads(herdr(*args))["result"]
    except Exception:
        return {}

def git(cwd, *args):
    try:
        return subprocess.run(["git", "-C", cwd, *args], capture_output=True, text=True, timeout=3).stdout.strip()
    except Exception:
        return ""

# hook payload → transcript path + cwd
try:
    payload = json.loads(os.environ.get("HERDR_TITLE_PAYLOAD") or "{}")
except Exception:
    payload = {}
tx  = payload.get("transcript_path") or ""
cwd = payload.get("cwd") or os.getcwd()

# topic = latest ai-title, else latest user prompt's first line
ai = last = None
if tx and os.path.exists(tx):
    try:
        with open(tx) as f:
            for line in f:
                try: d = json.loads(line)
                except Exception: continue
                t = d.get("type")
                if t == "ai-title" and d.get("aiTitle"):
                    ai = d["aiTitle"].strip()
                elif t == "last-prompt" and d.get("lastPrompt"):
                    last = d["lastPrompt"]
    except Exception:
        pass

topic = ai or ""
if not topic and last:
    topic = next((l.strip() for l in last.splitlines() if l.strip()), "")
topic = " ".join(topic.split())
if len(topic) > 50:
    topic = topic[:49].rstrip() + "…"

# per-pane state = what we last set (provenance / back-off)
cache = os.path.join(os.environ.get("XDG_CACHE_HOME") or os.path.expanduser("~/.cache"), "herdr-title")
try: os.makedirs(cache, exist_ok=True)
except Exception: pass
statef = os.path.join(cache, re.sub(r"[^A-Za-z0-9_.-]", "_", pane_id) + ".json")
try: state = json.load(open(statef))
except Exception: state = {}

def maybe_set(kind, current, desired, is_default, apply_fn):
    if not desired:
        return
    if current == desired:
        state[kind] = desired
        return
    if current in (None, "", state.get(kind)) or is_default(current):
        apply_fn(desired)
        state[kind] = desired
    # else: user-owned → leave alone

pane = herdr_result("pane", "get", pane_id).get("pane", {})

# pane border: DISABLED — clear a label we set before (leave user labels alone),
# and never set one, so the border shows herdr's default.
if state.get("pane") and (pane.get("label") or None) == state.get("pane"):
    herdr("pane", "rename", pane_id, "--clear")
state.pop("pane", None)

# tab ← ai-title (topic). herdr's default tab label is the tab's DISPLAY
# POSITION (a bare integer), which is NOT the same as tab.number (the stable
# creation id): they diverge as soon as tabs are opened/closed/reordered. So
# "still default, safe to overwrite" = the label is purely numeric — matching
# a specific number ("2" == str(5)) would mis-read a repositioned tab's plain
# positional default as a user label and never title it (the tab-title bug).
if tab_id and topic:
    tab = herdr_result("tab", "get", tab_id).get("tab", {})
    maybe_set("tab", tab.get("label"), topic,
              lambda c: (c or "").strip().isdigit(),
              lambda d: herdr("tab", "rename", tab_id, d))

# agents-list line 2 name ← git branch (via display_agent). Clear if no branch,
# so it falls back to the plain agent label ("claude").
branch = git(cwd, "rev-parse", "--abbrev-ref", "HEAD")
cur_da = pane.get("display_agent") or None
if branch and branch != "HEAD":
    maybe_set("da", cur_da, branch,
              lambda c: False,
              lambda d: herdr("pane", "report-metadata", pane_id, "--source", "herdr:title",
                              "--display-agent", d, "--clear-title"))
elif cur_da and cur_da == state.get("da"):
    herdr("pane", "report-metadata", pane_id, "--source", "herdr:title",
          "--clear-display-agent", "--clear-title")
    state.pop("da", None)

# workspace ← git repo / dir basename (stable). herdr's cwd-basename default is
# fair game to overwrite; a name you set yourself is not.
if ws_id:
    root = git(cwd, "rev-parse", "--show-toplevel")
    cwd_base = os.path.basename(cwd.rstrip("/")) or "~"
    ws_name  = os.path.basename(root) if root else cwd_base
    ws = herdr_result("workspace", "get", ws_id).get("workspace", {})
    maybe_set("ws", ws.get("label"), ws_name,
              lambda c: c == cwd_base,
              lambda d: herdr("workspace", "rename", ws_id, d))

try: json.dump(state, open(statef, "w"))
except Exception: pass
PY

exit 0
