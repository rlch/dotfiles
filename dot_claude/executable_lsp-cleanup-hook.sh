#!/usr/bin/env bash
# Claude Code SessionEnd hook — kill LSP servers spawned by THIS session.
#
# Why: the official LSP plugins (rust-analyzer-lsp, gopls-lsp, pyright-lsp,
# typescript-lsp, lua-lsp) put their language-server binary on $PATH and
# claude spawns one per session. The plugins ship with no cleanup hooks, so
# the spawned LSPs survive after `claude` exits — rust-analyzer alone holds
# 4-8 GB once a workspace is fully analysed, and they accumulate across
# sessions and worktrees until the system runs out of RAM.
#
# Strategy: walk up our process ancestry to find this session's `claude`
# PID, then kill only its direct LSP children (and their descendants like
# rust-analyzer-proc-macro-srv). Per-session isolation means exiting one
# claude doesn't blow away LSPs belonging to other concurrent sessions.
#
# Registered in ~/.claude/settings.json on SessionEnd with matcher `.*`.

set -uo pipefail

# Drain stdin (Claude Code feeds JSON; we don't use it).
cat >/dev/null 2>&1 || true

# Walk up to find the nearest `claude` ancestor. Cap depth so we can't loop.
pid=$$
claude_pid=""
for _ in $(seq 1 12); do
    pid=$(ps -p "$pid" -o ppid= 2>/dev/null | tr -d ' ')
    [ -z "$pid" ] && break
    [ "$pid" = "1" ] && break
    comm=$(ps -p "$pid" -o comm= 2>/dev/null | tr -d ' ')
    base=$(basename "$comm" 2>/dev/null)
    if [ "$base" = "claude" ]; then
        claude_pid="$pid"
        break
    fi
done

[ -z "$claude_pid" ] && exit 0

# Kill direct LSP children of claude_pid + their descendants.
for cpid in $(pgrep -P "$claude_pid" 2>/dev/null); do
    cmd=$(ps -p "$cpid" -o command= 2>/dev/null)
    case "$cmd" in
        */rust-analyzer*|*/gopls*|*/pyright*|*/typescript-language-server*|*/lua-language-server*)
            # Descendants first (rust-analyzer-proc-macro-srv, pyright workers, ...)
            pkill -TERM -P "$cpid" 2>/dev/null || true
            kill -TERM "$cpid" 2>/dev/null || true
            ;;
    esac
done

exit 0
