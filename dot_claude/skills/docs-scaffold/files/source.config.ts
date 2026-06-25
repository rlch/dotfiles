import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { join } from 'node:path';
import { remarkD2 } from './mdx-plugins/remark-d2.mjs';
// Legacy Obsidian adoption only: also import remarkWikilink and wire it as the
// SECOND remark plugin (see the docs-scaffold SKILL.md). Greenfield repos author
// Fumadocs-native (standard markdown links) and don't need it.

// fumadocs resolves dir/files relative to the project root (cwd). Match that —
// the COMPILED config runs from <root>/.source, so import.meta.url would be wrong.
const contentRoot = process.cwd();

// Lenient frontmatter: `title:` optional (filename slug often suffices) and
// passthrough extra keys (type/status/tags/date/...) so docs that follow the
// vault convention don't hard-fail the default required-title schema.
const looseDocSchema = pageSchema.extend({ title: z.string().optional() }).catchall(z.any());

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: looseDocSchema,
    postprocess: { includeProcessedMarkdown: true },
  },
  meta: { schema: metaSchema },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [
      // [attacher, options] tuple — NEVER remarkD2({...}). Pre-invoking would make
      // unified call the returned transformer as an attacher with tree=undefined.
      // d2 first: render fenced d2 -> SVG file before shiki ever sees `language-d2`.
      [remarkD2, { outDir: join(contentRoot, 'public', 'd2'), layout: 'elk' }],
      ...v,
    ],
  },
});
