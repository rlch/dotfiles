"""Typed loaders for every artifact in a scenario bundle.

Mirrors the bundle layout from
`openspec/changes/dev-cli-scenarios/design.md` §D5. Loaders return small
dataclasses (or plain dicts for free-shape JSON) and raise
`BundleLoadError` with the path + field that broke when an artifact is
missing or malformed — the reviewer skill prints the error verbatim so
the user can fix the bundle (or the runner) and rerun.

No third-party deps; stdlib only. Python 3.11+.
"""

from __future__ import annotations

import json
import tomllib  # 3.11+
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class BundleLoadError(Exception):
    """Raised when a bundle artifact is missing or malformed."""


# ---------------------------------------------------------------------------
# result.json
# ---------------------------------------------------------------------------


@dataclass
class FollowUpResult:
    index: int
    kind: str
    duration_ms: int
    settled: bool


@dataclass
class RunResult:
    run_outcome: str  # "settled" | "timed_out" | "panicked" | "wizard_failed" | "aborted"
    duration_ms: int
    follow_ups_run: int
    follow_ups: list[FollowUpResult]
    exit_code: int
    error_summary: str | None


def load_result(bundle_dir: Path) -> RunResult:
    path = bundle_dir / "result.json"
    if not path.exists():
        raise BundleLoadError(f"missing required artifact: {path}")
    try:
        raw = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        raise BundleLoadError(f"failed to parse {path}: {e}") from e
    try:
        follow_ups = [
            FollowUpResult(
                index=fu["index"],
                kind=fu["kind"],
                duration_ms=int(fu["duration_ms"]),
                settled=bool(fu["settled"]),
            )
            for fu in raw.get("follow_ups", [])
        ]
        return RunResult(
            run_outcome=raw["run_outcome"],
            duration_ms=int(raw["duration_ms"]),
            follow_ups_run=int(raw.get("follow_ups_run", 0)),
            follow_ups=follow_ups,
            exit_code=int(raw["exit_code"]),
            error_summary=raw.get("error_summary"),
        )
    except (KeyError, TypeError, ValueError) as e:
        raise BundleLoadError(f"malformed {path}: {e}") from e


# ---------------------------------------------------------------------------
# scenario.toml
# ---------------------------------------------------------------------------


def load_scenario_toml(bundle_dir: Path) -> dict[str, Any]:
    """Return the raw TOML as a dict. Free-shape — the scenario format
    evolves and we don't want to lock callers to a particular subset."""
    path = bundle_dir / "scenario.toml"
    if not path.exists():
        raise BundleLoadError(f"missing scenario.toml at {path}")
    try:
        with path.open("rb") as f:
            return tomllib.load(f)
    except tomllib.TOMLDecodeError as e:
        raise BundleLoadError(f"failed to parse {path}: {e}") from e


# ---------------------------------------------------------------------------
# recursive snapshot (snapshot_initial / snapshot_final / snapshots/NN_*.json)
# ---------------------------------------------------------------------------


def load_recursive_snapshot(bundle_dir: Path, name: str) -> dict[str, Any]:
    """Load one recursive snapshot by filename (relative to bundle dir).
    `name` includes the suffix, e.g. "snapshot_final.json" or
    "snapshots/01_after_chat.json"."""
    path = bundle_dir / name
    if not path.exists():
        raise BundleLoadError(f"missing snapshot at {path}")
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        raise BundleLoadError(f"failed to parse {path}: {e}") from e


def list_followup_snapshots(bundle_dir: Path) -> list[Path]:
    """Return follow-up snapshot paths in scenario order (NN ascending).
    Empty list when no follow-ups ran."""
    snaps_dir = bundle_dir / "snapshots"
    if not snaps_dir.exists():
        return []
    return sorted(snaps_dir.glob("*.json"))


# ---------------------------------------------------------------------------
# errors.jsonl
# ---------------------------------------------------------------------------


@dataclass
class ErrorEvent:
    ts_ms: int
    level: str
    source: str
    message: str
    span_path: str | None = None


