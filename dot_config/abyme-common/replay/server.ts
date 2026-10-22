// replay, in abymed: each page's rrweb recording, on disk as it comes, never held here. A page's
// events append to its open segment, `<dir>/ring/<page>/<start>.jsonl`, an event a line; its next
// checkout (rrweb's full snapshot, where a replay can start) closes it, gzipped, as
// `<start>-<end>.jsonl.gz`, and a segment that ended over `keep` minutes ago is deleted. A save is
// its head, then the segments since the checkout it starts at, zipped as one gzip member when it is
// written; the ring itself is never decompressed. A stylesheet rrweb inlines (abyme's own, the
// same in every full snapshot) is kept once, `<dir>/css/<sha256>.css`, and the event holds
// `replay-css:<sha256>` in its place; each page lists the ones it used in `css`, and a save's
// head carries them, so a save is whole on its own (format.ts puts them back).
import abyme from "@abyme/plugin";
import { implement } from "@abyme/schema";
import { HttpError, respond } from "@abyme/server";
import fs from "@abyme/fs/optional";
import process from "@abyme/process/optional";
import options from "./options";
import { parseSave, SAVE } from "./format";
import { replay, type Batch, type Head, type Read, type Save } from "./api.server.ts";

const o = abyme.with(options).plugin.options;
const DIR = fs ? (o.dir || `${fs.stateDir}/replays`).replace(/^~(?=\/|$)/, fs.home) : "";
const RING = `${DIR}/ring`;
const CSS = `${DIR}/css`;
/** A stylesheet shorter than this stays where it is. */
const CSS_AT = 1024;
const KEEP_MS = Math.max(1, o.keep) * 60_000;
const CLIP = Math.max(1, Math.min(o.clip, o.keep));
const SAVES = Math.max(1, Math.floor(o.saves));
/** A page that has sent nothing for this long has gone: its open segment is closed. */
const GONE_MS = 3 * 60_000;
const ERROR_GAP_MS = 60_000;

/** The control plane's files, where the recordings are; refused where there are none. */
function files() {
  if (!fs) throw new Error("no machine provides fs here, to keep a page's recording");
  return fs;
}
/** The control plane's processes, to run gzip. */
function processes() {
  if (!process) throw new Error("no machine provides process here, to run gzip");
  return process;
}

const stamp = (t: number) => new Date(t).toISOString().replace(/\.\d+Z$/, "").replace(/:/g, "-");
const clean = (s: string) => s.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "page";

/** Each page that is recording: its open segment, and the work on its files, in order. */
type Page = { label: string; written: string; css: Set<string>; open: { path: string; start: number } | null; last: number; errorSaved: number; queue: Promise<unknown> };
const pages = new Map<string, Page>();
const pageOf = (page: string, label = ""): Page => {
  let p = pages.get(page);
  if (!p) pages.set(page, (p = { label, written: "", css: new Set(), open: null, last: Date.now(), errorSaved: 0, queue: Promise.resolve() }));
  if (label) p.label = label;
  return p;
};
/** Runs `work` after what is queued for the page: a save sees every batch sent before it. */
function queued<T>(p: Page, work: () => Promise<T>): Promise<T> {
  const run = p.queue.then(work, work);
  p.queue = run.catch((e: unknown) => abyme.log.warn(`replay: ${e instanceof Error ? e.message : e}`));
  return run;
}

async function gzip(args: string[]) {
  const r = await processes().run("/usr/bin/gzip", { args, timeoutMs: 120_000 });
  if (r.code !== 0) throw new Error(`gzip ${args.join(" ")}: ${r.stderr.trim() || `exited ${r.code}`}`);
  return r.stdout;
}

/** Closes a raw segment: named for its span, gzipped. */
async function close(path: string, end: number) {
  const done = path.replace(/\.jsonl$/, `-${end}.jsonl`);
  await files().rename(path, done);
  await gzip(["-f", done]);
}

type Node = { type?: number; isStyle?: boolean; textContent?: string; attributes?: Record<string, unknown>; childNodes?: Node[] };
/** Stylesheets on disk this run knows of. */
const stored = new Set<string>();

/**
 * Takes each big stylesheet out of an event (a full snapshot's, or a link or style a mutation
 * adds), leaving `replay-css:<sha256>`: answers the sheets new to the page, to write.
 */
function outline(e: { type: number; data: any }, p: Page): { hash: string; text: string }[] {
  const found: { hash: string; text: string }[] = [];
  const ref = (text: string) => {
    const hash = abyme.crypto.hash("sha256", text);
    if (!p.css.has(hash)) found.push({ hash, text });
    return `replay-css:${hash}`;
  };
  const visit = (n: Node | undefined) => {
    if (!n) return;
    const a = n.attributes;
    if (a && typeof a._cssText === "string" && a._cssText.length >= CSS_AT) a._cssText = ref(a._cssText);
    if (n.type === 3 && n.isStyle && typeof n.textContent === "string" && n.textContent.length >= CSS_AT) n.textContent = ref(n.textContent);
    for (const c of n.childNodes ?? []) visit(c);
  };
  if (e.type === 2) visit(e.data?.node);
  else if (e.type === 3 && e.data?.source === 0) for (const add of e.data.adds ?? []) visit(add.node);
  return found;
}

