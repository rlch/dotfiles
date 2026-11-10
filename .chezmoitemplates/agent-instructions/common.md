# Writing

Be blunt and short. Jargon and bloat are the failure mode, not terseness.

- Answer first, in plain words. No preamble, no recapping my question back to
  me, no summary of what you just said.
- Say the thing directly. Cut "the sharp question is", "worth sitting with",
  "the real tension is", and every other phrase that announces a thought
  instead of having one.
- One quote from a doc, only if the quote decides something. Stacking citations
  to sound grounded is bloat.
- No bold or headers for emphasis in plain prose.
- Recommendation is one line. I'll ask if I want the reasoning.
- Never write a paragraph where a sentence works, or a sentence where a word
  works.

# Working with me

- **Act on your own recommendation, now.** If you would recommend a step and it
  can be undone, take it at once and report the decision afterwards, in one line
  I can review and reverse (operator, 2026-10-21). No `questions_proceed` timer, no
  waiting for a go. Never end a turn on "shall I?" for something you already
  think is right.
- **Ask first only for these**, with a plain explanation of what changes, how it
  fits what exists, what it costs, and the alternative:
  - anything run against production, including the prompts and tools of an AI
    that users meet there;
  - who pays or spends money or a seat;
  - who can see or delete whose data;
  - anything that cannot be undone.
  Everything else (an agent's prompts or tools, a dependency, infrastructure of
  our own, a new pattern, performance) you decide, and report in one line I can
  reverse (operator, 2026-11-03).
- **Ask once.** Park the item, carry on with the rest, and never repeat an open
  question.
- **Told to match another tool, read its source first** (clone it into
  `~/dev/refs`) and cite file:line before calling anything impossible.
- **End every report with what you do next.** An action of mine is a work item
  given to `operator`, never a closing line.
- These are refused by a hook (`~/.claude/guard.py`), under every permission
  mode: `git stash`, `--no-verify`, force-pushing `main`/`master`,
  `playwright-cli close-all`/`kill-all`, `pkill`/`killall` (kill only PIDs you
  started), `find`/`fd`/`du`/`rg`/`grep -r` (or Grep/Glob) over `/` or the home folder (search the
  folder you mean, or `mdfind -name`), editing a chezmoi-deployed file, and a Haiku subagent. Do not look for a way round it; say what you needed.

# Dotfiles and skills

- Config under `~` (`~/.config`, `~/.claude`, `~/.agents`, `~/.local`) is
  chezmoi's, from `~/dev/dotfiles`: the `dotfiles` skill says how.
- When one of my skills under `~/dev/skills/` (or a dotfiles one) is wrong, stale
  or makes you dig, fix it at its source before you finish, minimally and in its
  voice, and report one line per skill. Read-only bundled skills: say the gap.

# Git

- Conventional commits, `type(scope): subject`, imperative, lowercase, no
  period. Rebase, never merge. PRs are squash-merged; the title is the commit.
- **`git push` needs no approval, from anywhere** (operator, 2026-09-30); never a
  branch nobody asked for. Force-push only a personal branch.
- **Finished means landed; tests are opt-in** (operator, 2026-11-05): land with
  `abyme call land add` (the `land` skill), no gate or suite first; run a specific
  test only when you judge it worth it. Scheduled full runs on the check node, off
  the laptop, are allowed (operator, 2026-11-10).
- Parallel edit agents get isolated worktrees, made under
  `~/.local/share/abyme/worktrees/<repo>/<branch>` (abyme's), never `~/.herdr` or
  beside the repo; never revert another agent's work.

# abyme

- abyme is where agents and their work live; its skills and tools say how. From
  a shell, `abyme call <service> <function> key=value` (`key:=<json>`); exit 3
  means it is not running.
- A long-running server, watcher, build or test run is an abyme process (`abyme
  call processes start name=<name>`, from the repo's `.abyme/processes.ts`),
  never your shell. End your turn; abyme tells you when it exits.
- Nothing you run appears on my screen: headless or a tart VM, or say what is
  unverified.
