#!/usr/bin/env python3
"""sync_specs — mirror openspec/specs into the docs portal as a "Specs" section.

OpenSpec is the normative layer; the docs portal should *show* it without it
becoming a second source of truth. This reads `<repo>/openspec/specs/<cap>/spec.md`
and writes a generated mirror `<content>/specs/<cap>.md` with injected
frontmatter (title = capability), plus a `meta.json` so the portal renders a
titled "OpenSpec" section. The mirror is generated — gitignore it.

usage:
    python3 sync_specs.py <openspec_specs_dir> <out_specs_dir> [--root]
    # e.g. (greenfield) from repo root:
    python3 sync_specs.py openspec/specs docs/content/docs/specs
    # e.g. (trading legacy, content at docs/ root):
    python3 sync_specs.py openspec/specs docs/specs

--root makes it a sidebar TAB (Fumadocs root toggle) instead of a section.
No third-party deps. Re-run via docs-sync after editing specs.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path


def main() -> int:
    argv = sys.argv[1:]
    root = "--root" in argv
    pos = [a for a in argv if not a.startswith("--")]
    if len(pos) < 2:
        print("usage: sync_specs.py <openspec_specs_dir> <out_specs_dir> [--root]", file=sys.stderr)
        return 2
    src = Path(pos[0]).resolve()
    out = Path(pos[1]).resolve()

    if not src.is_dir():
        print(f"sync_specs: no specs dir at {src} — nothing to mirror (ok for greenfield)")
        return 0

    specs = sorted(src.glob("*/spec.md"))
    if not specs:
        print(f"sync_specs: {src} has no <capability>/spec.md — nothing to mirror")
        return 0

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    for spec in specs:
        cap = spec.parent.name
        body = spec.read_text()
        body = re.sub(r"^---\n.*?\n---\n", "", body, count=1, flags=re.DOTALL)  # drop any frontmatter
        body = re.sub(r"^\s*#\s+.*?\n", "", body, count=1)  # drop leading H1 (dup of injected title)
        fm = f"---\ntitle: {cap}\ntype: spec\nstatus: active\ntags: [spec, openspec]\n---\n\n"
        (out / f"{cap}.md").write_text(fm + body.lstrip("\n"))

    meta = {
        "title": "OpenSpec",
        "description": "Normative capability specs — Requirement: SHALL … + Scenario: blocks.",
    }
    if root:
        meta["root"] = True
    (out / "meta.json").write_text(json.dumps(meta, indent=2) + "\n")
    print(f"sync_specs: mirrored {len(specs)} specs -> {out}" + (" (as tab)" if root else " (as section)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
