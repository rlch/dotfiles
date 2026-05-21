#!/usr/bin/env python3
"""Errors check: count ERROR-level events in `errors.jsonl`.

Pass: count after `--exclude-source` filtering <= `--max` (default 0).
Fail: more than `--max` matching events.

Outputs the (deduped) error events as findings so the LLM (if invoked)
can reason about whether they're acceptable.

Usage:
  check_errors.py <bundle-dir>
  check_errors.py <bundle-dir> --max 2 --exclude-source 'h2::' --exclude-source 'hyper::'

`--exclude-source` is a substring match against each event's `source`
(its tracing target). Repeatable.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from lib.bundle import BundleLoadError, load_errors


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="check_errors.py")
    parser.add_argument("bundle_dir", type=Path)
    parser.add_argument("--max", type=int, default=0, dest="max_count")
    parser.add_argument(
        "--exclude-source",
        action="append",
        default=[],
        help="substring match against event.source; repeatable",
    )
    args = parser.parse_args(argv[1:])

    try:
        events = load_errors(args.bundle_dir)
    except BundleLoadError as e:
        print(json.dumps({"verdict": "fail", "findings": [str(e)]}))
        return 0

    excludes = args.exclude_source
    kept = [
        e for e in events if not any(sub in e.source for sub in excludes)
    ]

    findings = []
    for e in kept[:20]:  # cap surfaced findings to keep LLM context small
        location = f" @ {e.span_path}" if e.span_path else ""
        findings.append(f"[{e.ts_ms}ms] {e.source}{location}: {e.message}")
    if len(kept) > 20:
        findings.append(f"... and {len(kept) - 20} more")

    verdict = "pass" if len(kept) <= args.max_count else "fail"

    print(
        json.dumps(
            {
                "verdict": verdict,
                "findings": findings,
                "stats": {
                    "total_events": len(events),
                    "excluded": len(events) - len(kept),
                    "kept": len(kept),
                    "max_allowed": args.max_count,
                },
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
