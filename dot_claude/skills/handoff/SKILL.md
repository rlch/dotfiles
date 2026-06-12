---
name: handoff
description: Write a session handoff — a durable doc under /tmp plus a copy-paste message addressed to the NEXT agent as the first message of its session. Use whenever the user says "hand off", "handoff", "provide a handoff message/msg", "wrap this up for the next session", or invokes /handoff <brief>. The brief argument scopes what the next session must do (build X, discuss Y first, etc.). "Hand off" NEVER means dispatching an agent — it means writing the doc; the user starts the next session themselves. The message must read as a new session's opening instruction — no sign-offs, no "good to hand off", no commentary about the session that produced it.
---

# handoff

Produce two deliverables, in order: **the doc** (durable, in /tmp) and **the
message** (in the reply, for the user to copy into the next agent's prompt).
The brief in ARGUMENTS scopes the handoff — what the next session is FOR.

## 1. Gather real state first (don't write from memory of the conversation)

Run the cheap checks; a handoff that asserts stale state costs the next
session more than it saves:

- **git**: current branch, commits ahead of the main branch (one line each),
  and the dirty file list — split into *mine* (this session's uncommitted
  work) vs *someone else's* (the user's edits, a parallel agent's WIP).
  Misattributing these causes the next agent to commit or clobber foreign
  work.
- **Verification status**: what was last proven green (tests, build, a
  capture) and when — "tests green" means *which* suites, with counts.
- **Blockers**: what the work is waiting on (a dirty parent checkout, a
  parallel agent finishing, a user decision) — name the unblock condition.
- **Shared resources**: parallel agents in the same worktree, daemons,
  ports, running processes. Coexistence rules go in the doc.
- **Artifacts**: /tmp scripts, screenshots, scratch files the next session
  will reuse — absolute paths.
- **Task list + memory**: which tasks are done/pending/deferred, and which
  auto-memory files were already updated (so the next session doesn't
  re-save them).

## 2. The doc

Path: honor the project's CLAUDE.md handoff convention if it names one
(e.g. drift uses `/tmp/drift-handoff-<topic>.md`); otherwise
`/tmp/<repo-dir-name>-handoff-<slug>.md`, slug derived from the brief.
Never write a handoff inside the repo.

Structure (sections, in this order, only the ones that apply):

1. **Title + date + worktree/branch** — and a SHARED-tree warning up top if
   another agent works in it.
2. **Branch/work state** — commits with one-line whats, verification
   status, what each unmerged piece is.
3. **Coexistence / don't-touch** — foreign dirty files by name, commit
   discipline (file-scoped `git add`, no rebase under a co-agent, no
   `cargo clean` over shared incremental state), known gotchas.
4. **The work**, hardest-won context first, each item labelled:
   - **BUILD** — approved scope, concrete steps, file paths.
   - **DISCUSS FIRST** — the user wants a design conversation before any
     code; list the tensions/questions to surface and what to read first.
   - **DEFERRED / DON'T-TOUCH** — and why.
5. **Repro/QA facts** — exact poses, commands, ports, scripts, instruments
   (and how to validate them), plus which memory entries are current vs
   newly stale.

Encode *why* alongside *what* — the next agent must be able to judge edge
cases, not just follow steps. Convert relative dates to absolute. Name
absolute paths.

## 3. The message

Output in the reply, after the doc is written, prefaced by at most one
short sentence ("Handoff written to <path>. Message for the next session:")
and a `---` separator so the user can copy cleanly.

The message IS the first message of the next session. Write it exactly as
that — an instruction to an agent reading it cold:

- **First line**: `Read <doc path> first.` Then the state-in-brief and the
  work, ordered BUILD → DISCUSS-FIRST → constraints/DON'T-TOUCH.
- **Self-contained**: actionable even if /tmp was wiped — carry the
  essential facts (branch, key paths, the one-line whys), not just pointers.
- **Imperative, second person**, addressed to the next agent. Decisions the
  user still owns are phrased as "ask the user about X before building",
  never left as dangling questions.
- **NEVER include**: sign-offs or wrap-up phrases ("good to hand off",
  "ready when you are", "that's everything"), questions back to the user of
  THIS session, meta-commentary about the conversation that produced the
  handoff ("as discussed above", "earlier we found"), or praise/filler. The
  message ends on the last piece of substance.
