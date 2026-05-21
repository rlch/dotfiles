---
name: scenario-review
description: Review a modality scenario bundle (produced by `dev scenario run`) and produce a verdict roll-up. Use when the user asks to review a scenario, audit a bundle, check the last scenario run, or invokes `/scenario-review <path>`. Bundle layout per `openspec/changes/dev-cli-scenarios/design.md` D5 in the modality repo. Orchestrates deterministic Python checks first (zero-LLM-cost on the happy path), invokes the LLM only when a check flags or when the scenario overrides a default prompt.
---

# Scenario Review

Reviewer skill for modality scenario bundles. The runner
(`dev scenario run …`) produces a directory like:

```
~/.local/share/modality/scenarios/<name>/<unix_ms>/
├── scenario.toml
├── result.json
├── snapshot_initial.json
├── snapshots/01_after_chat.json, 02_after_chat.json
├── snapshot_final.json
├── errors.jsonl
├── prompts.jsonl
├── pipeline.jsonl
├── pipeline.json
├── logs.txt
└── final/output.pdf (or EXPORT_UNSUPPORTED marker)
```

The skill's job: read the bundle, run scripted checks, invoke the LLM for
quality judgment when needed, and write `review.json` next to the bundle.

## Invocation

User-facing forms this skill responds to:

- `/scenario-review` — pick the most-recently-modified bundle under
  `~/.local/share/modality/scenarios/`.
- `/scenario-review <bundle-dir>` — review the named bundle.
- "review my last scenario run", "audit this bundle" — same as `/scenario-review`.

The bundle path is always a directory containing `result.json`. Reject
otherwise.

## Library layout

Deployed to `~/.claude/skills/scenario-review/`:

```
SKILL.md
scripts/
├── summarize.py              # one-pass digest fed to LLM context
├── check_settled.py          # pass/fail on result.json::run_outcome
├── check_errors.py           # counts/groups errors.jsonl
├── check_pipeline.py         # outliers by kind p95/p50 + image thresholds
├── check_state.py            # structural checks; always inconclusive
└── lib/
    ├── __init__.py
    ├── bundle.py             # typed loaders for every artifact
    └── stats.py              # p50/p95, critical-path walk
prompts/
├── errors.md                 # invoked when check_errors flags
├── pipeline.md               # invoked when check_pipeline flags
└── state.md                  # always invoked
```

Scripts are stand-alone Python 3.11+ (uses dataclass, json, statistics
from stdlib only — no third-party deps). Each emits one JSON line to
stdout:

```json
{"verdict": "pass" | "fail" | "inconclusive", "findings": [...], "stats": {...}}
```

## Orchestration flow

For each `[expect.<artifact>]` block in the scenario (merged with shipped
defaults below), the skill:

1. **Run the deterministic Python check first.** Output is structured JSON.
2. **Short-circuit pass** when `verdict == "pass"` AND the scenario did not
   override the prompt for this artifact → record `{"verdict": "pass",
   "skipped_llm": true}`, move on.
3. **Otherwise invoke the LLM** with `prompts/<artifact>.md` (or the
   scenario's override) + the script's `findings` as context. The script
   output is "context" not "gate" in this branch — the LLM produces the
   final verdict (pass/fail/concern) with a short rationale.
4. **Roll up** into `review.json` next to the bundle. Shape:

```json
{
  "bundle_dir": "...",
  "summary": "...",
  "artifacts": {
    "settled":  {"verdict": "pass", "skipped_llm": true},
    "errors":   {"verdict": "pass", "skipped_llm": true},
    "pipeline": {"verdict": "concern", "rationale": "image_synthesis p95=42000ms > 35000ms threshold", "findings": [...]},
    "state":    {"verdict": "pass", "rationale": "all child sessions settled; slide_count matches inputs"}
  },
  "exit_status": "pass" | "concern" | "fail"
}
```

`exit_status` is the max severity across artifacts (`fail > concern > pass`).

## Shipped defaults

Most scenarios need no `[expect]` block. The defaults are:

| Artifact | Script | Default LLM prompt | Short-circuit on pass |
|----------|--------|--------------------|------------------------|
| `settled` | `check_settled.py` | — (no LLM, pure precondition) | always |
| `errors` | `check_errors.py --max 0` | `prompts/errors.md` | yes |
| `pipeline` | `check_pipeline.py --image-threshold 35000 --other-threshold 10000` | `prompts/pipeline.md` | yes |
| `state` | `check_state.py` | `prompts/state.md` | never (quality is judgment) |

`settled` is a precondition: if `result.json::run_outcome != "settled"`,
all other checks short-circuit to `inconclusive` with a note. No point
reviewing a half-finished run.

## Short-circuit rule (D8)

- `errors`, `pipeline`: script pass → skip LLM (saves tokens on the
  common happy path).
- `state`: script runs to gather facts (child sessions settled, slide
  count matches inputs, no empty leaves) but the LLM ALWAYS runs.
  Structure passes don't imply quality passes.
- **Any prompt override on any block defeats short-circuit
  unconditionally.** If the user wrote a custom prompt, they want the
  LLM to look — even if the deterministic check passed.

## When invoking this skill

1. Resolve the bundle dir (argument, or latest under
   `~/.local/share/modality/scenarios/`).
2. Verify `result.json` exists. If not, abort with a clear error.
3. Run `summarize.py <bundle-dir>` once; feed the output into the LLM's
   context at the top of every reviewer turn.
4. Run `check_settled.py <bundle-dir>`. If `verdict != "pass"`, record
   each remaining artifact as `inconclusive` with the settle failure as
   the reason. Skip to step 8.
5. Run `check_errors.py` with the scenario's overrides (or defaults).
   Apply the short-circuit rule.
6. Run `check_pipeline.py` with the scenario's overrides (or defaults).
   Apply the short-circuit rule.
7. Run `check_state.py`. Always invoke the LLM with `prompts/state.md`
   (or override) + the script's findings.
8. Write `review.json` next to the bundle. Print a one-line summary on
   stdout.

## Reading the scripts

Each check script is < 200 lines. Read `scripts/lib/bundle.py` first —
every check imports the typed loaders from there. `lib/stats.py` has
p50/p95 + critical-path walk; both reused from the runner side so the
arithmetic matches.

When in doubt about the bundle layout, the source of truth is
`openspec/changes/dev-cli-scenarios/design.md` §D5 in the modality
repo (`~/dev/tutero/frontend/library/modality/`).
