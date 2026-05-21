# State review

State quality is judgment — `check_state.py` gathered objective facts but
never produces a pass verdict on its own. You always run.

The findings in your context include: hot/cold/contended child counts,
any cold-at-settle slots, any empty Hot leaves (children with zero
placements/blocks), and a slide_count-vs-declared mismatch if applicable.

The scenario's `snapshot_final.json` is on disk if you need to dig — but
prefer the script's findings + the summarize.py digest already in your
context.

Decide whether the final state is what the scenario asked for:

1. **Did the generator do the work?** A lesson scenario with `slide_count
   = 5` should yield 5 top-level children, each Hot with non-empty
   placements. Missing slides or empty Hot leaves are quality regressions.

2. **Do the children make sense for the prompt?** Glance at
   `snapshot_final.json` (or the per-slide modality_snapshot for spot
   checks) — for "The Roman Empire for Year 7 history", a slide titled
   "Introduction to fractions" would be a content miscarriage.
   You won't catch every miscarriage from a snapshot summary; flag what
   you see, don't manufacture concerns.

3. **Did follow-ups land?** If the scenario had follow-ups, check the
   summarize.py output's follow-up table. Each one should be `✓` settled
   in `result.json::follow_ups`. Then spot-check
   `snapshots/NN_after_chat.json` to confirm the requested change
   actually happened (e.g. "Make slide 2 more visual" should leave slide
   2 with image bindings or more visual elements than before).

4. **Are there cold-at-settle slots?** Sometimes legitimate (the
   generator chose 3 slides for a 5-slide ceiling, leaving 2 cold), but
   often a generation gap. Use scenario inputs to judge.

5. **Are there contended children?** Should never happen at settle —
   the snapshot is taken after the debouncer fires. Surface as a real
   concern; the runner's settle predicate may need a fix.

Output verdict:
- **pass**: state matches the scenario's intent. Brief rationale citing
  the counts you matched.
- **concern**: quality gap — name the slide/child + what's missing. Be
  specific; "slide 3 has no content" beats "some slides look empty".
- **fail**: structural failure (contended at settle, slide_count off by
  more than one, all Hot children empty).

Keep the rationale to 3-5 sentences max. Cite specific session_ids /
slide indices.
