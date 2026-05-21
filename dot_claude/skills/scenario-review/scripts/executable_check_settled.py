#!/usr/bin/env python3
"""Precondition check: did the scenario settle?

Pass: `result.json::run_outcome == "settled"`.
Fail: any other outcome (timed_out / panicked / wizard_failed / aborted).

This is a precondition for the other checks — if the run didn't settle,
the reviewer skill records each remaining artifact as `inconclusive` with
the settle failure as the reason. No point pipeline-analyzing a
half-finished run.

Usage: check_settled.py <bundle-dir>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from lib.bundle import BundleLoadError, load_result


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: check_settled.py <bundle-dir>", file=sys.stderr)
        return 2
    bundle = Path(argv[1])
    try:
        result = load_result(bundle)
    except BundleLoadError as e:
        print(json.dumps({"verdict": "fail", "findings": [str(e)]}))
        return 0

    findings = []
    if result.run_outcome != "settled":
        findings.append(
            f"run_outcome={result.run_outcome!r} "
            f"(expected 'settled'); "
            f"exit_code={result.exit_code}; "
            f"duration_ms={result.duration_ms}"
        )
        if result.error_summary:
            findings.append(f"error_summary: {result.error_summary}")
        # Surface which follow-up failed if any.
        for fu in result.follow_ups:
            if not fu.settled:
                findings.append(
                    f"follow_up[{fu.index}] ({fu.kind}) did not settle "
                    f"(duration_ms={fu.duration_ms})"
                )
        print(
            json.dumps(
                {
                    "verdict": "fail",
                    "findings": findings,
                    "stats": {
                        "run_outcome": result.run_outcome,
                        "duration_ms": result.duration_ms,
                        "follow_ups_run": result.follow_ups_run,
                    },
                }
            )
        )
        return 0

    print(
        json.dumps(
            {
                "verdict": "pass",
                "findings": [],
                "stats": {
                    "run_outcome": "settled",
                    "duration_ms": result.duration_ms,
                    "follow_ups_run": result.follow_ups_run,
                },
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
