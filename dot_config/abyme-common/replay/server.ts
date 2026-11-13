// replay, in abymed: each page's rrweb recording, held in memory (ring.ts) and written to disk only
// as a save. A page's batches append to its open segment; its next checkout (rrweb's full
// snapshot, where a replay can start) closes it, and a segment that ended over `keep` minutes ago,
// or the oldest closed one while all pages pass `memory`, is dropped. A save is its head, then the
// segments since the checkout it starts at, gzipped once as it is written. A stylesheet rrweb
// inlines (abyme's own, the same in every full snapshot) is held once and the event holds
// `replay-css:<sha256>` in its place; a save's head carries the ones its events name, so a save is
// whole on its own (format.ts puts them back). abymed restarting starts every recording empty.
import abyme from "@abyme/cell";
import { implement } from "@abyme/schema";
import { HttpError, respond } from "@abyme/server";
import fs from "@abyme/fs";
import process from "@abyme/process";
import { LOCAL } from "@abyme/machines/label";
import options from "./options";
import { parseSave, SAVE } from "./format";
import { Ring } from "./ring.ts";
import { replay, type Batch, type Head, type Read, type Save } from "./api.server.ts";

const o = abyme.with(options).cell.options;
const DIR = (o.dir || `${fs.stateDir}/replays`).replace(/^~(?=\/|$)/, fs.home);
/** A stylesheet shorter than this stays where it is. */
const CSS_AT = 1024;
const KEEP = Math.max(1, o.keep);
const CLIP = Math.max(0.25, Math.min(o.clip, KEEP));
const SAVES = Math.max(1, Math.floor(o.saves));
/** Error, stall and switch saves of one page, at most one in this long. */
const GAP_MS = 60_000;
/** How long an agent's save waits for the pages to send what they hold. */
const FLUSH_MS = 1000;

const ring = new Ring({ keepMs: KEEP * 60_000, memory: Math.max(1024 * 1024, o.memory) });
/** Bumped to ask every page to send what it holds now (an agent's save). */
const asked = abyme.value(0);
/** When each page was last saved for an error or a stall. */
const gapped = new Map<string, number>();

// It runs on every machine (abymed refuses a half that imports a capability only as optional), but
// its functions are not marked `machine`, so pages record to and save on the control plane, the
// operator's Mac, as before; a node's copy keeps nothing.
/** The control plane's files, where saves are. */
const files = () => fs;
/** The control plane's processes, to run gzip. */
const processes = () => process;

async function gzip(args: string[]) {
  const r = await processes().run("/usr/bin/gzip", { args, timeoutMs: 120_000 });
  if (r.code !== 0) throw new Error(`gzip ${args.join(" ")}: ${r.stderr.trim() || `exited ${r.code}`}`);
  return r.stdout;
}

const stamp = (t: number) => new Date(t).toISOString().replace(/\.\d+Z$/, "").replace(/:/g, "-");
const clean = (s: string) => s.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "page";

type Node = { type?: number; isStyle?: boolean; textContent?: string; attributes?: Record<string, unknown>; childNodes?: Node[] };

/** Takes each big stylesheet out of an event (a full snapshot's, or a link or style a mutation
 * adds), leaving `replay-css:<sha256>`: answers every sheet it named. */
