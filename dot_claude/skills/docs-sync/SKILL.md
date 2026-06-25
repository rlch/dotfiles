---
name: docs-sync
description: Refresh a repo's generated architecture-docs artifacts so the portal can't silently drift from the code. Use when the user wants to "sync the docs", "rebuild the docs index", "regenerate the dependency graph", "update the architecture diagram", refresh 00-INDEX, or wire docs freshness into CI. Pairs with the docs-scaffold standard (Fumadocs + D2 + OpenSpec). Regenerates the frontmatter-driven index and a layer-coloured dependency graph (cargo-depgraph for Rust, madge for Node). D2 diagrams are compiled automatically at build, so they don't need a separate step.
metadata:
  tags: docs, freshness, index, dependency-graph, depgraph, ci, fumadocs
---

# docs-sync

The anti-drift engine for the docs standard. A beautiful docs portal that
drifts from the code is just a prettier lie — this regenerates the parts that
*can* be generated from source, so the only thing humans maintain is prose.

Two generated artifacts (D2 diagrams are a third, but they're compiled at build
time by `remark-d2`, so no separate step):

1. **`content/docs/00-INDEX.mdx`** — built from every doc's frontmatter
   (`type`/`status`/`date`/`title`), grouped + sorted, with standard markdown
   links. Run after adding, moving, or restatusing a doc.
2. **`content/docs/architecture/dep-graph.svg`** — the live workspace/module
   dependency graph, coloured by layer/group. The auto-generated structural map
   (lens #1) that pairs with the hand-authored C4-ish prose.

## Usage

Run from the repo root (the `docs/` app is at `<repo>/docs`).

**Index** (no external deps — pure Python):
```sh
cd <repo>/docs
python3 ~/.claude/skills/docs-sync/files/build_index.py content/docs /docs
```

**Dependency graph** (needs graphviz `dot`; Rust also needs
`cargo install cargo-depgraph`, Node uses `npx madge`):
```sh
~/.claude/skills/docs-sync/files/gen-depgraph.sh <repo>
# writes <repo>/docs/content/docs/architecture/dep-graph.svg
```
`gen-depgraph` **self-wires** the reference into the sibling `architecture/index.mdx`
(appends an embed once, idempotently), so you usually don't touch the page.

**OpenSpec mirror** — render `openspec/specs` as a portal "OpenSpec" section
(OpenSpec stays the single source of truth; this writes a generated, gitignored
mirror with injected titles):
```sh
# greenfield (content at content/docs):
python3 ~/.claude/skills/docs-sync/files/sync_specs.py openspec/specs docs/content/docs/specs
# trading legacy (content at docs/ root):
python3 ~/.claude/skills/docs-sync/files/sync_specs.py openspec/specs docs/specs
```
Add `--root` to make it a sidebar TAB instead of a section. Gitignore the mirror
(`/content/docs/specs/` or `/specs/`). No-ops cleanly when `openspec/specs` is empty.

> **Build note (`.source` race):** don't `rm -rf .source` immediately before
> `next build` with turbopack — it intermittently fails to resolve
> `collections/server`. Pre-generate first: `npx fumadocs-mdx && npm run build`
> (or just don't delete `.source`). `npm run dev` regenerates it live.

## Wiring into CI (the real anti-drift move)

Make staleness a build failure, not a chore. In CI:
```sh
python3 .../build_index.py content/docs /docs
.../gen-depgraph.sh "$PWD"
git diff --exit-code docs/content/docs/00-INDEX.mdx docs/content/docs/architecture/dep-graph.svg
```
A non-empty diff means someone changed docs/structure without regenerating —
fail the job. Commit the regenerated artifacts (they're meant to be diffed:
a changed dep-graph in a PR is a signal, Tornhill-style).

## Per-language dep-graph notes

- **Rust**: `cargo depgraph --workspace-only` → `colour_depgraph.py` colours by
  the path group under `crates/<group>/` → `dot`. (Trading keeps its own
  bespoke palette in `trading/docs/_tools/colour_depgraph.py`; this one
  auto-assigns colours to groups.)
- **Node**: `npx madge --dot src` → `dot`. Graphs the *parent repo's* source,
  not the docs app.
- Other languages: drop in another DOT producer; the colour + `dot` steps are
  reusable.

## Legacy vault (trading)

Trading's `docs/_tools/build_index.py` is the wikilink-emitting variant for its
Obsidian-rooted `docs/` (content at the docs root, not `content/docs`). Keep
using that one there; this skill's `build_index.py` targets the greenfield
`content/docs` + standard-links layout.
