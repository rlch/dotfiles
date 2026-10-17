// publish, in abymed: a document as a page on the artifacts site. abyme's export writes the
// document into a staging folder; once the operator says yes on the page, the folder goes to the artifacts
// repository's artifacts/<slug>/ (a folder with an index.html ships as is) and `artifact publish`
// commits, pushes and waits for the deploy, which takes minutes, so a job runs on its own and pages
// follow it in `state()`.
import abyme from "@abyme/plugin";
import documents from "@abyme/documents";
import options from "./options";
import type { Job, Prepared, Publish, State } from "./api";

const o = abyme.with(options).plugin.options;
const HOME = abyme.env.HOME!;
const ROOT = o.root.replace(/^~(?=\/|$)/, HOME);
const STAGE = `${(abyme.env.TMPDIR ?? "/tmp").replace(/\/+$/, "")}/abyme-publish`;
const RUN_MS = 20 * 60_000;

const state = abyme.value<State>({ published: (abyme.store.get("published") as State["published"] | undefined) ?? {}, jobs: {} });
/** What `prepare` staged, by document path, until it is published. */
const staged = new Map<string, Prepared & { dir: string }>();

const clean = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";

/** The document's slug: the one it was published at, else its name, else its folder's and its
 * name when another page holds the name, with a number after only when that is taken too. */
async function slugFor(id: string): Promise<string> {
  const had = state.getState().published[id];
  if (had) return had.slug;
  const parts = id.replace(/\.md$/, "").split("/");
  const name = clean(parts.at(-1)!);
  const others = new Set(Object.entries(state.getState().published).flatMap(([k, p]) => (k === id ? [] : [p.slug])));
  const taken = async (s: string) =>
    s === "404" ||
    others.has(s) ||
    !!(await abyme.fs.stat(`${ROOT}/local/${s}`)) ||
    !!(await abyme.fs.stat(`${ROOT}/artifacts/${s}`));
  if (!(await taken(name))) return name;
  const base = `${clean(parts.at(-2) ?? "")}-${name}`;
  let s = base;
  for (let n = 2; await taken(s); n++) s = `${base}-${n}`;
  return s;
}

function setJob(id: string, job: Job) {
  state.set((now) => ({ ...now, jobs: { ...now.jobs, [id]: job } }));
}
function setPublished(id: string, p: { slug: string; url: string; at: number } | null) {
  state.set((now) => {
    const published = { ...now.published };
    if (p) published[id] = p;
    else delete published[id];
    abyme.store.set("published", published);
    return { ...now, published };
  });
}

/** Runs the artifact CLI on the repository: its lines of output, or a throw with its error. */
async function artifact(args: string[]): Promise<string[]> {
  const r = await abyme.process.run(o.command, { args, env: { ARTIFACTS_REPO: ROOT }, timeoutMs: RUN_MS });
  const lines = r.stdout.split("\n").filter((l) => l.trim());
  if (r.code !== 0) throw new Error(r.stderr.trim().split("\n").pop() || lines.pop() || `${o.command} exited ${r.code}`);
  return lines;
}

/** Runs a job for the document `id` (its path) on its own; `state()` says how it goes. */
function run(id: string, action: Job["action"], slug: string, work: () => Promise<string | undefined>) {
  if (state.getState().jobs[id]?.state === "running") throw new Error(`${id} is being ${state.getState().jobs[id]!.action}ed already`);
  const since = Date.now();
  setJob(id, { action, slug, since, state: "running" });
  void work().then(
    (url) => setJob(id, { action, slug, since, state: "done", url }),
    (e: Error) => {
      abyme.log.warn(`${action} ${id}: ${e.message}`);
      setJob(id, { action, slug, since, state: "failed", error: e.message });
    },
  );
  return { slug };
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const api = {
  async prepare(id: string) {
    const slug = await slugFor(id);
    const dir = `${STAGE}/${slug}`;
    if (await abyme.fs.stat(dir)) await abyme.fs.remove(dir);
    const out = await documents.export({ path: id, dir });
    const title = (JSON.parse((await abyme.fs.read(`${dir}/document.json`)) ?? "{}") as { title?: string }).title || id;
    // The viewer names its page as it loads; the site's lists read the file's own title.
    const html = (await abyme.fs.read(`${dir}/index.html`)) ?? "";
    await abyme.fs.write(`${dir}/index.html`, html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`));
    const p: Prepared = {
      id,
      title,
      slug,
      url: `${o.url.replace(/\/+$/, "")}/${slug}/`,
      files: ["index.html and assets/: the viewer", "document.json: the document", ...out.files],
      again: !!state.getState().published[id],
    };
    staged.set(id, { ...p, dir });
    return p;
  },
  async publish(id: string) {
    const p = staged.get(id);
    if (!p) throw new Error(`${id} has no export waiting: publish it again`);
    return run(id, "publish", p.slug, async () => {
      staged.delete(id);
      const target = `${ROOT}/artifacts/${p.slug}`;
      if (await abyme.fs.stat(target)) await abyme.fs.remove(target);
      await abyme.fs.mkdir(`${ROOT}/artifacts`);
      await abyme.fs.copy(p.dir, target);
      await abyme.fs.remove(p.dir);
      const lines = await artifact(["publish", "-m", `feat(artifacts): publish ${p.title}`, p.slug]);
      const url = lines.filter((l) => /^https?:\/\//.test(l.trim())).pop()?.trim();
      if (!url) throw new Error(`${o.command} publish printed no URL`);
      setPublished(id, { slug: p.slug, url, at: Date.now() });
      return url;
    });
  },
  async unpublish(id: string) {
    const had = state.getState().published[id];
    if (!had) throw new Error(`${id} is not published`);
    return run(id, "unpublish", had.slug, async () => {
      await artifact(["rm", had.slug]);
      setPublished(id, null);
      return undefined;
    });
  },
  state: () => state,
};

export default api satisfies Publish;
