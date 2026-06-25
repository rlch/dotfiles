---
name: docs-scaffold
description: Scaffold the standardized Fumadocs + D2 architecture-docs site into a repo. Use when the user wants to add a docs portal to a project, "set up docs", "add the docs standard", "scaffold fumadocs", bootstrap an architecture-docs site, or apply the team docs convention (architecture/decisions/glossary/runbooks + OpenSpec) to a new repo. Produces a self-contained Node island under <repo>/docs (root stays whatever language it is) plus openspec/specs + openspec/changes. Greenfield/Fumadocs-native (standard markdown links); for adopting a legacy Obsidian vault, see the wikilink note below.
metadata:
  tags: docs, fumadocs, d2, openspec, architecture, scaffold
---

# docs-scaffold

Stands up the standardized **architecture-docs portal** in a repo: a decoupled
**Fumadocs** (Next.js) app under `<repo>/docs` that renders prose docs +
**D2 diagrams**, alongside an `openspec/` normative layer. The `docs/` dir is a
self-contained Node island (its own `package.json`/`node_modules`); the repo
root stays whatever it already is (Rust, Vite, plain Node…).

The reference implementation this is harvested from is `~/dev/trading/docs`.

## The standard (what this produces)

```
<repo>/
  docs/                          # Node island — Fumadocs (Next) app
    package.json  node_modules/  .gitignore  next.config.mjs  tsconfig.json
    source.config.ts             # d2 plugin + lenient schema (from files/)
    mdx-plugins/remark-d2.mjs    # ```d2 -> SVG at build (from files/)
    public/d2/                   # generated SVGs (gitignored)
    src/                         # app shell (create-fumadocs-app, AI stripped)
    content/docs/
      index.mdx
      CONVENTIONS.md             # the normative convention (from files/)
      architecture/  decisions/  glossary/  runbooks/
  openspec/
    specs/                       # normative: Requirement: SHALL … + Scenario:
    changes/                     # in-flight change proposals
```

Authoring is **Fumadocs-native**: standard markdown (`[text](path)`), no Obsidian.
`CONVENTIONS.md` encodes the split: machine-checkable `SHALL` requirements live
in `openspec/specs/<capability>/`, prose/justification lives in the docs vault.

## Procedure

Run these from the target repo root. `<repo>` = absolute repo path.

1. **Preconditions.** `node`/`npm` present; `d2` on PATH (`brew install d2`);
   no existing `<repo>/docs` (if one exists, this is a *legacy adoption* — see
   below, don't clobber it).

2. **Scaffold the Fumadocs base** (these exact flags avoid every interactive
   prompt; we strip the AI bits next):
   ```sh
   cd <repo>
   npx --yes create-fumadocs-app@latest docs \
     --template +next+fuma-docs-mdx --pm npm --install --no-git --src \
     --linter biome --search orama --og-image next-og --ai-chat openrouter
   ```

3. **Strip the AI-chat machinery** (we don't ship it):
   ```sh
   rm -rf docs/src/app/api/chat docs/src/components/ai docs/.env.local
   cp <skill>/files/docs-layout.tsx docs/src/app/docs/layout.tsx
   ```

4. **Overlay the standard** (copy from this skill's `files/`):
   ```sh
   mkdir -p docs/mdx-plugins
   cp <skill>/files/mdx-plugins/remark-d2.mjs docs/mdx-plugins/
   cp <skill>/files/source.config.ts          docs/source.config.ts
   cp -R <skill>/files/content/*              docs/content/docs/
   rm -f docs/content/docs/test.mdx           # scaffold sample
   printf '\n# generated d2 diagrams\n/public/d2/\n' >> docs/.gitignore
   printf '# generated openspec mirror\n/content/docs/specs/\n' >> docs/.gitignore
   ```

5. **Brand it.** Edit `docs/src/lib/shared.ts`: set `appName` and `gitConfig`
   (`user`/`repo`/`branch`) for this repo.

6. **OpenSpec layer.**
   ```sh
   mkdir -p <repo>/openspec/specs <repo>/openspec/changes
   ```
   (If the repo already uses OpenSpec, leave it; CONVENTIONS.md documents the
   SHALL→openspec / prose→docs split either way.)

7. **Generate the freshness artifacts** (docs-sync — see that skill). Safe to
   skip if the tools aren't installed; both no-op gracefully.
   ```sh
   # mirror openspec specs into the portal (no-op while specs/ is empty):
   python3 ~/.claude/skills/docs-sync/files/sync_specs.py openspec/specs docs/content/docs/specs
   # dep graph (needs graphviz dot; Node via npx madge) — self-wires into the architecture page:
   ~/.claude/skills/docs-sync/files/gen-depgraph.sh "$PWD" || echo "skipped depgraph (tools missing)"
   ```

8. **Build to verify.**
   ```sh
   cd docs && rm -rf .next public/d2 && npx fumadocs-mdx && npm run build
   ```
   Pre-generating `.source` (don't `rm` it before a turbopack build) avoids the
   intermittent `collections/server` resolution race. Expect a clean build, pages
   generated, SVGs in `public/d2/`. Dev server: `npm run dev` (port 3000).

## Gotchas the template already handles

These bit hard when building the reference; the shipped `source.config.ts` +
`remark-d2.mjs` already encode the fixes — **do not "simplify" them away**:

1. **`[attacher, options]` tuples** in `remarkPlugins` — never `remarkD2({...})`.
   Pre-invoking makes unified call the returned transformer as an attacher with
   `tree=undefined` → `"Cannot use 'in' operator … in undefined"`.
2. **`contentRoot = process.cwd()`** — the compiled config runs from
   `docs/.source/`, so `import.meta.url` resolves wrong.
3. **D2 at the remark stage** (→ writes an SVG, swaps in an `<img>`), so shiki
   never sees `language-d2` (which it can't tokenize and throws on).
4. If you ever point `dir` at the project root (`'.'`, for legacy adoption),
   **scope `meta.files`** too or it globs every `package.json` in `node_modules`.

## Legacy Obsidian-vault adoption (e.g. trading)

When a repo already has a vault of `.md` at `docs/` root with `[[wikilinks]]`:
- Set `dir: '.'` with explicit `files` globs for both `docs` AND `meta`.
- Wire `remark-wikilink` (shipped in `files/mdx-plugins/`) as the SECOND remark
  plugin: `[remarkWikilink, { contentRoot, baseUrl: '/docs' }]`. It rewrites
  `[[slug]]`/`[[dir/slug#anchor|alias]]` against a build-time basename→route map.
- Use a lenient schema (`title` optional) — vault files often omit `title`.
See `~/dev/trading/docs/source.config.ts` for the worked legacy variant.

## Freshness

Pair with the **docs-sync** skill — it regenerates `00-INDEX` from frontmatter
and a layer-coloured dependency graph (cargo-depgraph for Rust, dependency-cruiser
for Node) so the portal can't silently drift from the code.