/** A page's segments on disk, oldest first: closed ones with their span, the open one with none. */
async function segments(page: string) {
  const dir = `${RING}/${clean(page)}`;
  const out: { path: string; start: number; end: number | null }[] = [];
  for (const e of (await files().list(dir)) ?? []) {
    const m = /^(\d+)(?:-(\d+))?\.jsonl(\.gz)?$/.exec(e.name);
    if (!m || !!m[2] !== !!m[3]) continue;
    out.push({ path: `${dir}/${e.name}`, start: Number(m[1]), end: m[2] ? Number(m[2]) : null });
  }
  return out.sort((a, b) => a.start - b.start);
}

/** Once a minute: closes what a gone page left open (or abymed's restart did), deletes what is older than `keep`. */
async function sweep() {
  const now = Date.now();
  for (const [id, p] of pages)
    if (now - p.last > GONE_MS)
      await queued(p, async () => {
        if (p.open) await close(p.open.path, p.last);
        p.open = null;
        pages.delete(id);
      });
  const open = new Set([...pages.values()].map((p) => p.open?.path));
  for (const d of (await files().list(RING)) ?? []) {
    const segs = await segments(d.name);
    for (const s of segs) {
      if (s.end === null && !open.has(s.path)) await close(s.path, (await files().stat(s.path))?.mtime ?? now);
      else if (s.end !== null && s.end < now - KEEP_MS) await files().remove(s.path);
    }
    // Nothing left of a page but its label: the folder goes.
    if (!(await segments(d.name)).length && ![...pages.keys()].some((id) => clean(id) === d.name)) await files().remove(`${RING}/${d.name}`);
  }
  // A stylesheet no page lists any more goes too.
  const used = new Set<string>();
  for (const d of (await files().list(RING)) ?? []) for (const h of ((await files().read(`${RING}/${d.name}/css`)) ?? "").split("\n")) if (h) used.add(h);
  for (const p of pages.values()) for (const h of p.css) used.add(h);
  for (const f of (await files().list(CSS)) ?? []) {
    const h = f.name.replace(/\.css$/, "");
    if (!used.has(h)) {
      await files().remove(`${CSS}/${f.name}`);
      stored.delete(h);
    }
  }
}
// The half's engine stops with the plugin, and its timers with it. Only with a machine to sweep.
if (fs && process) {
  setInterval(() => void sweep().catch((e: unknown) => abyme.log.warn(`replay sweep: ${e instanceof Error ? e.message : e}`)), 60_000);
  void sweep().catch(() => {});
}

async function list(): Promise<Save[]> {
  const saves: Save[] = [];
  for (const e of (await files().list(DIR)) ?? []) {
    if (!SAVE.test(e.name)) continue;
    const path = `${DIR}/${e.name}`;
    const s = await files().stat(path);
    if (s) saves.push({ name: e.name, path, at: s.mtime ?? 0, size: s.size });
  }
  return saves.sort((a, b) => b.name.localeCompare(a.name));
}

