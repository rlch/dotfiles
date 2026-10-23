// The recordings abymed holds, in memory: pure, importing nothing of abyme, so ring.test.ts runs it
// with node alone. Each page's recording is segments, each starting at a checkout (rrweb's full
// snapshot, where a replay can start) and closed by the next one. A segment is its events'
// JSON lines as they came. A stylesheet rrweb inlines is held once, by its hash, with a count of
// the segments that name it; it goes with the last of them. Sizes are in characters of JSON, which
// is what a recording costs abymed's engine, near enough.

/** A segment: `end` is null while it is a page's open one. */
export type Segment = { start: number; end: number | null; chunks: string[]; size: number; css: Set<string> };
export type Page = { label: string; segments: Segment[]; last: number };
/** What a save takes: the page's label, its segments since the cut, as one text, and their stylesheets. */
export type Taken = { label: string; text: string; css: Record<string, string> };

/** A page that has sent nothing for this long has gone: its open segment is closed. */
export const GONE_MS = 3 * 60_000;

export class Ring {
  readonly pages = new Map<string, Page>();
  readonly css = new Map<string, { text: string; uses: number }>();
  size = 0;
  readonly o: { keepMs: number; memory: number };

  constructor(o: { keepMs: number; memory: number }) {
    this.o = o;
  }

  /** A page's next batch, its events as JSON lines: `checkout` closes the open segment and starts one
   * at `at` (its Meta event's time). `sheets`: every stylesheet the lines name, by hash. */
  append(page: string, label: string, checkout: boolean, lines: string[], sheets: { hash: string; text: string }[], at: number, now: number) {
    if (!lines.length) return;
    let p = this.pages.get(page);
    if (!p) this.pages.set(page, (p = { label, segments: [], last: now }));
    if (label) p.label = label;
    p.last = now;
    let open = p.segments.at(-1);
    if (open && open.end === null && checkout) open.end = at;
    if (!open || open.end !== null) {
      // Events before a page's first checkout here (abymed restarted under it) start no replay: dropped.
      if (!checkout) return;
      p.segments.push((open = { start: at, end: null, chunks: [], size: 0, css: new Set() }));
    }
    const text = lines.join("\n") + "\n";
    open.chunks.push(text);
    open.size += text.length;
    this.size += text.length;
    for (const s of sheets) {
      if (open.css.has(s.hash)) continue;
      open.css.add(s.hash);
      const held = this.css.get(s.hash);
      if (held) held.uses++;
      else {
        this.css.set(s.hash, { text: s.text, uses: 1 });
        this.size += s.text.length;
      }
    }
    this.cap();
  }

  /** Closes what a page gone `GONE_MS` left open, drops what ended over `keep` ago, and a page with
   * nothing left. */
  sweep(now: number) {
    for (const [id, p] of this.pages) {
      const open = p.segments.at(-1);
      if (open && open.end === null && now - p.last > GONE_MS) open.end = p.last;
      while (p.segments[0] && p.segments[0].end !== null && p.segments[0].end < now - this.o.keepMs) this.drop(p, 0);
      if (!p.segments.length) this.pages.delete(id);
    }
    this.cap();
  }

  /** While past `memory`: the oldest closed segment of any page goes, never a page's last. */
  private cap() {
    while (this.size > this.o.memory) {
      // A page's oldest is its first; one with only its last has none to give.
      let oldest: Page | null = null;
      for (const p of this.pages.values()) if (p.segments.length > 1 && (!oldest || p.segments[0]!.start < oldest.segments[0]!.start)) oldest = p;
      if (!oldest) return;
      this.drop(oldest, 0);
    }
  }

  private drop(p: Page, at: number) {
    const [s] = p.segments.splice(at, 1);
    if (!s) return;
    this.size -= s.size;
    for (const h of s.css) {
      const held = this.css.get(h);
      if (!held || --held.uses > 0) continue;
      this.css.delete(h);
      this.size -= held.text.length;
    }
  }

  /** A page's recording from the checkout at or before `cut`, or null when it holds nothing. */
  take(page: string, cut: number): Taken | null {
    const p = this.pages.get(page);
    const segs = p?.segments.filter((s) => s.end === null || s.end >= cut) ?? [];
    if (!p || !segs.length) return null;
    const css: Record<string, string> = {};
    for (const s of segs) for (const h of s.css) css[h] = this.css.get(h)!.text;
    return { label: p.label, text: segs.map((s) => s.chunks.join("")).join(""), css };
  }
}
