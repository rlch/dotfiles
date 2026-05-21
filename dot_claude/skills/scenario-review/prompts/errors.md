# Errors review

The `check_errors.py` script counted ERROR-level events in `errors.jsonl`
(deduped by `(source, message)`) and verdict was either **fail** (too many)
or **pass** (within `--max`). You're seeing this prompt because either:

- The script verdict was **fail**, OR
- The scenario overrode this prompt (in which case all errors below are
  context for whatever question the user encoded in the override).

The findings list passed in your context shows each unique error event:
`[ts_ms] source @ span_path: message`. Use it to answer:

1. **Is each error expected for this scenario?**
   - Transient network blips (`hyper`, `h2`, `reqwest`) on a single call
     are usually fine if the runner retried successfully (check
     `result.json::run_outcome == "settled"`).
   - Provider rate-limit errors (`429`) are not "acceptable" — they
     indicate either a misconfigured key or a real load issue.
   - LLM tool-validation errors (`ValidateTool`, `DoneTool` mismatches)
     during an early subagent turn are normal as the agent iterates; the
     same error repeating > 3 times in one call is a real failure.

2. **Did any error block the run?** Cross-reference with
   `result.json::error_summary` — if non-null, that error is the one that
   actually killed the run. Surface it as the headline finding.

3. **Do the errors cluster around one component?** Multiple errors from
   the same `source` prefix (e.g. all `modality_session::children`)
   suggest one bug, not many.

Output verdict:
- **pass**: errors look transient/recoverable and the run settled OK.
- **concern**: errors completed-but-suspect — note the most concerning ones in 1-2 sentences.
- **fail**: errors directly blocked the run OR a hard failure that
  should not be acceptable (auth, schema, missing config).

Keep the rationale to 2-3 sentences. The user can read the bundle
themselves; your job is to call out what they'd miss on a quick skim.
