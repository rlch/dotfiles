---
title: Conventions
type: glossary
status: active
tags: [convention, meta]
---

# Conventions

The single source of truth for how `docs/` is organised. Update this file
*before* introducing a new pattern; if a pattern isn't described here it's an
exception, not a convention.

## Folder taxonomy

```
docs/content/docs/
  index.mdx              portal landing
  CONVENTIONS.md         this file
  architecture/          living "where the system is / where it's going" docs
  decisions/             ADRs — settled architectural decisions, append-only
  glossary/              shared terms + definitions
  runbooks/              operator playbooks (procedural)
openspec/
  specs/<capability>/    NORMATIVE — Requirement: SHALL … + Scenario: blocks
  changes/               in-flight change proposals
```

## The big rules

1. **Type vs lifecycle.** Folder = *type*; `status:` frontmatter = *lifecycle*.
   Don't conflate.
2. **OpenSpec is the normative layer.** Anything expressible as a
   `Requirement: SHALL …` belongs in `openspec/specs/<capability>/`. The docs
   vault holds the prose/justification that doesn't fit that shape, and cites
   the specs from a `## References` section.
3. **Diagrams as code.** Architecture diagrams are fenced ` ```d2 ` (or
   ` ```mermaid `) blocks — the source of truth is the diagram text; the SVG is
   generated at build (`remark-d2`), never hand-edited.
4. **Standard markdown links.** `[text](../decisions/adr-000)`. Authoring is
   Fumadocs-native — no Obsidian wikilinks (those are supported only for legacy
   vault adoption, via `remark-wikilink`).

## Frontmatter schema

```yaml
---
title: …                  # optional; only if the filename slug is opaque
type: <architecture | decision | glossary | runbook>
status: <draft | active | settled | superseded | stale>
tags: [topic, …]
date: YYYY-MM-DD          # required for anything dated (decisions, snapshots)
---
```

`type:` and `status:` are closed sets; `tags:` is free-form (reuse before
inventing).

### Lifecycle (`status:`)

| `status:`    | Meaning                                              |
| ------------ | ---------------------------------------------------- |
| `draft`      | WIP, not yet load-bearing                            |
| `active`     | Current, still informing decisions                   |
| `settled`    | Decided/closed, kept for forensics                   |
| `superseded` | Replaced by a newer doc — link it                    |
| `stale`      | Known out of date, kept for history                  |

## Freshness

`00-INDEX` and the dependency graph are generated — run the **docs-sync** skill
after adding/moving docs or changing the dependency structure. Don't hand-edit
generated files.
