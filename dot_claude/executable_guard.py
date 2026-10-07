#!/usr/bin/env python3
"""PreToolUse hook: refuse the few things the global CLAUDE.md forbids outright.

A hook still blocks under bypassPermissions, where `ask` rules are skipped and
`Bash(git stash:*)` patterns miss `git -C dir stash`. It reads the command the
model wrote (hooks all see the original input, before rtk's rewrite), and fails
open on anything it cannot parse. Exit 2 with the reason on stderr blocks the call.

Run `guard.py --selftest` after editing.
"""
import json
import os
import re
import shlex
import subprocess
import sys

HOME = os.path.expanduser("~")
PROTECTED = ("main", "master")
WRAPPERS = {"rtk", "proxy", "command", "env", "time", "noglob", "sudo", "exec"}
GIT_OPTS_WITH_VALUE = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"}
HERDR_CREATES = {("tab", "create"), ("pane", "split"), ("workspace", "create"), ("worktree", "create")}
HERDR_FOCUS_NOUNS = {"workspace", "tab", "pane", "agent"}
MANAGED_ROOTS = tuple(os.path.join(HOME, d) + "/" for d in (".config", ".claude", ".agents", ".local"))
UNMANAGED = (os.path.join(HOME, ".claude", "projects") + "/",)


def strip_heredocs(cmd):
    out, delim = [], None
    for line in cmd.split("\n"):
        if delim is not None:
            if line.strip() == delim:
                delim = None
            continue
        out.append(line)
        m = re.search(r"<<-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1", line)
        if m:
            delim = m.group(2)
    return "\n".join(out)


def segments(cmd):
    """Yield (env assignments, argv) for each simple command in a shell line."""
    cmd = strip_heredocs(cmd).replace("\\\n", " ").replace("\n", " ; ")
    lex = shlex.shlex(cmd, posix=True, punctuation_chars=";&|()")
    lex.whitespace_split = True
    seg = []
    for tok in list(lex) + [";"]:
        if tok and set(tok) <= set(";&|()"):
            if seg:
                yield split_env(seg)
            seg = []
        else:
            seg.append(tok)


def split_env(seg):
    env, i = {}, 0
    while i < len(seg):
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)=(.*)$", seg[i])
        if m:
            env[m.group(1)] = m.group(2)
        elif os.path.basename(seg[i]) not in WRAPPERS:
            break
        i += 1
    return env, seg[i:]


def git_parts(argv):
    """Return (global -C dir or None, subcommand, its args)."""
    cdir, i = None, 1
    while i < len(argv):
        a = argv[i]
        if a in GIT_OPTS_WITH_VALUE:
            if a == "-C" and i + 1 < len(argv):
                cdir = argv[i + 1]
            i += 2
        elif a.startswith("-"):
            i += 1
        else:
            return cdir, a, argv[i + 1:]
    return cdir, None, []


def short_flag(args, letter):
    return any(re.match(r"^-[A-Za-z]*%s[A-Za-z]*$" % letter, a) for a in args)


def current_branch(cwd):
    try:
        r = subprocess.run(["git", "-C", cwd, "branch", "--show-current"],
                           capture_output=True, text=True, timeout=5)
        return r.stdout.strip()
    except Exception:
        return ""


def check_git(argv, cwd):
    cdir, sub, args = git_parts(argv)
    if sub is None:
        return None
    if sub == "stash":
        verb = next((a for a in args if not a.startswith("-")), None)
        if verb not in ("list", "show"):
            return ("git stash is banned: refs/stash is shared by every worktree and agent. "
                    "Park the work in a commit instead.")
    if "--no-verify" in args or (sub == "commit" and short_flag(args, "n")):
        return "--no-verify is banned: fix what the hook reports, or tell the user why it cannot pass."
    if sub == "push":
        force = (any(a == "--force" or a.startswith(("--force-with-lease", "--force-if-includes"))
                     for a in args) or short_flag(args, "f"))
        pos = [a for a in args if not a.startswith("-")]
        refspecs = pos[1:]
        plus = [r for r in refspecs if r.startswith("+")]
        dests = [r.lstrip("+").split(":")[-1].replace("refs/heads/", "") for r in refspecs]
        if force or plus:
            hit = [d for d in dests if d in PROTECTED]
            if plus and not force:
                hit = [r.lstrip("+").split(":")[-1].replace("refs/heads/", "") for r in plus]
                hit = [d for d in hit if d in PROTECTED]
            implicit = force and (not refspecs or "HEAD" in dests)
            if not hit and implicit:
                where = os.path.join(cwd, cdir) if cdir else cwd
                if current_branch(where) in PROTECTED:
                    hit = [current_branch(where)]
            if hit or (force and ("--all" in args or "--mirror" in args)):
                return "Force-pushing main/master is banned."
        if "--delete" in args or short_flag(args, "d"):
            if any(d in PROTECTED for d in dests):
                return "Deleting main/master on the remote is banned."
        if any(r.startswith(":") and r[1:].replace("refs/heads/", "") in PROTECTED for r in refspecs):
            return "Deleting main/master on the remote is banned."
    return None


