#!/usr/bin/env python3
"""Colour cargo-depgraph DOT output by workspace layer/group.

Generalized from the trading vault's version: instead of a hard-coded palette,
it groups workspace members by their path group (the segment under `crates/`,
e.g. `crates/<group>/<crate>`) and assigns palette colours to groups in sorted
order. Repos that don't use `crates/<group>/` get the first path segment as the
group. External (non-workspace) crates are left untouched.

    cargo depgraph --workspace-only > raw.dot
    python3 colour_depgraph.py raw.dot > coloured.dot
    dot -Tsvg coloured.dot -o dep-graph.svg
"""
from __future__ import annotations

import re
import sys
import tomllib
from pathlib import Path

REPO_ROOT = Path.cwd()

# Catppuccin-ish soft fills, assigned to groups in sorted order.
PALETTE = [
    "#f4f4f4", "#cfe2f3", "#d9ead3", "#fff2cc", "#fce5cd",
    "#f4cccc", "#d9d2e9", "#d0e0e3", "#ead1dc", "#d0f0c0",
]

NODE_RE = re.compile(
    r'^(?P<lead>\s*\d+\s*\[\s*label\s*=\s*"(?P<name>[^"]+)"\s*shape\s*=\s*box)(?P<tail>\])\s*$'
)


def workspace_groups() -> dict[str, str]:
    """Return {crate-name -> group}."""
    cargo = REPO_ROOT / "Cargo.toml"
    if not cargo.exists():
        return {}
    with cargo.open("rb") as f:
        data = tomllib.load(f)
    members = data.get("workspace", {}).get("members", [])
    out: dict[str, str] = {}
    for rel in members:
        parts = rel.split("/")
        group = parts[1] if parts[0] == "crates" and len(parts) >= 3 else parts[0]
        member_cargo = REPO_ROOT / rel / "Cargo.toml"
        if not member_cargo.exists():
            continue
        with member_cargo.open("rb") as f:
            name = tomllib.load(f).get("package", {}).get("name")
        if name:
            out[name] = group
    return out


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} <raw-dot>", file=sys.stderr)
        return 2
    groups = workspace_groups()
    colour_of = {g: PALETTE[i % len(PALETTE)] for i, g in enumerate(sorted(set(groups.values())))}
    out = []
    for line in Path(sys.argv[1]).read_text().splitlines():
        m = NODE_RE.match(line)
        if m and (g := groups.get(m.group("name"))):
            out.append(f'{m.group("lead")} style = filled fillcolor = "{colour_of[g]}"{m.group("tail")}')
        else:
            out.append(line)
    sys.stdout.write("\n".join(out) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
