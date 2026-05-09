#!/usr/bin/env python3
"""Slugify a tmux window title to <= MAX_LEN chars.

Wired by `set-hook -g window-renamed` in tmux.conf. Argv: window_id.
Reads the current name via `tmux display-message`, slugifies, renames if
different. Idempotent: slugify(slug) == slug, so the recursive hook fires
on rename but exits early on the equality check.

Pure text only — tab status badges (agent sparkle, agent-done bell, zoom
fullscreen) are rendered around #W by window-status-format / -current
in tmux.conf via @tab-prefix and @tab-badge. The window name itself is
never decorated here; toggling a badge is just `tmux set-option -w
@<flag>`, and the format picks it up within status-interval.

Pipeline (first match wins):
  1. SHORT          length <= MAX and not path-like                    → pass
  2. PREFIX-STRIP   matches "Claude Code[: —-]+..." or "claude:..."    → recurse
  3. PATH           contains '/' or starts with '~'                    → basename
  4. NLP            multi-word → score-and-pick salient token
  5. COMPRESS       vowel-drop per kebab-segment, then hard truncate
"""

from __future__ import annotations

import re
import subprocess
import sys

MAX_LEN = 10

STOP_TOKENS = {
    "a", "an", "the", "to", "for", "in", "of", "and", "or", "on", "at",
    "with", "from", "by", "as", "is", "into", "via",
}

VERBS = {
    "plan", "migrate", "add", "fix", "implement", "refactor", "debug",
    "update", "create", "remove", "change", "build", "write", "port",
    "swap", "audit", "investigate", "explore", "design", "dissolve",
    "rename", "delete", "move", "drop", "ship", "test", "review",
}

LOW_INFO_NOUNS = {
    "config", "configuration", "system", "components", "component",
    "module", "modules", "files", "file", "code", "plugin", "plugins",
    "support", "setup", "stuff", "thing", "things", "panel", "menu",
    "stuff",
}

CLAUDE_PREFIX = re.compile(
    r"^\s*(?:[✳✦*]\s*)?claude(?:\s+code)?\s*[:—\-–]?\s*", re.IGNORECASE
)

VOWELS = set("aeiouAEIOU")
TOKEN_SPLIT = re.compile(r"[\s\(\)\[\]—–:,→·]+")


def vowel_drop(word: str) -> str:
    if len(word) <= 1:
        return word
    return word[0] + "".join(c for c in word[1:] if c not in VOWELS)


def looks_like_path(s: str) -> bool:
    return "/" in s or s.startswith("~")


def basename(path: str) -> str:
    s = path.rstrip("/")
    return s.rsplit("/", 1)[-1] if "/" in s else s


def score(token: str) -> int:
    s = 0
    if len(token) >= 2 and token.isupper():
        s += 3                                          # ALLCAPS: RFC, API, CI
    elif token[0].isupper() and any(c.islower() for c in token):
        s += 2                                          # Proper noun: Zellij, OAuth
    if len(token) >= 4:
        s += 1                                          # informative length
    return s


def nlp_pick(title: str) -> str | None:
    raw = [t for t in TOKEN_SPLIT.split(title) if t]
    candidates: list[str] = []
    for i, tok in enumerate(raw):
        cleaned = tok.strip(".,;:'\"!?")
        if not cleaned:
            continue
        low = cleaned.lower()
        if low in STOP_TOKENS:
            continue
        if i == 0 and low in VERBS:
            continue
        if low in LOW_INFO_NOUNS:
            continue
        candidates.append(cleaned)
    if not candidates:
        return None
    # Tie → last (discriminator usually ends the phrase).
    best = candidates[0]
    best_score = score(best)
    for tok in candidates[1:]:
        sc = score(tok)
        if sc >= best_score:
            best, best_score = tok, sc
    return best


def slugify(title: str, max_len: int = MAX_LEN) -> str:
    title = title.strip()
    if not title:
        return title

    # 1. SHORT
    if len(title) <= max_len and not looks_like_path(title):
        return title

    # 2. PREFIX-STRIP — recurse
    stripped = CLAUDE_PREFIX.sub("", title)
    if stripped and stripped != title:
        return slugify(stripped, max_len)

    # 3. PATH
    if looks_like_path(title):
        title = basename(title)
        if len(title) <= max_len:
            return title

    # 4. NLP
    if len(TOKEN_SPLIT.split(title)) >= 2:
        picked = nlp_pick(title)
        if picked:
            title = picked
            if len(title) <= max_len:
                return title

    # 5. COMPRESS — vowel-drop per kebab-segment, then hard truncate.
    compressed = "-".join(vowel_drop(p) for p in title.split("-"))
    return compressed[:max_len]


def main() -> int:
    if len(sys.argv) < 2:
        return 0
    wid = sys.argv[1]
    try:
        name = subprocess.check_output(
            ["tmux", "display-message", "-p", "-t", wid, "#W"],
            stderr=subprocess.DEVNULL,
        ).decode().strip()
    except Exception:
        return 0
    if not name:
        return 0

    slug = slugify(name)
    if not slug or slug == name:
        return 0

    subprocess.run(
        ["tmux", "rename-window", "-t", wid, "--", slug],
        check=False,
        stderr=subprocess.DEVNULL,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
