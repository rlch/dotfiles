// What a save holds, as the view lists and marks it: errors, save points, full snapshots, bursts
// of DOM mutations, clicks, resizes and each terminal's output. Pure: events in, moments out.

/** An rrweb event as saved. */
export type Event = { type: number; timestamp: number; data: any };

export type Kind = "error" | "save" | "snapshot" | "mutations" | "terminal" | "click" | "resize" | "input";

export type Moment = {
  kind: Kind;
  /** Milliseconds from the save's first event. */
  at: number;
  /** Its first event's index in the save, for replay_read's `from`. */
  index: number;
  title: string;
  detail?: string;
};

/** Why a save was written, as its name says. */
export type Why = "key" | "error" | "stall" | "agent";
const WHYS: Why[] = ["key", "error", "stall", "agent"];

/** A save's file name: `<UTC time>_<device>-<view>_<why>_<page>.json.gz` (older saves have no why). */
export function parseName(name: string): { time: number; device: string; view: string; why: Why | null } {
  const parts = name.replace(/\.jsonl?\.gz$/, "").split("_");
  const [d, t] = (parts[0] ?? "").split("T");
  const time = Date.parse(`${d}T${(t ?? "").replace(/-/g, ":")}Z`);
  const label = parts[1] ?? "";
  const cut = label.indexOf("-");
  const why = parts.length > 3 && WHYS.includes(parts[2] as Why) ? (parts[2] as Why) : null;
  return { time, device: cut < 0 ? label : label.slice(0, cut), view: cut < 0 ? "" : label.slice(cut + 1), why };
}

/** A save point's title, by why it was written (its name's why; an agent's reason is its own words). */
export const savedFor = (why: Why | null) =>
  why === "key" ? "Saved with the key" : why === "error" ? "Saved for an error" : why === "stall" ? "Saved for a stall" : why === "agent" ? "Saved for an agent" : "Saved";
/** Why the page's own save mark was written: a page saves with the key, or for an error or a stall. */
export const pageWhy = (reason: string): Why | null => (reason === "asked" ? "key" : reason.startsWith("error") ? "error" : reason.startsWith("stall") ? "stall" : null);

export const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

// A terminal's escapes and control bytes, to show what it printed as text.
const ESCAPES = /\x1b\[[0-?]*[ -/]*[@-~]|\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b[@-_]|[\x00-\x08\x0b-\x1f\x7f]/g;
const decoder = new TextDecoder();
function printed(base64: string): { bytes: number; text: string } {
  try {
    const raw = atob(base64);
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    return { bytes: bytes.length, text: decoder.decode(bytes).replace(ESCAPES, "") };
  } catch {
    return { bytes: 0, text: "" };
  }
}

/** Mutations or output this close together are one burst, up to this long. */
const GAP = 300;
const LONGEST = 1500;

export function moments(events: readonly Event[], saved?: { at: number; reason: string; why: Why | null }): Moment[] {
  const t0 = events[0]?.timestamp ?? 0;
  const out: Moment[] = [];
  let burst: (Moment & { last: number; n: number; adds: number; removes: number; attrs: number; texts: number }) | null = null;
  const terminals = new Map<string, Moment & { last: number; bytes: number; text: string; resets: number }>();
  let typing: (Moment & { last: number; n: number }) | null = null;

  const endBurst = () => {
    if (!burst) return;
    const parts = [burst.adds && `${burst.adds} added`, burst.removes && `${burst.removes} removed`, burst.attrs && `${burst.attrs} attributes`, burst.texts && `${burst.texts} texts`].filter(Boolean);
    burst.title = `${burst.n} mutation${burst.n === 1 ? "" : "s"}`;
    burst.detail = parts.join(", ");
    burst = null;
  };
  const endTerminal = (id: string) => {
    const t = terminals.get(id);
    if (!t) return;
    t.title = `Terminal ${id}: ${kb(t.bytes)}${t.resets ? ", redrawn" : ""}`;
    t.detail = t.text.replace(/\s+/g, " ").trim().slice(0, 160) || undefined;
    terminals.delete(id);
  };

  events.forEach((e, index) => {
    const at = e.timestamp - t0;
    if (burst && (at - burst.last > GAP || at - burst.at > LONGEST)) endBurst();
    for (const [id, t] of terminals) if (at - t.last > GAP || at - t.at > LONGEST) endTerminal(id);
    if (e.type === 2) out.push({ kind: "snapshot", at, index, title: "Full snapshot" });
    else if (e.type === 5) {
      const tag = e.data?.tag;
      const p = e.data?.payload ?? {};
      if (tag === "replay.error") out.push({ kind: "error", at, index, title: String(p.message ?? "Error"), detail: p.stack });
      else if (tag === "replay.save") out.push({ kind: "save", at, index, title: savedFor(pageWhy(String(p.reason ?? ""))), detail: p.reason === "asked" ? undefined : String(p.reason ?? "") });
      else if (tag === "replay.terminal" && (p.data || p.at)) {
        const id = String(p.id ?? "?");
        let t = terminals.get(id);
        if (!t) {
          t = { kind: "terminal", at, index, title: "", last: at, bytes: 0, text: "", resets: 0 };
          terminals.set(id, t);
          out.push(t);
        }
        t.last = at;
        if (p.reset) t.resets++;
        if (p.data) {
          const { bytes, text } = printed(p.data);
          t.bytes += bytes;
          if (t.text.length < 400) t.text += text;
        }
      }
    } else if (e.type === 3) {
      const source = e.data?.source;
      if (source === 0) {
        if (!burst) {
          burst = { kind: "mutations", at, index, title: "", last: at, n: 0, adds: 0, removes: 0, attrs: 0, texts: 0 };
          out.push(burst);
        }
        burst.last = at;
        burst.n++;
        burst.adds += e.data.adds?.length ?? 0;
        burst.removes += e.data.removes?.length ?? 0;
        burst.attrs += e.data.attributes?.length ?? 0;
        burst.texts += e.data.texts?.length ?? 0;
      } else if (source === 2 && e.data.type === 2) out.push({ kind: "click", at, index, title: "Click", detail: `at ${Math.round(e.data.x)}, ${Math.round(e.data.y)}` });
      else if (source === 4) out.push({ kind: "resize", at, index, title: `Resized to ${e.data.width}×${e.data.height}` });
      else if (source === 5) {
        if (typing && at - typing.last <= 1000) {
          typing.last = at;
          typing.n++;
          typing.title = `Typed (${typing.n} changes)`;
        } else {
          typing = { kind: "input", at, index, title: "Typed", last: at, n: 1 };
          out.push(typing);
        }
      }
    }
  });
  endBurst();
  for (const id of [...terminals.keys()]) endTerminal(id);
  // A save from before saves marked themselves: its moment is the file's.
  if (saved && !out.some((m) => m.kind === "save"))
    out.push({ kind: "save", at: saved.at - t0, index: events.length - 1, title: savedFor(saved.why ?? pageWhy(saved.reason)), detail: saved.reason === "asked" ? undefined : saved.reason });
  return out.map(({ kind, at, index, title, detail }) => ({ kind, at, index, title, detail }));
}
