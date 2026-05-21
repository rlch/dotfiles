#!/usr/bin/env python3
"""Produce a short markdown digest of a scenario bundle.

Output is fed into the LLM's context at the top of any reviewer turn so
the model knows what it's looking at without re-reading every artifact.
Kept short by design — < 50 lines of markdown.

Usage: summarize.py <bundle-dir>
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from lib.bundle import Bundle, BundleLoadError


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: summarize.py <bundle-dir>", file=sys.stderr)
        return 2
    try:
        b = Bundle.load(Path(argv[1]))
    except BundleLoadError as e:
        print(f"# Bundle load error\n\n{e}")
        return 1

    name = b.scenario.get("name", "<no-name>")
    modality = b.scenario.get("modality", "?")
    preset = b.scenario.get("preset", "?")
    inputs = b.scenario.get("inputs") or {}
    follow_ups = b.scenario.get("follow_ups") or []

    lines: list[str] = []
    lines.append(f"# Scenario: {name}")
    lines.append("")
    lines.append(f"- **Bundle**: `{b.path}`")
    lines.append(f"- **Modality / preset**: `{modality}` / `{preset}`")
    lines.append(f"- **Inputs**: " + ", ".join(f"`{k}`" for k in inputs))
    lines.append(f"- **Follow-ups**: {len(follow_ups)}")
    lines.append("")
    lines.append("## Run outcome")
    lines.append("")
    lines.append(f"- `run_outcome` = `{b.result.run_outcome}`")
    lines.append(f"- duration = {b.result.duration_ms}ms")
    lines.append(f"- exit code = {b.result.exit_code}")
    if b.result.error_summary:
        lines.append(f"- error: {b.result.error_summary}")
    if b.result.follow_ups:
        lines.append("- follow-ups:")
        for fu in b.result.follow_ups:
            mark = "✓" if fu.settled else "✗"
            lines.append(
                f"  - {mark} [{fu.index}] {fu.kind} ({fu.duration_ms}ms)"
            )

    lines.append("")
    lines.append("## Artifacts")
    lines.append("")
    lines.append(f"- errors.jsonl: {len(b.errors)} event(s)")
    lines.append(f"- prompts.jsonl: {len(b.prompts)} LLM call(s)")
    lines.append(f"- pipeline.jsonl: {len(b.pipeline)} unit(s)")
    s = b.pipeline_summary
    if s:
        lines.append(
            f"- pipeline.json: total {s.get('total_duration_ms')}ms, "
            f"{s.get('unit_count')} units, "
            f"settled={s.get('settled')}"
        )
        by_kind = s.get("by_kind") or {}
        if by_kind:
            lines.append("- per-kind p50/p95/max (ms):")
            for kind, stats in sorted(by_kind.items()):
                lines.append(
                    f"  - {kind}: count={stats.get('count')} "
                    f"p50={stats.get('p50_ms')} "
                    f"p95={stats.get('p95_ms')} "
                    f"max={stats.get('max_ms')}"
                )
        cp = s.get("critical_path") or []
        if cp:
            lines.append(f"- critical path: {' → '.join(cp)}")
    lines.append(f"- final/: {b.final.status}")

    sys.stdout.write("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