const api = {
  push({ page, label, checkout, events }: Batch) {
    if (typeof page !== "string" || !Array.isArray(events) || !events.length) return Promise.resolve();
    const p = pageOf(page, label);
    p.last = Date.now();
    const sheets: { hash: string; text: string }[] = [];
    const lines =
      events
        .map((e) => {
          const line = JSON.stringify(e);
          if (!line.includes('"_cssText"') && !line.includes('"isStyle"')) return line;
          sheets.push(...outline(e as { type: number; data: unknown }, p));
          return JSON.stringify(e);
        })
        .join("\n") + "\n";
    for (const s of sheets) p.css.add(s.hash);
    return queued(p, async () => {
      for (const s of sheets) {
        if (!stored.has(s.hash) && !(await files().stat(`${CSS}/${s.hash}.css`))) {
          await files().mkdir(CSS);
          await files().write(`${CSS}/${s.hash}.css`, s.text);
        }
        stored.add(s.hash);
        await files().mkdir(`${RING}/${clean(page)}`);
        await files().append(`${RING}/${clean(page)}/css`, `${s.hash}\n`);
      }
      if (checkout && p.open) {
        await close(p.open.path, p.last);
        p.open = null;
      }
      if (!p.open) {
        const dir = `${RING}/${clean(page)}`;
        await files().mkdir(dir);
        const start = (events[0] as { timestamp?: number }).timestamp ?? Date.now();
        p.open = { path: `${dir}/${start}.jsonl`, start };
      }
      await files().append(p.open.path, lines);
      // Its label beside its segments, for a save after abymed restarts.
      if (p.written !== p.label) {
        await files().write(`${RING}/${clean(page)}/label`, p.label);
        p.written = p.label;
      }
    });
  },

  async save({ page, reason, minutes = CLIP }: { page: string; reason: string; minutes?: number }): Promise<Save | null> {
    const p = pageOf(page);
    const now = Date.now();
    if (reason.startsWith("error")) {
      if (now - p.errorSaved < ERROR_GAP_MS) return null;
      p.errorSaved = now;
    }
    const span = Math.max(1, Math.min(minutes, o.keep));
    return queued(p, async () => {
      const cut = now - span * 60_000;
      const segs = (await segments(page)).filter((s) => s.end === null || s.end >= cut);
      if (!segs.length) return null;
      if (!p.label) p.label = p.written = ((await files().read(`${RING}/${clean(page)}/label`)) ?? "").trim();
      // The name says when, where and why, so a list of saves needs no file opened.
      const why = reason.startsWith("error") ? "error" : "key";
      const base = `${stamp(now)}_${clean(p.label)}_${why}_${clean(page).slice(0, 8)}`;
      const tmp = `${DIR}/.${base}`;
      await files().mkdir(tmp);
      try {
        // The stylesheets the page used, which its events name by hash.
        const used = new Set(((await files().read(`${RING}/${clean(page)}/css`)) ?? "").split("\n").filter(Boolean));
        const css: Record<string, string> = {};
        for (const h of used) {
          const text = await files().read(`${CSS}/${h}.css`);
          if (typeof text === "string") css[h] = text;
        }
        const head: Head = { replay: 1, page, label: p.label, reason, saved: now, minutes: span, css };
        await files().write(`${tmp}/0.jsonl`, `${JSON.stringify(head)}\n`);
        await gzip(["-f", `${tmp}/0.jsonl`]);
        const parts = [`${tmp}/0.jsonl.gz`];
        for (const s of segs) {
          if (s.end !== null) parts.push(s.path);
          else {
            // The open segment as it is now: a copy, gzipped.
            await files().copy(s.path, `${tmp}/open.jsonl`);
            await gzip(["-f", `${tmp}/open.jsonl`]);
            parts.push(`${tmp}/open.jsonl.gz`);
          }
        }
        const bytes = await Promise.all(parts.map(async (f) => ((await files().read(f, { bytes: true })) as Uint8Array | undefined) ?? new Uint8Array()));
        const all = new Uint8Array(bytes.reduce((n, b) => n + b.length, 0));
        let at = 0;
        for (const b of bytes) all.set(b, (at += b.length) - b.length);
        // Joined, they are gzip members end to end, which gunzip reads as one but a browser's
        // DecompressionStream does not: the save is zipped again as one member, once, here.
        const path = `${DIR}/${base}.jsonl.gz`;
        await files().write(`${tmp}/joined.gz`, all);
        const r = await processes().run("/bin/sh", { args: ["-c", 'gzip -dc "$0" | gzip -c > "$1"', `${tmp}/joined.gz`, path], timeoutMs: 300_000 });
        if (r.code !== 0) throw new Error(`the save was not zipped: ${r.stderr.trim()}`);
        const size = (await files().stat(path))?.size ?? 0;
        for (const old of (await list()).slice(SAVES)) await files().remove(old.path);
        abyme.log.info(`saved ${path} (${span} min, ${reason})`);
        return { name: `${base}.jsonl.gz`, path, at: now, size };
      } finally {
        await files().remove(tmp);
      }
    });
  },

  saves: () => list(),

  async read({ name, from = 0, limit = 500, types }: { name: string; from?: number; limit?: number; types?: number[] }): Promise<Read> {
    if (!SAVE.test(name)) throw new Error(`no save named ${name}`);
    const path = `${DIR}/${name}`;
    if (!(await files().stat(path))) throw new Error(`no save named ${name}`);
    const all = parseSave(await gzip(["-dc", path]));
    const events = types?.length ? all.events.filter((e) => types.includes(e.type)) : all.events;
    return {
      name,
      path,
      page: all.page,
      label: all.label,
      reason: all.reason,
      saved: all.saved,
      count: events.length,
      from,
      events: events.slice(from, from + Math.max(1, Math.min(limit, 5000))),
    };
  },
};

// The player fetches a save as it is on disk and unzips it itself.
abyme.http.route("GET", "/api/replay/saves/:name", async (request) => {
  const name = request.params.name ?? "";
  const bytes = SAVE.test(name) ? await files().read(`${DIR}/${name}`, { bytes: true }) : undefined;
  if (!bytes) throw new HttpError(404, "no such save");
  return respond(bytes as Uint8Array, { type: "application/gzip" });
});

// `saves` and `read` are marked `tool`: agents call them as `replay_saves` and `replay_read`.
export default implement(replay, api);
