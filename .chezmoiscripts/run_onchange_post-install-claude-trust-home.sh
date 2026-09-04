#!/usr/bin/env bash
# Ensure Claude Code trusts everything under $HOME in every account config, so
# fresh ~/.herdr/worktrees/<repo>/<slug> checkouts (the opsx-worktree skill,
# ⌃s ⇧g) and ordinary ~/dev repos never hang on the first-run "Do you trust the
# files in this folder?" dialog.
#
# Why it lives here: trust is stored per-account in ~/.claude*/.claude.json under
# projects["<path>"].hasTrustDialogAccepted. clodcurrent's `ensure` symlinks the
# SHARED config (settings.json, CLAUDE.md, hooks, skills) into each account dir,
# but NOT .claude.json — that file is rewritten live per session, so it can't be
# shared. This codifies in dotfiles what used to be poked into each config by
# hand per-worktree (annoying, fragile, and blocked by the auto-permission
# classifier as an ad-hoc security-gate edit).
#
# CORRECTION (2026-09-04): trust is inherited down the tree ONLY up to the cwd's
# git toplevel (cli.js FF/BF walk with LL(cwd) as the boundary). So the $HOME
# entry below covers non-git folders only; every git worktree, submodule or
# clone needs an entry for ITS OWN toplevel. `cl` now writes that per launch via
# ~/.local/bin/claude-trust-path (dot_local/bin). This script keeps the two
# jobs it can do: trust $HOME for non-repo dirs, and repair explicit distrust.
#
# TWO halves, both needed:
#   1. Trust $HOME itself (non-git folders under ~ inherit it).
#   2. Repair explicit distrust. An entry with hasTrustDialogAccepted=false
#      SHADOWS the inherited $HOME trust, so those paths prompt forever no
#      matter what (1) says — Claude writes one whenever a dialog is dismissed
#      or declined. Any such entry under $HOME is flipped back to trusted.
#      Paths OUTSIDE $HOME are never touched.
#
# Idempotent + write-only-if-needed: skips any config already fully current (the
# common case -> zero writes -> never clobbers a live session's config). Runs on
# any host (the glob just finds ~/.claude on a single-account mini).
#
# After onboarding a NEW account (`clodcurrent import-cswap`) its config starts
# empty and would prompt on its first worktree -- re-run `chezmoi apply` (or edit
# this file) to trust $HOME in it too.

set -euo pipefail

python3 - "$HOME" <<'PY'
import glob, json, os, sys, tempfile

home = sys.argv[1]
sep = home.rstrip("/") + "/"
changed = []


def under_home(path):
    return path == home or path.startswith(sep)


for cfg in sorted(glob.glob(os.path.expanduser("~/.claude/.claude.json")) +
                  glob.glob(os.path.expanduser("~/.claude-*/.claude.json"))):
    if "/.claude-swap-backup/" in cfg:
        continue
    try:
        with open(cfg) as fh:
            d = json.load(fh)
    except (OSError, ValueError):
        continue  # unreadable / mid-write -- skip, next apply catches it

    projects = d.setdefault("projects", {})
    projects.setdefault(home, {})

    fixed = 0
    for path, entry in projects.items():
        if not under_home(path) or not isinstance(entry, dict):
            continue  # never touch trust for paths outside $HOME
        if entry.get("hasTrustDialogAccepted") is True and \
           entry.get("hasCompletedProjectOnboarding") is True:
            continue  # already current -- no write
        entry["hasTrustDialogAccepted"] = True
        entry["hasCompletedProjectOnboarding"] = True
        fixed += 1

    if not fixed:
        continue

    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(cfg))
    try:
        with os.fdopen(fd, "w") as fh:
            json.dump(d, fh, indent=2)
        with open(tmp) as fh:
            json.load(fh)  # re-parse guard before the atomic swap
        os.replace(tmp, cfg)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise
    changed.append(f"{os.path.basename(os.path.dirname(cfg))}({fixed})")

print(f"claude-trust: trusted $HOME + repaired distrust in {len(changed)} "
      f"config(s): {', '.join(changed) or 'none (all already current)'}")
PY
