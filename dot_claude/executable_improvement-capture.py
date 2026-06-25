#!/usr/bin/env python3
"""improvement-capture — Phase 0 of the autonomous self-improvement loop.

A SIDE-EFFECT-FREE SessionEnd/Stop hook. Its ONLY effect is appending
evidence-linked, provenance-tagged friction candidates to a queue. It never
touches memory, CLAUDE.md, hooks, or skills — capture only; a human reads the
digest and decides. (openspec: autonomous-self-improvement-loop, Phase 0.)

Reads Claude Code hook JSON on stdin ({session_id, transcript_path, cwd, ...}),
scans the transcript for VERIFIABLE friction only, and appends one JSON record
per candidate to:

    $HOME/.claude/improvement/queue.jsonl

Verifiable signals (vague "make it better" is ignored):
  - user-correction      : the user explicitly corrects/negates the assistant
  - repeated-tool-failure: the same tool+command errors >= 2 times
  - blocked-then-retried : a permission-denied call followed by a retry
  - test-red-green       : a test/build command goes red then later green

Provenance tagging is the memory-poisoning defense (not just a label):
  - user-authored      : evidence is the user's own message (corrections)
  - tool-or-web-derived: evidence is tool output / fetched content (everything else)

Queue record schema (one JSON object per line in queue.jsonl):
  ts             ISO-8601 UTC capture time
  session_id     Claude Code session id (also used for idempotency)
  cwd            working dir of the captured session
  git_branch     branch at capture time (best-effort)
  signal         one of the four verifiable signals above
  summary        one-line human description of the friction
  evidence       {kind, excerpt}  -- the bounded transcript span that motivates it
  provenance     "user-authored" | "tool-or-web-derived"
  proposed_tier  coarse routing hint, refined by Phase-1 synthesis:
                 T0 memory · T1 CLAUDE.md/rules · T2 hooks · T3 skills
  dedupe_key     16-hex sha1(signal|anchor|cwd) -- stable across sessions

Hard rules: never mutate anything but the queue; never crash the session
(all errors are swallowed and the hook exits 0); idempotent per session.
"""

import sys, os, json, re, hashlib, datetime

HOME = os.path.expanduser("~")
QUEUE_DIR = os.path.join(HOME, ".claude", "improvement")
QUEUE = os.path.join(QUEUE_DIR, "queue.jsonl")
PROCESSED = os.path.join(QUEUE_DIR, ".processed-sessions")
MAX_EXCERPT = 280

# Correction cues — the user pushing back on the assistant. Tuned for precision
# over recall (capture-only + human-reviewed digest, so a flood of false
# positives is worse than missing a marginal one). Bare "actually"/"wrong" are
# deliberately excluded — too noisy.
CORRECTION_RE = re.compile(
    r"(^|\n)\s*no[,.! ]"                                  # leading "no, ..."
    r"|\bdon'?t\b|\bdo not\b|\bstop\b"                    # negative directives
    r"|that'?s (not right|wrong|incorrect)|that is (not right|wrong|incorrect)"
    r"|\bthat'?s not\b|\bincorrect\b"
    r"|not what i (said|asked|meant|wanted)"
    r"|\bi (said|told you|asked you|meant)\b"
    r"|you (were supposed to|shouldn'?t|should not|misunderstood|weren'?t supposed)"
    r"|\brevert\b|\bundo\b|why did you\b"
    r"|never\s+\w+\s+(again|that)",
    re.I,
)
PERMISSION_DENIED_RE = re.compile(
    r"(permission to use .* (has been )?denied|user (declined|rejected|denied)|"
    r"requested permissions?.*denied|operation not permitted by)", re.I,
)
TESTLIKE_RE = re.compile(
    r"\b(pytest|jest|vitest|cargo test|go test|npm (run )?test|yarn test|"
    r"\bmake test|tox|rspec|phpunit|gradle test|mvn test|tsc\b|cargo build|"
    r"cargo check|go build|npm run build|ctest)\b", re.I,
)


# Harness-injected wrappers that appear inside user-type messages but are NOT
# the user's own words (slash-command scaffolding, caveats, system reminders,
# notifications). Stripping these before correction detection avoids false
# positives AND protects provenance integrity: injected content must never be
# tagged user-authored (it is an injection surface, not the user).
INJECTED_RE = re.compile(
    r"<local-command-caveat>.*?</local-command-caveat>"
    r"|<command-(name|message|args)>.*?</command-\1>"
    r"|<local-command-stdout>.*?</local-command-stdout>"
    r"|<system-reminder>.*?</system-reminder>"
    r"|<task-notification>.*?</task-notification>"
    r"|<user-prompt-submit-hook>.*?</user-prompt-submit-hook>"
    r"|\[SYSTEM NOTIFICATION[^\]]*\].*",
    re.I | re.S,
)


def strip_injected(s):
    return INJECTED_RE.sub("", s or "").strip()


def excerpt(s):
    s = " ".join(str(s).split())
    return s[:MAX_EXCERPT]


def text_of(content):
    """Flatten a message content (str or block list) to plain text."""
    if isinstance(content, str):
        return content
    out = []
    for b in content or []:
        if isinstance(b, dict) and b.get("type") == "text":
            out.append(b.get("text", ""))
    return "\n".join(out)


def tool_result_text(block):
    c = block.get("content")
    if isinstance(c, str):
        return c
    if isinstance(c, list):
        return "\n".join(
            b.get("text", "") for b in c if isinstance(b, dict) and b.get("type") == "text"
        )
    return ""


