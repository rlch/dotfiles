"""Statistics + critical-path walk over pipeline events. Mirrors the
arithmetic the runner uses in `crates/dev_cli/src/scenario/pipeline.rs`
so the skill's "outliers vs thresholds" computation matches `pipeline.json`
when no thresholds are overridden.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from lib.bundle import PipelineUnit


@dataclass
class KindStats:
    kind: str
    count: int
    p50_ms: int
    p95_ms: int
    max_ms: int


def percentile(sorted_ms: list[int], p: float) -> int:
    """Nearest-rank percentile (no interpolation). p50 of [100,200,300,
    400,500] is 300, p95 is 500. Matches the runner's `pipeline::percentile`.
    """
    if not sorted_ms:
        return 0
    n = len(sorted_ms)
    # Index = ceil(p * n) - 1, clamped to [0, n-1].
    idx = max(0, min(n - 1, int(-(-p * n // 1)) - 1))
    return sorted_ms[idx]


def by_kind(units: Iterable[PipelineUnit]) -> dict[str, KindStats]:
    """Group completed units by kind and compute p50/p95/max."""
    durations: dict[str, list[int]] = {}
    for u in units:
        if u.duration_ms is None:
            continue
        durations.setdefault(u.kind, []).append(u.duration_ms)
    out: dict[str, KindStats] = {}
    for kind, ds in durations.items():
        ds_sorted = sorted(ds)
        out[kind] = KindStats(
            kind=kind,
            count=len(ds_sorted),
            p50_ms=percentile(ds_sorted, 0.50),
            p95_ms=percentile(ds_sorted, 0.95),
            max_ms=ds_sorted[-1],
        )
    return out


def critical_path(units: list[PipelineUnit]) -> list[str]:
    """Walk from the longest completed leaf back through `parent_id`.
    Returns IDs root-first. Mirrors
    `crates/dev_cli/src/scenario/pipeline.rs::compute_critical_path`."""
    if not units:
        return []
    by_id = {u.id: u for u in units}
    parented = {u.parent_id for u in units if u.parent_id}
    leaves = [
        u
        for u in units
        if u.id not in parented and u.duration_ms is not None
    ]
    if not leaves:
        return []
    leaf = max(leaves, key=lambda u: u.duration_ms or 0)
    chain: list[str] = [leaf.id]
    cursor = leaf.parent_id
    while cursor:
        chain.append(cursor)
        nxt = by_id.get(cursor)
        cursor = nxt.parent_id if nxt else None
    chain.reverse()
    return chain
