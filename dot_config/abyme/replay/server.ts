// replay, in abymed: each page's rrweb recording, on disk as it comes, never held here. A page's
// events append to its open segment, `<dir>/ring/<page>/<start>.jsonl`, an event a line; its next
// checkout (rrweb's full snapshot, where a replay can start) closes it, gzipped, as
// `<start>-<end>.jsonl.gz`, and a segment that ended over `keep` minutes ago is deleted. A save is
// its head, then the segments since the checkout it starts at, zipped as one gzip member when it is
// written; the ring itself is never decompressed.
import abyme from "@abyme/plugin";
import mcp from "@abyme/mcp/inventory";
import { HttpError, respond, type Json } from "@abyme/server";
import options from "./options";
import { parseSave, SAVE } from "./format";
import type { Batch, Head, Read, Replay, Save } from "./api";

const o = abyme.with(options).plugin.options;
const DIR = (o.dir || `${abyme.options.stateDir}/replays`).replace(/^~(?=\/|$)/, abyme.env.HOME ?? "~");
const RING = `${DIR}/ring`;
const KEEP_MS = Math.max(1, o.keep) * 60_000;
const CLIP = Math.max(1, Math.min(o.clip, o.keep));
const SAVES = Math.max(1, Math.floor(o.saves));
/** A page that has sent nothing for this long has gone: its open segment is closed. */
const GONE_MS = 3 * 60_000;
const ERROR_GAP_MS = 60_000;

const stamp = (t: number) => new Date(t).toISOString().replace(/\.\d+Z$/, "").replace(/:/g, "-");
const clean = (s: string) => s.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "page";

/** Each page that is recording: its open segment, and the work on its files, in order. */
type Page = { label: string; written: string; open: { path: string; start: number } | null; last: number; errorSaved: number; queue: Promise<unknown> };
const pages = new Map<string, Page>();
const pageOf = (page: string, label = ""): Page => {
  let p = pages.get(page);
  if (!p) pages.set(page, (p = { label, written: "", open: null, last: Date.now(), errorSaved: 0, queue: Promise.resolve() }));
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
  const r = await abyme.process.run("/usr/bin/gzip", { args, timeoutMs: 120_000 });
  if (r.code !== 0) throw new Error(`gzip ${args.join(" ")}: ${r.stderr.trim() || `exited ${r.code}`}`);
  return r.stdout;
}

/** Closes a raw segment: named for its span, gzipped. */
async function close(path: string, end: number) {
  const done = path.replace(/\.jsonl$/, `-${end}.jsonl`);
  await abyme.fs.rename(path, done);
  await gzip(["-f", done]);
}