def cmd_key(name, tinput):
    """A normalized key for a tool invocation, for repeat detection / dedupe."""
    if isinstance(tinput, dict):
        cmd = tinput.get("command") or tinput.get("file_path") or json.dumps(
            tinput, sort_keys=True
        )[:120]
    else:
        cmd = str(tinput)[:120]
    return f"{name}:{' '.join(str(cmd).split())[:80]}"


def dedupe_key(signal, anchor, cwd):
    h = hashlib.sha1(f"{signal}|{anchor}|{cwd}".encode()).hexdigest()[:16]
    return h


def main():
    try:
        raw = sys.stdin.read()
        hook = json.loads(raw) if raw.strip() else {}
    except Exception:
        return 0

    tpath = hook.get("transcript_path")
    session_id = hook.get("session_id") or hook.get("sessionId") or ""
    cwd = hook.get("cwd") or ""
    if not tpath or not os.path.isfile(tpath):
        return 0

    # Idempotency: never capture the same session twice.
    try:
        if session_id and os.path.isfile(PROCESSED):
            with open(PROCESSED) as f:
                if session_id in f.read().split():
                    return 0
    except Exception:
        pass

    # --- single streaming pass over the transcript -------------------------
    tooluse = {}            # tool_use_id -> (name, key, input)
    err_counts = {}         # cmd_key -> count of error results
    test_status = {}        # normalized test cmd -> last status ('red'/'green')
    candidates = []
    git_branch = ""

    def add(signal, summary, ev_kind, ev_text, provenance, tier, anchor):
        candidates.append({
            "signal": signal,
            "summary": excerpt(summary),
            "evidence": {"kind": ev_kind, "excerpt": excerpt(ev_text)},
            "provenance": provenance,
            "proposed_tier": tier,
            "dedupe_key": dedupe_key(signal, anchor, cwd),
        })

    try:
        with open(tpath, errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    o = json.loads(line)
                except Exception:
                    continue
                if o.get("isSidechain"):
                    continue  # subagent thread; capture only the main session
                git_branch = o.get("gitBranch") or git_branch
                t = o.get("type")
                msg = o.get("message") if isinstance(o.get("message"), dict) else None

                if t == "assistant" and msg:
                    for b in msg.get("content") or []:
                        if isinstance(b, dict) and b.get("type") == "tool_use":
                            k = cmd_key(b.get("name", "?"), b.get("input"))
                            tooluse[b.get("id")] = (b.get("name", "?"), k, b.get("input"))

                elif t == "user" and msg:
                    content = msg.get("content")
                    blocks = content if isinstance(content, list) else []
                    has_tool_result = any(
                        isinstance(b, dict) and b.get("type") == "tool_result" for b in blocks
                    )
                    if not has_tool_result:
                        # genuine user message → correction detection (user-authored).
                        # Strip harness-injected wrappers first: anything left is
                        # the user's own words, so the user-authored tag is sound.
                        txt = strip_injected(text_of(content))
                        if txt and CORRECTION_RE.search(txt) and len(txt) < 2000:
                            add("user-correction", txt.splitlines()[0] if txt else txt,
                                "user-message", txt, "user-authored", "T1",
                                txt[:80])
                    else:
                        # tool results → failure / blocked / test signals (tool-derived)
                        for b in blocks:
                            if not (isinstance(b, dict) and b.get("type") == "tool_result"):
                                continue
                            tu = tooluse.get(b.get("tool_use_id"), ("?", "?", None))
                            name, key, _ = tu
                            rtext = tool_result_text(b)
                            is_err = bool(b.get("is_error"))
                            if PERMISSION_DENIED_RE.search(rtext or ""):
                                add("blocked-then-retried",
                                    f"{name} blocked by a guard/permission",
                                    "tool-result", rtext, "tool-or-web-derived", "T2", key)
                            if is_err:
                                err_counts[key] = err_counts.get(key, 0) + 1
                                if err_counts[key] == 2:
                                    add("repeated-tool-failure",
                                        f"{name} failed >=2x: {key}",
                                        "tool-result", rtext, "tool-or-web-derived",
                                        "T2", key)
                            # test red→green tracking
                            if name == "Bash" and TESTLIKE_RE.search(key):
                                prev = test_status.get(key)
                                now = "red" if is_err else "green"
                                if prev == "red" and now == "green":
                                    add("test-red-green",
                                        f"test recovered: {key}",
                                        "tool-result", rtext, "tool-or-web-derived",
                                        "T3", key)
                                test_status[key] = now
    except Exception:
        return 0

    if not candidates:
        _mark_processed(session_id)
        return 0

    # --- dedupe within this session and append -----------------------------
    seen = set()
    uniq = []
    for c in candidates:
        if c["dedupe_key"] in seen:
            continue
        seen.add(c["dedupe_key"])
        uniq.append(c)

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        os.makedirs(QUEUE_DIR, exist_ok=True)
        with open(QUEUE, "a") as q:
            for c in uniq:
                rec = {
                    "ts": now,
                    "session_id": session_id,
                    "cwd": cwd,
                    "git_branch": git_branch,
                    **c,
                }
                q.write(json.dumps(rec, ensure_ascii=False) + "\n")
    except Exception:
        return 0

    _mark_processed(session_id)
    return 0


def _mark_processed(session_id):
    if not session_id:
        return
    try:
        os.makedirs(QUEUE_DIR, exist_ok=True)
        with open(PROCESSED, "a") as f:
            f.write(session_id + "\n")
    except Exception:
        pass


if __name__ == "__main__":
    try:
        sys.exit(main() or 0)
    except Exception:
        sys.exit(0)  # a hook must never break the session
