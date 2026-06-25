// remark-wikilink — rewrite Obsidian-style [[wikilinks]] to standard links so
// legacy vault content renders under Fumadocs without touching the source files.
//
// Handles the forms actually used in the trading vault:
//   [[02-critique]]                              bare slug (same/any dir)
//   [[glossary/terms#Hot path|hot path]]         dir/slug + #anchor + |alias  (incl. \| from tables)
//   [[../decisions/ADR-001-canonical-types|ADR]] relative path + alias
//
// Resolution mirrors Fumadocs' default slugging: a file at
// <contentRoot>/a/b.md is served at <baseUrl>/a/b ; index/README collapse to
// the dir. Heading anchors are slugified with github-slugger (same as Fumadocs'
// rehype-slug) so #Hot path -> #hot-path.
//
// Implementation note: we walk the mdast with a hand-rolled, null-guarded
// recursion rather than unist-util-visit / mdast-util-find-and-replace. In the
// real fumadocs build pipeline some files yield a tree with an `undefined`
// child node, which makes those traversal helpers throw
// ("Cannot use 'in' operator to search for 'children' in undefined") even on
// files that contain no wikilinks at all. A guarded recursion is immune.
//
// Options:
//   contentRoot — absolute path that slugs are relative to (the docs content base)
//   baseUrl     — URL prefix pages are served under (default "/docs")
//   include     — dir names under contentRoot to index for bare-slug lookup
import { readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, basename, extname, posix } from 'node:path';
import GithubSlugger from 'github-slugger';

const MD = new Set(['.md', '.mdx']);
// nodes whose text must never be touched
const OPAQUE = new Set(['code', 'inlineCode', 'yaml', 'toml', 'html', 'mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression']);

// [[ target ( #anchor )? ( | alias )? ]]  — alias pipe may be escaped as \| in tables.
const WIKILINK = /\[\[([^\]#|]+?)(?:#([^\]|]+))?(?:\\?\|([^\]]+))?\]\]/g;

function walkFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkFiles(full, out);
    else if (MD.has(extname(name))) out.push(full);
  }
  return out;
}

// relative-path-minus-extension, posix-normalized, index/README collapsed
function toSlugPath(absFile, contentRoot) {
  let rel = relative(contentRoot, absFile).split(/[\\/]/).join('/');
  rel = rel.replace(/\.mdx?$/i, '').replace(/\/(index|README)$/i, '');
  if (/^(index|README)$/i.test(rel)) rel = '';
  return rel;
}

export function remarkWikilink(options = {}) {
  const {
    contentRoot,
    baseUrl = '/docs',
    include = ['architecture', 'decisions', 'glossary', 'runbooks'],
  } = options;
  if (!contentRoot) throw new Error('[remark-wikilink] contentRoot is required');

  // basename -> [slugPath, …] index for bare-slug links
  const byBase = new Map();
  for (const dir of include) {
    let files = [];
    try {
      files = walkFiles(join(contentRoot, dir));
    } catch {
      continue; // dir may not exist in a given repo
    }
    for (const abs of files) {
      const base = basename(abs).replace(/\.mdx?$/i, '');
      if (!byBase.has(base)) byBase.set(base, []);
      byBase.get(base).push(toSlugPath(abs, contentRoot));
    }
  }

  const toUrl = (slugPath, anchor) => {
    const u = posix.join(baseUrl, slugPath);
    if (!anchor) return u;
    return `${u}#${new GithubSlugger().slug(anchor.trim())}`;
  };

  return (tree, file) => {
    const fromAbs = file?.path || (file?.history && file.history[0]);
    const fromDir = fromAbs ? dirname(fromAbs) : contentRoot;

    const resolve = (target) => {
      const t = target.trim();
      if (t.includes('/')) {
        const abs = /^\.\.?\//.test(t) ? join(fromDir, t) : join(contentRoot, t);
        return toSlugPath(extname(abs) ? abs : `${abs}.md`, contentRoot);
      }
      const hits = byBase.get(t);
      if (!hits || hits.length === 0) return null;
      if (hits.length === 1) return hits[0];
      const fromSlugDir = dirname(toSlugPath(fromAbs || '', contentRoot));
      return hits.find((h) => dirname(h) === fromSlugDir) || hits[0];
    };

    // split a text value into [text, link, …]; returns null if no wikilink present
    const splitText = (value) => {
      WIKILINK.lastIndex = 0;
      const out = [];
      let last = 0;
      let m;
      while ((m = WIKILINK.exec(value)) !== null) {
        const [whole, target, anchor, alias] = m;
        if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
        const slugPath = resolve(target);
        if (slugPath == null) {
          console.warn(`[remark-wikilink] unresolved [[${target}]] in ${fromAbs || '?'}`);
          out.push({ type: 'text', value: whole });
        } else {
          const label = (alias || target.split('/').pop()).trim();
          out.push({ type: 'link', url: toUrl(slugPath, anchor), children: [{ type: 'text', value: label }] });
        }
        last = m.index + whole.length;
      }
      if (out.length === 0) return null;
      if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
      return out;
    };

    const walk = (node) => {
      if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return;
      const next = [];
      for (const child of node.children) {
        if (child == null || typeof child !== 'object') {
          if (child != null) next.push(child);
          continue;
        }
        if (child.type === 'text' && typeof child.value === 'string' && child.value.includes('[[')) {
          const parts = splitText(child.value);
          if (parts) next.push(...parts);
          else next.push(child);
        } else {
          if (!OPAQUE.has(child.type)) walk(child);
          next.push(child);
        }
      }
      node.children = next;
    };

    walk(tree);
  };
}

export default remarkWikilink;
