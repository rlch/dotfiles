// remark-d2 — compile ```d2 fenced blocks to SVG at build time, BEFORE rehype.
//
// Handling d2 at the remark stage (not rehype) is deliberate: it runs before
// fumadocs' shiki highlighter, so shiki never sees `language-d2` (which it can't
// tokenize and would throw on). We render the d2 to an .svg file under the
// app's public/ dir and replace the code block with an <img> pointing at it —
// which also dodges MDX's JSX parsing of raw SVG (xmlns:xlink etc.) and any
// hast sanitizer that would strip a data: URI.
//
// The SVG is content-addressed (hash of the d2 source), so the output is
// deterministic and regenerated only when the diagram changes.
//
// Uses the system `d2` CLI (stdin -> stdout). For a fully npm-portable variant
// (CI without system d2), swap execFileSync for the async `@terrastruct/d2`
// WASM API.
//
// Options:
//   outDir  — abs dir to write SVGs into (default <publicBase>/d2)
//   urlBase — URL path the SVGs are served under (default "/d2")
//   layout/theme/sketch/pad — d2 CLI flags
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export function remarkD2(options = {}) {
  const { outDir, urlBase = '/d2', layout = 'elk', theme = 0, sketch = false, pad = 16 } = options;
  if (!outDir) throw new Error('[remark-d2] outDir is required');

  const render = (src, file) => {
    const hash = createHash('sha1').update(`${layout}|${theme}|${sketch}|${pad}|${src}`).digest('hex').slice(0, 16);
    const name = `${hash}.svg`;
    try {
      const svg = execFileSync(
        'd2',
        [`--layout=${layout}`, `--theme=${theme}`, `--sketch=${sketch}`, `--pad=${pad}`, '-', '-'],
        { input: src, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
      );
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, name), svg);
      return `${urlBase}/${name}`;
    } catch (err) {
      const where = file?.path ? ` in ${file.path}` : '';
      console.warn(`[remark-d2] failed to render a d2 block${where}: ${err.message}`);
      return null; // leave the original code block so the page still builds
    }
  };

  return (tree, file) => {
    const walk = (node) => {
      if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child == null || typeof child !== 'object') continue;
        if (child.type === 'code' && (child.lang || '').toLowerCase() === 'd2') {
          const url = render(child.value || '', file);
          if (url) {
            node.children[i] = {
              type: 'paragraph',
              children: [{ type: 'image', url, alt: 'diagram', title: null }],
            };
            continue;
          }
        }
        walk(child);
      }
    };

    walk(tree);
  };
}

export default remarkD2;
