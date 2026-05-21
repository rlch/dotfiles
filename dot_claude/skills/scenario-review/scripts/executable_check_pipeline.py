#!/usr/bin/env python3
"""Pipeline check: scan `pipeline.jsonl` + `pipeline.json` for outliers.

Pass when:
  - no image_synthesis unit exceeds `--image-threshold` ms
  - no non-image, non-planning unit exceeds `--other-threshold` ms
  - no kind has `p95 > p95-multiplier * p50` (default 3x)
  - no unit has `repair_count >= repair-cap` (default 3)

Fail otherwise. Findings list every outlier so the LLM can reason.

Usage:
  check_pipeline.py <bundle-dir>
  check_pipeline.py <bundle-dir> --image-threshold 30000 --other-threshold 8000

Thresholds chosen per design D4's defaults; override per scenario when the
expected runtime is legitimately higher (large lessons, low-traffic
provider, etc.). Override → defeats the short-circuit.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from lib.bundle import BundleLoadError, load_pipeline_events
from lib.stats import by_kind, critical_path


# Kinds that aren't expected to do real work (planning is fast,
# composition is cheap) — exclude from the generic non-image threshold.
FAST_KINDS = {"planning", "composition", "metadata", "properties", "binding"}


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="check_pipeline.py")
    parser.add_argument("bundle_dir", type=Path)
    parser.add_argument("--image-threshold", type=int, default=35_000)
    parser.add_argument("--other-threshold", type=int, default=10_000)
    parser.add_argument("--p95-multiplier", type=float, default=3.0)
    parser.add_argument("--repair-cap", type=int, default=3)
    args = parser.parse_args(argv[1:])

    try:
        units = load_pipeline_events(args.bundle_dir)
    except BundleLoadError as e:
        print(json.dumps({"verdict": "fail", "findings": [str(e)]}))
        return 0

    findings: list[str] = []

    # (1) Per-unit duration outliers.
    for u in units:
        if u.duration_ms is None:
            continue
        threshold = (
            args.image_threshold
            if u.kind == "image_synthesis"
            else args.other_threshold
        )
        if u.kind in FAST_KINDS:
            continue  # fast-kind units aren't expected to dominate runtime
        if u.duration_ms > threshold:
            findings.append(
                f"slow unit: {u.id} kind={u.kind} "
                f"duration={u.duration_ms}ms > threshold {threshold}ms"
            )

    # (2) Per-kind p95/p50 ratio outliers.
    stats = by_kind(units)
    for kind, s in stats.items():
        if s.p50_ms == 0:
            continue  # avoid div-by-zero on degenerate input
        ratio = s.p95_ms / s.p50_ms
        if ratio > args.p95_multiplier:
            findings.append(
                f"variance: kind={kind} "
                f"p50={s.p50_ms}ms p95={s.p95_ms}ms "
                f"ratio={ratio:.1f}x > {args.p95_multiplier}x"
            )

    # (3) Repair storms.
    for u in units:
        if u.repair_count >= args.repair_cap:
            findings.append(
                f"repair storm: {u.id} repair_count={u.repair_count}"
            )

    verdict = "pass" if not findings else "fail"

    print(
        json.dumps(
            {
                "verdict": verdict,
                "findings": findings,
                "stats": {
                    "unit_count": len(units),
                    "by_kind": {
                        k: {
                            "count": v.count,
                            "p50_ms": v.p50_ms,
                            "p95_ms": v.p95_ms,
                            "max_ms": v.max_ms,
                        }
                        for k, v in stats.items()
                    },
                    "critical_path": critical_path(units),
                    "thresholds": {
                        "image_ms": args.image_threshold,
                        "other_ms": args.other_threshold,
                        "p95_multiplier": args.p95_multiplier,
                        "repair_cap": args.repair_cap,
                    },
                },
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
