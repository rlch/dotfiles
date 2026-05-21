#!/usr/bin/env python3
"""Structural checks on `snapshot_final.json` and the recursive tree.

This script gathers objective facts; the verdict is ALWAYS `inconclusive`
(per design D8 — state quality is judgment, not arithmetic). The reviewer
skill always invokes the LLM with these findings as context.

Facts surfaced:
  - count of Hot / Cold / Contended children (recursively)
  - any Contended child at settle (suspicious — should be transient)
  - if scenario inputs declared `slide_count`, does the final snapshot
    have at least that many children at the root?
  - empty leaves (Hot children with no placements/blocks)

Usage: check_state.py <bundle-dir>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).parent))
from lib.bundle import (
    BundleLoadError,
    load_recursive_snapshot,
    load_scenario_toml,
)


def walk_children(node: dict[str, Any]) -> list[dict[str, Any]]:
    """Flatten all child nodes (excluding root) via DFS."""
    out: list[dict[str, Any]] = []
    stack: list[dict[str, Any]] = list(node.get("children") or [])
    while stack:
        n = stack.pop()
        out.append(n)
        stack.extend(n.get("children") or [])
    return out


def child_placement_count(self_node: dict[str, Any]) -> int | None:
    """Best-effort count of "things on the canvas" for a Hot child.
    Returns None when the child isn't Hot or doesn't carry a recognized
    placements/blocks field. Used for the "empty leaf" heuristic."""
    if self_node.get("status") != "hot":
        return None
    snap = self_node.get("modality_snapshot") or {}
    for key in ("placements", "blocks"):
        v = snap.get(key)
        if isinstance(v, list):
            return len(v)
    return None


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: check_state.py <bundle-dir>", file=sys.stderr)
        return 2
    bundle = Path(argv[1])

    try:
        snap = load_recursive_snapshot(bundle, "snapshot_final.json")
        scenario = load_scenario_toml(bundle)
    except BundleLoadError as e:
        print(json.dumps({"verdict": "inconclusive", "findings": [str(e)]}))
        return 0

    findings: list[str] = []
    children = walk_children(snap)

    # (1) Hot / Cold / Contended tally.
    hot = cold = contended = 0
    for c in children:
        self_node = c.get("self") or {}
        status = self_node.get("status")
        if status == "hot":
            hot += 1
        elif status == "cold":
            cold += 1
        elif status == "contended":
            contended += 1

    if contended:
        findings.append(
            f"{contended} contended child(ren) at settle — "
            "should be transient; reviewer should investigate"
        )
    if cold:
        # Cold-at-settle is expected for some scenarios (the generator
        # legitimately chose not to warm a slot) but often signals a
        # generation gap. Surface for LLM judgment.
        findings.append(
            f"{cold} cold child(ren) at settle — verify the scenario "
            "intended to leave them unpopulated"
        )

    # (2) Top-level child count vs scenario inputs.slide_count.
    declared = (scenario.get("inputs") or {}).get("slide_count")
    top_children = snap.get("children") or []
    if isinstance(declared, int):
        if len(top_children) < declared:
            findings.append(
                f"slide_count mismatch: scenario declared {declared}, "
                f"final snapshot has {len(top_children)} children"
            )

    # (3) Empty leaves: Hot children with zero placements/blocks.
    for c in children:
        self_node = c.get("self") or {}
        count = child_placement_count(self_node)
        if count == 0:
            sid = c.get("session_id", "<unknown>")
            slot = c.get("slot") or {}
            findings.append(
                f"empty leaf: child {sid} "
                f"(slot {slot.get('parent_field')}[{slot.get('index')}]) "
                "is Hot but has zero placements/blocks"
            )

    # State is always inconclusive — quality is judgment.
    print(
        json.dumps(
            {
                "verdict": "inconclusive",
                "findings": findings,
                "stats": {
                    "modality": snap.get("modality"),
                    "top_level_children": len(top_children),
                    "total_children": len(children),
                    "hot": hot,
                    "cold": cold,
                    "contended": contended,
                    "declared_slide_count": declared,
                },
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