function outline(e: { type: number; data: any }): { hash: string; text: string }[] {
  const found: { hash: string; text: string }[] = [];
  const ref = (text: string) => {
    const hash = abyme.crypto.hash("sha256", text);
    found.push({ hash, text });
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

// One timer, for the ring's next sweep, set again whenever it changes; none while it holds nothing.
// Set after setup, it keeps the half awake while a recording is held, which only memory holds; it
// ends with the run, as a half's timers do.
let timer: ReturnType<typeof setTimeout> | undefined;
const swept = (sweep = true) => {
  clearTimeout(timer);
  timer = undefined;
  if (sweep) ring.sweep(Date.now());
  const at = ring.next();
  if (at !== null) timer = setTimeout(swept, Math.max(0, at - Date.now()));
};
// What an earlier version kept on disk as it recorded (its ring and its stylesheets) goes once.
if (abyme.machine === LOCAL) void Promise.all([fs.remove(`${DIR}/ring`), fs.remove(`${DIR}/css`)]).catch(() => {});

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

/** Why a save was written, as its name says. */
const why = (reason: string) => (reason.startsWith("error") ? "error" : reason.startsWith("stall") ? "stall" : reason.startsWith("switch") ? "switch" : reason.startsWith("agent") ? "agent" : "key");
/** The saves of one page that share its once-a-minute limit. */
const gappedWhy = (w: string) => w === "error" || w === "stall" || w === "switch";

/** Writes one page's save: null when it holds nothing, or saved for an error, a stall or a switch under a minute ago. */
async function saveOne(page: string, reason: string, minutes: number, w = why(reason)): Promise<Save | null> {
  const now = Date.now();
  if (gappedWhy(w) && now - (gapped.get(page) ?? 0) < GAP_MS) return null;
  const span = Math.max(0.25, Math.min(minutes, KEEP));
  const taken = ring.take(page, now - span * 60_000);
  if (!taken) return null;
  if (gappedWhy(w)) gapped.set(page, now);
  // The name says when, where and why, so a list of saves needs no file opened.
  const base = `${stamp(now)}_${clean(taken.label)}_${w}_${clean(page).slice(0, 8)}`;
  const path = `${DIR}/${base}.jsonl.gz`;
  const head: Head = { replay: 1, page, label: taken.label, reason, saved: now, minutes: span, css: taken.css };
  await files().mkdir(DIR);
  // Zipped once, by gzip reading it on its stdin, into a hidden name renamed when whole.
  const tmp = `${DIR}/.${base}.part`;
  const r = await processes().run("/bin/sh", { args: ["-c", 'gzip -c > "$0"', tmp], stdin: `${JSON.stringify(head)}\n${taken.text}`, timeoutMs: 300_000 });
  if (r.code !== 0) {
    await files().remove(tmp).catch(() => {});
    throw new Error(`the save was not zipped: ${r.stderr.trim() || `exited ${r.code}`}`);
  }
  await files().rename(tmp, path);
  const size = (await files().stat(path))?.size ?? 0;
  for (const old of (await list()).slice(SAVES)) await files().remove(old.path);
  abyme.log.info(`saved ${path} (${span} min, ${reason})`);
  return { name: `${base}.jsonl.gz`, path, at: now, size };
}

const api = {
  asked: () => asked,

  push({ page, label, checkout, events }: Batch) {
    if (!events.length) return;
    const sheets: { hash: string; text: string }[] = [];
    const lines = events.map((e) => {
      const line = JSON.stringify(e);
      if (!line.includes('"_cssText"') && !line.includes('"isStyle"')) return line;
      const found = outline(e as { type: number; data: unknown });
      if (!found.length) return line;
      sheets.push(...found);
      return JSON.stringify(e);
    });
    const at = (events[0] as { timestamp?: number }).timestamp ?? Date.now();
    ring.append(page, label, checkout, lines, sheets, at, Date.now());
    swept(false);
  },

  async save({ page, reason, minutes = CLIP }: { page?: string; reason: string; minutes?: number }): Promise<Save | Save[] | null> {
    if (page !== undefined) return saveOne(page, reason, minutes);
    // Every page: each sends what it holds first.
    asked.set((n) => n + 1);
    await new Promise((r) => setTimeout(r, FLUSH_MS));
    const out: Save[] = [];
    for (const id of [...ring.pages.keys()]) {
      // One page's save failing (gzip) costs that page alone.
      const s = await saveOne(id, reason, minutes, "agent").catch((e: unknown) => {
        abyme.log.warn(`replay: page ${id} not saved: ${e instanceof Error ? e.message : e}`);
        return null;
      });
      if (s) out.push(s);
    }
    return out;
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
