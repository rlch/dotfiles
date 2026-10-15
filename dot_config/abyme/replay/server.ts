// replay, in abymed: each page's rrweb recording, kept in memory as a ring of its last checkouts
// (a checkout is rrweb's full snapshot: a replay can start only at one), and written gzipped to the
// saves folder on a save. Batches stay the JSON text the page sent; nothing parses them until an
// agent reads a save.
import abyme from "@abyme/plugin";
import mcp from "@abyme/mcp/inventory";
import { HttpError, respond, type Json } from "@abyme/server";
import options from "./options";
import type { Batch, Read, Replay, Save } from "./api";

const o = abyme.with(options).plugin.options;
const DIR = (o.dir || `${abyme.options.stateDir}/replays`).replace(/^~(?=\/|$)/, abyme.env.HOME ?? "~");
const KEEP = Math.max(1, Math.floor(o.keep));
const SAVES = Math.max(1, Math.floor(o.saves));
/** A page that has sent nothing for this long has gone (closed, reloaded): its ring is dropped. */
const IDLE_MS = 10 * 60_000;
const ERROR_GAP_MS = 60_000;

type Ring = { label: string; checkouts: string[][]; last: number; errorSaved: number };
const rings = new Map<string, Ring>();

const NAME = /^[\w.-]+\.json\.gz$/;
const stamp = (t: number) => new Date(t).toISOString().replace(/\.\d+Z$/, "").replace(/:/g, "-");
const clean = (s: string) => s.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "page";

function forgetIdle(now: number) {
  for (const [page, ring] of rings) if (now - ring.last > IDLE_MS) rings.delete(page);
}

async function list(): Promise<Save[]> {
  const entries = (await abyme.fs.list(DIR)) ?? [];
  const saves: Save[] = [];
  for (const e of entries) {
    if (!NAME.test(e.name)) continue;
    const path = `${DIR}/${e.name}`;
    const s = await abyme.fs.stat(path);
    if (s) saves.push({ name: e.name, path, at: s.mtime ?? 0, size: s.size });
  }
  return saves.sort((a, b) => b.name.localeCompare(a.name));
}

async function gzip(args: string[]) {
  const r = await abyme.process.run("/usr/bin/gzip", { args, timeoutMs: 120_000 });
  if (r.code !== 0) throw new Error(`gzip ${args.join(" ")}: ${r.stderr.trim() || `exited ${r.code}`}`);
  return r.stdout;
}

const api: Replay = {
  push({ page, label, checkout, events }: Batch) {
    if (typeof page !== "string" || typeof events !== "string") return;
    const body = events.trim().slice(1, -1);
    const now = Date.now();
    forgetIdle(now);
    let ring = rings.get(page);
    if (!ring) rings.set(page, (ring = { label, checkouts: [], last: now, errorSaved: 0 }));
    ring.label = label || ring.label;
    ring.last = now;
    // Before the first checkout reaches abymed there is nothing a replay could start from.
    if (checkout) ring.checkouts.push([]);
    const current = ring.checkouts.at(-1);
    if (!current || !body) return;
    current.push(body);
    while (ring.checkouts.length > KEEP) ring.checkouts.shift();
  },

  async save(page: string, reason: string) {
    const ring = rings.get(page);
    if (!ring?.checkouts.length) return null;
    const now = Date.now();
    if (reason.startsWith("error")) {
      if (now - ring.errorSaved < ERROR_GAP_MS) return null;
      ring.errorSaved = now;
    }
    // The name says when, where and why, so a list of saves needs no file opened.
    const why = reason.startsWith("error") ? "error" : "key";
    const base = `${stamp(now)}_${clean(ring.label)}_${why}_${clean(page).slice(0, 8)}`;
    const json = `${DIR}/${base}.json`;
    const head = JSON.stringify({ page, label: ring.label, reason, saved: now });
    const events = ring.checkouts.flat().join(",");
    await abyme.fs.mkdir(DIR);
    await abyme.fs.write(json, `${head.slice(0, -1)},"events":[${events}]}`);
    await gzip(["-f", json]);
    for (const old of (await list()).slice(SAVES)) await abyme.fs.remove(old.path);
    const path = `${json}.gz`;
    const s = await abyme.fs.stat(path);
    abyme.log.info(`saved ${path} (${reason})`);
    return { name: `${base}.json.gz`, path, at: now, size: s?.size ?? 0 };
  },

  saves: list,

  async read({ name, from = 0, limit = 500, types }: { name: string; from?: number; limit?: number; types?: number[] }) {
    if (!NAME.test(name)) throw new Error(`no save named ${name}`);
    const path = `${DIR}/${name}`;
    if (!(await abyme.fs.stat(path))) throw new Error(`no save named ${name}`);
    const all = JSON.parse(await gzip(["-dc", path])) as Pick<Read, "page" | "label" | "reason" | "saved"> & { events: { type: number }[] };
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
  const bytes = NAME.test(name) ? await abyme.fs.read(`${DIR}/${name}`, { bytes: true }) : undefined;
  if (!bytes) throw new HttpError(404, "no such save");
  return respond(bytes as Uint8Array, { type: "application/gzip" });
});

mcp.tools.add(
  {
    name: "saves",
    description:
      "The operator's UI recordings (rrweb, the last 2-3 minutes of an abyme page), newest first: name, path (gzipped JSON), time, size. One is written when the operator saves one and when a page has an uncaught error.",
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
