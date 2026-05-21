# Pipeline review

The `check_pipeline.py` script flagged outliers against the default
thresholds (image_synthesis > 35s, non-image > 10s, any kind with
p95 > 3×p50, repair_count >= 3). You're seeing this prompt because either
the script flagged something OR the scenario overrode this prompt.

Findings in your context list every outlier: slow units, high-variance
kinds, repair storms. The `stats` block has full per-kind p50/p95/max
and the critical path.

Decide:

1. **Is the slowness expected?** Some scenarios legitimately take longer
   (large lessons, slow providers, image-heavy worksheets). The thresholds
   are defaults; if the user knows their scenario should take longer,
   they'd have set an override.

2. **Where did the time go?** Look at the critical path. If a single
   `image_synthesis:slide-N:image_url` dominates, image generation is the
   bottleneck — call that out specifically (slide N, ms). If `content_synthesis`
   p95 is far above p50, one slide is much slower than the others
   — that's a content-shape issue worth flagging.

3. **Are repairs a signal?** `repair_count >= 3` means the validator
   rejected the LLM output three or more times before it converged. The
   LLM output is probably structurally broken (wrong schema, hallucinated
   binding key, etc.). Cross-check with the `errors.jsonl` to see if
   validator failures landed there.

4. **Did parallelism work?** If `total_duration_ms` is close to the sum
   of per-unit durations, parallelism collapsed — slides ran serially.
   Compare `total_duration_ms` to `by_kind.image_synthesis.max_ms` — if
   total ≈ max × image count, no parallelism happened.

Output verdict:
- **pass**: outliers exist but are explained by expected workload.
- **concern**: real slow path — name the unit + ms, suggest one
  hypothesis (provider, prompt size, validator retry).
- **fail**: pipeline failure (no critical path, vast majority of units
  failed, etc.).

Keep the rationale to 2-3 sentences. Cite specific dispatch IDs.
