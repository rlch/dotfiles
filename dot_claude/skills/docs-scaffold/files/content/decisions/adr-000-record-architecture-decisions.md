---
title: "ADR-000: Record architecture decisions"
type: decision
status: active
tags: [adr, meta]
date: 2026-01-01
---

# ADR-000: Record architecture decisions

## Status

Accepted.

## Context

We need a durable, low-friction record of *why* the architecture is the way it
is — the reasoning, not just the result — so future contributors (human or
agent) don't re-litigate settled choices or violate invariants they don't know
exist.

## Decision

Use Architecture Decision Records (ADRs): one short markdown file per decision
under `decisions/`, append-only, numbered `adr-NNN-<slug>.md`. Each has
**Status**, **Context**, **Decision**, **Consequences**. Machine-checkable
invariants graduate to `openspec/specs/`.

## Consequences

- A greppable history of decisions and their rationale.
- Superseding a decision means a new ADR that sets the old one's `status:` to
  `superseded`, not editing history.