/** A page's segments on disk, oldest first: closed ones with their span, the open one with none. */
async function segments(page: string) {
  const dir = `${RING}/${clean(page)}`;
  const out: { path: string; start: number; end: number | null }[] = [];
  for (const e of (await abyme.fs.list(dir)) ?? []) {
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
  for (const d of (await abyme.fs.list(RING)) ?? []) {
    const segs = await segments(d.name);
    for (const s of segs) {
      if (s.end === null && !open.has(s.path)) await close(s.path, (await abyme.fs.stat(s.path))?.mtime ?? now);
      else if (s.end !== null && s.end < now - KEEP_MS) await abyme.fs.remove(s.path);
    }
    // Nothing left of a page but its label: the folder goes.
    if (!(await segments(d.name)).length && ![...pages.keys()].some((id) => clean(id) === d.name)) await abyme.fs.remove(`${RING}/${d.name}`);
  }
}
// The half's engine stops with the plugin, and its timers with it.
setInterval(() => void sweep().catch((e: unknown) => abyme.log.warn(`replay sweep: ${e instanceof Error ? e.message : e}`)), 60_000);
void sweep().catch(() => {});

async function list(): Promise<Save[]> {
  const saves: Save[] = [];
  for (const e of (await abyme.fs.list(DIR)) ?? []) {
    if (!SAVE.test(e.name)) continue;
    const path = `${DIR}/${e.name}`;
    const s = await abyme.fs.stat(path);
    if (s) saves.push({ name: e.name, path, at: s.mtime ?? 0, size: s.size });
  }
  return saves.sort((a, b) => b.name.localeCompare(a.name));
}

const api: Replay = {
  push({ page, label, checkout, events }: Batch) {
    if (typeof page !== "string" || !Array.isArray(events) || !events.length) return Promise.resolve();
    const p = pageOf(page, label);
    p.last = Date.now();
    const lines = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
    return queued(p, async () => {
      if (checkout && p.open) {
        await close(p.open.path, p.last);
        p.open = null;
      }
      if (!p.open) {
        const dir = `${RING}/${clean(page)}`;
        await abyme.fs.mkdir(dir);
        const start = (events[0] as { timestamp?: number }).timestamp ?? Date.now();
        p.open = { path: `${dir}/${start}.jsonl`, start };
      }
      await abyme.fs.append(p.open.path, lines);
      // Its label beside its segments, for a save after abymed restarts.
      if (p.written !== p.label) {
        await abyme.fs.write(`${RING}/${clean(page)}/label`, p.label);
        p.written = p.label;
      }
    });
  },

  async save(page: string, reason: string, minutes = CLIP) {
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
      if (!p.label) p.label = p.written = ((await abyme.fs.read(`${RING}/${clean(page)}/label`)) ?? "").trim();
      // The name says when, where and why, so a list of saves needs no file opened.
      const why = reason.startsWith("error") ? "error" : "key";
      const base = `${stamp(now)}_${clean(p.label)}_${why}_${clean(page).slice(0, 8)}`;
      const tmp = `${DIR}/.${base}`;
      await abyme.fs.mkdir(tmp);
      try {
        const head: Head = { replay: 1, page, label: p.label, reason, saved: now, minutes: span };
        await abyme.fs.write(`${tmp}/0.jsonl`, `${JSON.stringify(head)}\n`);
        await gzip(["-f", `${tmp}/0.jsonl`]);
        const parts = [`${tmp}/0.jsonl.gz`];
        for (const s of segs) {
          if (s.end !== null) parts.push(s.path);
          else {
            // The open segment as it is now: a copy, gzipped.
            await abyme.fs.copy(s.path, `${tmp}/open.jsonl`);
            await gzip(["-f", `${tmp}/open.jsonl`]);
            parts.push(`${tmp}/open.jsonl.gz`);
          }
        }
        const bytes = await Promise.all(parts.map(async (f) => ((await abyme.fs.read(f, { bytes: true })) as Uint8Array | undefined) ?? new Uint8Array()));
        const all = new Uint8Array(bytes.reduce((n, b) => n + b.length, 0));
        let at = 0;
        for (const b of bytes) all.set(b, (at += b.length) - b.length);
        // Joined, they are gzip members end to end, which gunzip reads as one but a browser's
        // DecompressionStream does not: the save is zipped again as one member, once, here.
        const path = `${DIR}/${base}.jsonl.gz`;
        await abyme.fs.write(`${tmp}/joined.gz`, all);
        const r = await abyme.process.run("/bin/sh", { args: ["-c", 'gzip -dc "$0" | gzip -c > "$1"', `${tmp}/joined.gz`, path], timeoutMs: 300_000 });
        if (r.code !== 0) throw new Error(`the save was not zipped: ${r.stderr.trim()}`);
        const size = (await abyme.fs.stat(path))?.size ?? 0;
        for (const old of (await list()).slice(SAVES)) await abyme.fs.remove(old.path);
        abyme.log.info(`saved ${path} (${span} min, ${reason})`);
        return { name: `${base}.jsonl.gz`, path, at: now, size };
      } finally {
        await abyme.fs.remove(tmp);
      }
    });
  },

  saves: list,

  async read({ name, from = 0, limit = 500, types }: { name: string; from?: number; limit?: number; types?: number[] }) {
    if (!SAVE.test(name)) throw new Error(`no save named ${name}`);
    const path = `${DIR}/${name}`;
    if (!(await abyme.fs.stat(path))) throw new Error(`no save named ${name}`);
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
  const bytes = SAVE.test(name) ? await abyme.fs.read(`${DIR}/${name}`, { bytes: true }) : undefined;
  if (!bytes) throw new HttpError(404, "no such save");
  return respond(bytes as Uint8Array, { type: "application/gzip" });
});

mcp.tools.add(
  {
    name: "saves",
    description:
      "The operator's UI recordings of abyme pages (rrweb), newest first: name, path, time, size. A save is gzipped JSON lines (`gunzip -c <path>`: its head, then an rrweb event a line), from a full snapshot up to when it was saved: the last 10 minutes by default, up to an hour. One is written when the operator saves one and when a page has an uncaught error.",
    inputSchema: { type: "object", properties: {} },
    readOnly: true,
    call: async () => (await list()) as unknown as Json,
  },
  {
    name: "read",
    description:
      "A recording's rrweb events, with its page, label and why it was saved. rrweb types: 2 full snapshot, 3 incremental (data.source 0 mutation, 1 mousemove, 2 click/mouse, 3 scroll, 4 viewport resize, 5 input), 4 meta, 5 custom (`replay.terminal`: a terminal's output, base64, and its size). Page through with from/limit; filter with types.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "A name from replay_saves." },
        from: { type: "number", description: "First event index (0)." },
        limit: { type: "number", description: "At most this many events (500, up to 5000)." },
        types: { type: "array", items: { type: "number" }, description: "Only events of these rrweb types." },
      },
      required: ["name"],
    },
    readOnly: true,
    call: async (args) => {
      return (await api.read(args as { name: string })) as unknown as Json;
    },
  },
);

export default api satisfies Replay;