def check_herdr(env, argv):
    args = argv[1:]
    asked = env.get("HERDR_FOCUS") == "asked"
    focus_verb = len(args) >= 2 and args[0] in HERDR_FOCUS_NOUNS and args[1] == "focus"
    if (focus_verb or "--focus" in args) and not asked:
        return ("Never steal focus. Report the workspace or tab by name instead. Only if the user "
                "asked in this request to be taken there, prefix the command with HERDR_FOCUS=asked.")
    if tuple(args[:2]) in HERDR_CREATES and "--no-focus" not in args and "--focus" not in args:
        return "Pass --no-focus explicitly on herdr %s %s." % (args[0], args[1])
    return None


def check_bash(command, cwd):
    try:
        segs = list(segments(command))
    except ValueError:
        return None
    for env, argv in segs:
        if not argv:
            continue
        prog = os.path.basename(argv[0])
        reason = None
        if prog == "git":
            reason = check_git(argv, cwd)
        elif prog == "herdr":
            reason = check_herdr(env, argv)
        elif prog == "playwright-cli" and {"close-all", "kill-all"} & set(argv[1:]):
            reason = ("playwright-cli close-all/kill-all end other agents' browsers. "
                      "Close your own session: playwright-cli -s=<name> close.")
        if reason:
            return reason
    return None


def chezmoi_source(path):
    try:
        r = subprocess.run(["chezmoi", "source-path", path], capture_output=True, text=True, timeout=5)
        return r.stdout.strip() if r.returncode == 0 else None
    except Exception:
        return None


def check_edit(path, cwd):
    if not path:
        return None
    path = os.path.abspath(os.path.join(cwd, os.path.expanduser(path)))
    for p in dict.fromkeys((path, os.path.realpath(path))):
        if not p.startswith(MANAGED_ROOTS) or p.startswith(UNMANAGED):
            continue
        src = chezmoi_source(p)
        if src:
            return ("%s is deployed by chezmoi and would be overwritten. Edit the source, %s, "
                    "then run `chezmoi apply`. Read ~/dev/dotfiles/CLAUDE.md first." % (p, src))
    return None


def decide(event):
    tool = event.get("tool_name", "")
    inp = event.get("tool_input") or {}
    cwd = event.get("cwd") or os.getcwd()
    if tool == "Bash":
        return check_bash(inp.get("command") or "", cwd)
    if tool in ("Edit", "Write", "MultiEdit", "NotebookEdit"):
        return check_edit(inp.get("file_path") or inp.get("notebook_path"), cwd)
    if tool == "Agent" and "haiku" in str(inp.get("model") or "").lower():
        return "Haiku is never used (global model rule). Use sonnet for retrieval, opus otherwise."
    return None


def selftest():
    block = [
        "git stash", "git stash push -u -m x", "git -C /tmp/x stash pop", "rtk git stash",
        "cd x && git stash", "git stash apply abc", "FOO=1 git -c a=b stash drop",
        "git commit --no-verify -m x", "git commit -nm x", "git push --no-verify",
        "git push --force origin main", "git push -f origin HEAD:main", "git push origin +main",
        "git push --force-with-lease origin master", "git push origin :main",
        "git push origin --delete main", "git push -f --all",
        "playwright-cli kill-all", "playwright-cli -s=a close-all",
        "herdr workspace focus w1", "herdr tab create --workspace w1 --focus",
        "herdr tab create --workspace w1", "herdr pane split p1 --direction right",
        "echo hi\ngit stash",
    ]
    allow = [
        "git stash list", "git stash show -p stash@{0}", "git status", "git commit -m 'never git stash'",
        "git push origin feature", "git push --force origin feature", "git push -f origin +feature",
        "git push origin main", "git log -n 5", "git commit -m 'x' -a",
        "playwright-cli -s=a close", "herdr tab create --workspace w1 --no-focus",
        "HERDR_FOCUS=asked herdr workspace focus w1", "herdr pane read p1 --source visible",
        "cat <<'EOF'\ngit stash\nEOF", "echo 'git stash'", "grep -rn 'git stash' .",
    ]
    bad = [c for c in block if not check_bash(c, "/")] + ["ALLOWED? " + c for c in allow if check_bash(c, "/")]
    if decide({"tool_name": "Agent", "tool_input": {"model": "haiku"}}) is None:
        bad.append("agent haiku")
    if decide({"tool_name": "Agent", "tool_input": {"model": "sonnet"}}):
        bad.append("ALLOWED? agent sonnet")
    for c in bad:
        print("FAIL", c)
    print("ok" if not bad else "%d failures" % len(bad))
    return 1 if bad else 0


def main():
    if "--selftest" in sys.argv:
        return selftest()
    try:
        reason = decide(json.load(sys.stdin))
    except Exception:
        return 0
    if reason:
        sys.stderr.write("Blocked by ~/.claude/guard.py: " + reason + "\n")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