def load_errors(bundle_dir: Path) -> list[ErrorEvent]:
    """Return all deduped ERROR-level events. Empty list when
    `errors.jsonl` is absent OR empty (both are "no errors observed")."""
    path = bundle_dir / "errors.jsonl"
    if not path.exists():
        return []
    out: list[ErrorEvent] = []
    for lineno, line in enumerate(path.read_text().splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as e:
            raise BundleLoadError(
                f"{path}:{lineno}: malformed JSONL row: {e}"
            ) from e
        try:
            out.append(
                ErrorEvent(
                    ts_ms=int(row["ts_ms"]),
                    level=row["level"],
                    source=row["source"],
                    message=row["message"],
                    span_path=row.get("span_path"),
                )
            )
        except (KeyError, TypeError, ValueError) as e:
            raise BundleLoadError(
                f"{path}:{lineno}: malformed row {row!r}: {e}"
            ) from e
    return out


# ---------------------------------------------------------------------------
# prompts.jsonl
# ---------------------------------------------------------------------------


@dataclass
class PromptRecord:
    ts_ms: int
    source: str  # "runner" | "subagent"
    conversation_id: str
    user_message: str
    response: str
    latency_ms: int
    model: str | None = None
    served_provider: str | None = None
    system_prompt: str | None = None
    preamble: str | None = None
    tokens_in: int | None = None
    tokens_out: int | None = None
    tokens_total: int | None = None
    tokens_cached_input: int | None = None


def load_prompts(bundle_dir: Path) -> list[PromptRecord]:
    path = bundle_dir / "prompts.jsonl"
    if not path.exists():
        return []
    out: list[PromptRecord] = []
    for lineno, line in enumerate(path.read_text().splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as e:
            raise BundleLoadError(
                f"{path}:{lineno}: malformed JSONL row: {e}"
            ) from e
        try:
            out.append(
                PromptRecord(
                    ts_ms=int(row["ts_ms"]),
                    source=row["source"],
                    conversation_id=row.get("conversation_id", ""),
                    user_message=row.get("user_message", ""),
                    response=row.get("response", ""),
                    latency_ms=int(row.get("latency_ms", 0)),
                    model=row.get("model"),
                    served_provider=row.get("served_provider"),
                    system_prompt=row.get("system_prompt"),
                    preamble=row.get("preamble"),
                    tokens_in=row.get("tokens_in"),
                    tokens_out=row.get("tokens_out"),
                    tokens_total=row.get("tokens_total"),
                    tokens_cached_input=row.get("tokens_cached_input"),
                )
            )
        except (KeyError, TypeError, ValueError) as e:
            raise BundleLoadError(
                f"{path}:{lineno}: malformed row {row!r}: {e}"
            ) from e
    return out


# ---------------------------------------------------------------------------
# pipeline.jsonl + pipeline.json
# ---------------------------------------------------------------------------


@dataclass
class PipelineUnit:
    id: str
    kind: str
    session_path: list[str]
    detail: str
    started_ms: int
    status: str  # "in_flight" | "succeeded" | "failed"
    repair_count: int
    parent_id: str | None = None
    ended_ms: int | None = None
    duration_ms: int | None = None


def load_pipeline_events(bundle_dir: Path) -> list[PipelineUnit]:
    """Currently only `event="unit"` rows; the runner emits no separate
    `event="repair"` rows in v1 (repairs collate to `repair_count` on the
    parent unit)."""
    path = bundle_dir / "pipeline.jsonl"
    if not path.exists():
        return []
    out: list[PipelineUnit] = []
    for lineno, line in enumerate(path.read_text().splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as e:
            raise BundleLoadError(
                f"{path}:{lineno}: malformed JSONL row: {e}"
            ) from e
        # Per the design's event-tagged JSONL, ignore any non-unit rows
        # gracefully — forward-compat with v2 repair rows.
        if row.get("event") != "unit":
            continue
        try:
            out.append(
                PipelineUnit(
                    id=row["id"],
                    kind=row["kind"],
                    session_path=list(row.get("session_path") or []),
                    detail=row.get("detail", ""),
                    started_ms=int(row["started_ms"]),
                    status=row["status"],
                    repair_count=int(row.get("repair_count", 0)),
                    parent_id=row.get("parent_id"),
                    ended_ms=row.get("ended_ms"),
                    duration_ms=row.get("duration_ms"),
                )
            )
        except (KeyError, TypeError, ValueError) as e:
            raise BundleLoadError(
                f"{path}:{lineno}: malformed row {row!r}: {e}"
            ) from e
    return out


def load_pipeline_summary(bundle_dir: Path) -> dict[str, Any]:
    """Aggregate summary written by the runner. Returns `{}` when absent."""
    path = bundle_dir / "pipeline.json"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        raise BundleLoadError(f"failed to parse {path}: {e}") from e


# ---------------------------------------------------------------------------
# final/output.pdf marker
# ---------------------------------------------------------------------------


@dataclass
class FinalArtifact:
    status: str  # "absent" | "unsupported" | "present"
    path: Path | None = None
    size_bytes: int | None = None


def load_final(bundle_dir: Path) -> FinalArtifact:
    """Distinguishes the three D14 states:
    - no `final/` dir → "absent" (runner didn't get that far)
    - `final/EXPORT_UNSUPPORTED` marker → "unsupported"
    - `final/output.pdf` present → "present" with size
    """
    final_dir = bundle_dir / "final"
    if not final_dir.exists():
        return FinalArtifact(status="absent")
    pdf = final_dir / "output.pdf"
    if pdf.exists():
        return FinalArtifact(
            status="present", path=pdf, size_bytes=pdf.stat().st_size
        )
    marker = final_dir / "EXPORT_UNSUPPORTED"
    if marker.exists():
        return FinalArtifact(status="unsupported", path=marker)
    return FinalArtifact(status="absent")


# ---------------------------------------------------------------------------
# Convenience aggregator
# ---------------------------------------------------------------------------


@dataclass
class Bundle:
    """Materialized bundle. Use `Bundle.load(path)` to load every artifact
    in one pass; the script then operates on plain dataclass fields."""

    path: Path
    scenario: dict[str, Any]
    result: RunResult
    errors: list[ErrorEvent] = field(default_factory=list)
    prompts: list[PromptRecord] = field(default_factory=list)
    pipeline: list[PipelineUnit] = field(default_factory=list)
    pipeline_summary: dict[str, Any] = field(default_factory=dict)
    final: FinalArtifact = field(default_factory=lambda: FinalArtifact(status="absent"))

    @classmethod
    def load(cls, bundle_dir: Path) -> "Bundle":
        return cls(
            path=bundle_dir,
            scenario=load_scenario_toml(bundle_dir),
            result=load_result(bundle_dir),
            errors=load_errors(bundle_dir),
            prompts=load_prompts(bundle_dir),
            pipeline=load_pipeline_events(bundle_dir),
            pipeline_summary=load_pipeline_summary(bundle_dir),
            final=load_final(bundle_dir),
        )
