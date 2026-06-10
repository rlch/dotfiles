---
name: tmp-cleanup
description: Safely clean scratch files out of /tmp on macOS without breaking running processes. Use when the user wants to clean up /tmp, free disk space in /tmp, purge tmp scratch, says "/tmp is full", "clear out tmp", "tmp janitor", or asks to reclaim space from accumulated logs/screenshots/scratch under /tmp. Preserves anything breakage-prone — tmux sockets, Claude Code runtime, ssh/gpg agents, any open file, and recently-touched entries — and deletes only idle, user-owned scratch. Dry-run by default.
---

# /tmp cleanup (macOS)

Reclaims scratch space from `/tmp` while **never** deleting anything that could
break a running process. The judgment is encoded in the bundled
`clean-tmp.sh` — prefer running it over hand-rolled `rm`, because freehand
deletion of `/tmp` is exactly how you kill a live tmux server or the agent's
own session dir.

## The one gotcha: `/tmp` is a symlink

On macOS `/tmp -> private/tmp`. BSD `find` does **not** descend a symlink given
as a start point, so `find /tmp ...` silently traverses nothing. Always operate
on `/private/tmp`. The script already does; remember it for any ad-hoc check.

## Run it

```sh
~/.claude/skills/tmp-cleanup/clean-tmp.sh           # dry-run (default) — shows what WOULD go
~/.claude/skills/tmp-cleanup/clean-tmp.sh --apply   # actually delete
~/.claude/skills/tmp-cleanup/clean-tmp.sh --days 7  # only entries idle >7 days (default 3)
~/.claude/skills/tmp-cleanup/clean-tmp.sh --all     # ignore age guard (still honours guards 1–4)
```

**Always show the dry-run first and let the user confirm before `--apply`.**
Deleting files is hard to reverse and the user works on several things in
parallel — a screenshot or log they're mid-task on may be in `/tmp`.

## What it preserves (and why)

An entry is kept if **any** of these hold — listed strongest-guard first:

1. **Not owned by the current user** — system / other-user state, off-limits.
2. **Socket or FIFO** — a live IPC endpoint; removing it breaks the peer.
3. **Open by a running process** (`lsof`) — the real "could break things" guard.
   Catches a build still writing a log, a running game dumping a PNG, etc.
4. **Modified within `--days N`** (default 3) — active-session safety, so today's
   work survives even if nothing has it open right now.
5. **Protected name glob** — belt-and-braces for IPC/runtime dirs that may have
   no open fd at the instant you check:
   - `tmux-*` — tmux server socket dirs. Deleting these severs every attached
     client. The glob covers any named server (`-L foo`) the user may spin up
     ad-hoc as well as the default.
   - `claude-*` — Claude Code runtime: per-project state, cwd markers, sockets.
     Deleting this can break the very session doing the cleanup.
   - `ssh-*`, `gpg-*`, `gnupg-*` — agent forwarding sockets.
   - `com.apple.*`, `.*-unix` — OS / X11-style IPC dirs.
   - `powerlog` — drop dir used by `powermetrics` perf tooling.

Everything else — idle, user-owned, unopened scratch (logs, PNGs, PDFs, `.rs`/
`.py`/`.luau` scratch, probe/bench dirs) — is fair game.

## Adjusting the protected set

If a new daemon starts parking breakage-prone state in `/tmp`, add its name
pattern to `is_protected_name()` in `clean-tmp.sh`. Keep the list to things
whose **absence breaks a process** — ordinary scratch should rely on the
open-file + age guards, not a name exemption, so it actually gets cleaned.

## This is a dotfiles-managed skill

Source lives at `~/dev/dotfiles/dot_claude/skills/tmp-cleanup/`; the deployed
copy at `~/.claude/skills/tmp-cleanup/` is written by `chezmoi apply`. Edit the
source, then `chezmoi apply`, never the deployed copy. See the `dotfiles` skill.
