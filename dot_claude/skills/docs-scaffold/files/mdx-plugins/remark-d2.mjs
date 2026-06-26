// remark-d2 — compile ```d2 fenced blocks to SVG, BEFORE rehype.
//
// Handling d2 at the remark stage (not rehype) is deliberate: it runs before
// fumadocs' shiki highlighter, so shiki never sees `language-d2` (which it can't
// tokenize and would throw on). We render each diagram to an .svg file under the
// app's public/ dir and replace the code block with an <img> pointing at it —
// which also dodges MDX's JSX parsing of raw SVG (xmlns:xlink etc.).
//
// Renderer = the @terrastruct/d2 WASM compiler, IN-PROCESS — NOT the `d2` CLI.
// Next's dev-server worker blocks child_process entirely (`spawn EBADF`), so the
// CLI approach builds fine but 500s every MDX page under `next dev`. WASM runs
// in-process, so it works in both build and dev. The transformer is async
// (unified awaits it); SVGs are content-addressed and cached.
//
// Options:
//   outDir  — abs dir to write SVGs into (e.g. <app>/public/d2)
//   urlBase — URL path the SVGs are served under (default "/d2")
//   layout  — "elk" | "dagre"   ·   sketch — bool   ·   pad — px
//   theme   — d2 themeID (default 200 "Dark Mauve" — matches the Catppuccin
//             Mocha portal; SVGs are static so we render one dark theme rather
//             than relying on the toggle)
import { D2 } from '@terrastruct/d2';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export function remarkD2(options = {}) {
  const { outDir, urlBase = '/d2', layout = 'elk', theme = 200, sketch = false, pad = 16 } = options;
  if (!outDir) throw new Error('[remark-d2] outDir is required');
  let engine; // lazy WASM singleton, reused across blocks

  const render = async (src, file) => {
    const hash = createHash('sha1').update(`${layout}|${theme}|${sketch}|${pad}|${src}`).digest('hex').slice(0, 16);
    const name = `${hash}.svg`;
    const outFile = join(outDir, name);
    if (existsSync(outFile)) return `${urlBase}/${name}`; // cached
    try {
      engine ??= new D2();
      const result = await engine.compile(src, { layout });
      const svg = await engine.render(result.diagram, { ...result.renderOptions, themeID: theme, sketch, pad });
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outFile, svg);
      return `${urlBase}/${name}`;
    } catch (err) {
      const where = file?.path ? ` in ${file.path}` : '';
      console.warn(`[remark-d2] failed to render a d2 block${where}: ${err.message}`);
      return null; // leave the original code block so the page still builds
    }
  };

  return async (tree, file) => {
    // collect first (sync walk), then await renders — keeps tree mutation simple
    const targets = [];
    const walk = (node) => {
      if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child == null || typeof child !== 'object') continue;
        if (child.type === 'code' && (child.lang || '').toLowerCase() === 'd2') {
          targets.push({ parent: node, index: i, src: child.value || '' });
        } else {
          walk(child);
        }
      }
    };
    walk(tree);

    for (const t of targets) {
      const url = await render(t.src, file);
      if (url) {
        t.parent.children[t.index] = {
          type: 'paragraph',
          children: [{ type: 'image', url, alt: 'diagram', title: null }],
        };
      }
    }
  };
}

export default remarkD2;
