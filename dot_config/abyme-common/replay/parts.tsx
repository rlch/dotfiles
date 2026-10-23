// What client.tsx runs: the page's recording, and the terminals recorded beside it. rrweb (patched,
// vendor/README.md) serialises what changed in slices after paint; checkouts and sends wait for idle.
import replay from "@abyme/replay";
import layout from "@abyme/layout";
import terminal from "@abyme/terminal/optional";
import { record, type RecordEvent } from "./vendor/record.js";

/** This page, while it is loaded: a reload is another page. */
export const PAGE = crypto.randomUUID();

/** What a save is named by besides its time: the device and the view the operator is in. */
export function label(): string {
  const form = layout.current.getState().env.formFactor;
  // The view the operator is in, else the one active in the main window (focus in a dock).
  const tree = layout.tree();
  const main = tree.views?.find((v) => v.key === tree.windows?.[0]?.active)?.ref.view;
  return `${form}-${layout.active()?.view ?? main ?? "page"}`;
}

/** A moment worth finding in a replay (an error, a save), put in the recording as a custom event
 * the view marks; nothing while the page is not recording. */
export function mark(tag: "replay.error" | "replay.save" | "replay.stall" | "replay.checkout", payload: Record<string, unknown>) {
  if (recordingNow) record.addCustomEvent(tag, payload);
}
let recordingNow = false;

type Followed = { store: { on(e: "change", fn: () => void): { dispose(): void }; getState(): unknown; retry(): void }; off: { dispose(): void } };

/** How often the page sends what it recorded, how many events a batch holds, and how long the
 * operator must leave the page alone before a checkout. */
const SEND_MS = 2000;
const SEND_AT = 500;
const QUIET_MS = 2000;
/** Stalls saved at most this often by one page. */
const STALL_GAP_MS = 60_000;

/** `f` when the page is idle (or after `timeout` ms); a timer where the browser has no idle callback (WebKit). */
const idle = (f: () => void, timeout: number) => (typeof requestIdleCallback === "function" ? requestIdleCallback(f, { timeout }) : setTimeout(f, 0));

/**
 * Records the page with rrweb and sends it to abymed at idle, asked every two seconds (the call's
 * own JSON is the one serialisation; nothing here stringifies), each checkout (a full snapshot)
 * starting a batch of its own. A checkout is taken once `checkout` ms have passed and the operator
 * has not pressed a key or a pointer for 2 s, at idle; it marks its cost (`replay.checkout`, `{ ms }`).
 * The two-second timer also measures its own lateness: late by `stall` ms while the page was
 * visible, or a long animation frame that long where the browser reports them, is a stall
 * (`onStall`). A terminal draws on a canvas in a worker, which rrweb records blank: each visible
 * one's output and size go in beside it as custom events (`replay.terminal`), its whole screen
 * again at each checkout so a replay from there has it. Answers how to stop it, and to send what
 * is pending now (before a save).
 */
export function recording(o: { checkout: number; terminals: boolean; stall: number; onStall(ms: number): void }): { stop(): void; flush(): void } {
  let batches: { checkout: boolean; events: RecordEvent[] }[] = [];
  const flush = () => {
    const out = batches.filter((b) => b.events.length);
    batches = [];
    if (!out.length) return;
    const name = label();
    // A batch abymed refuses is lost, not an error of the page's (which would save a replay of it).
    for (const b of out) void replay.server.push({ page: PAGE, label: name, ...b }).catch(() => {});
  };
  let asked = false;
  const send = () => {
    if (asked) return;
    asked = true;
    idle(() => {
      asked = false;
      flush();
    }, SEND_MS);
  };
  const followed = new Map<string, Followed>();
  const stopRecord = record({
    emit(event) {
      // A Meta event begins every full snapshot, the first and each checkout.
      if (event.type === 4) {
        batches.push({ checkout: true, events: [] });
        for (const t of followed.values()) t.store.retry();
      }
      let b = batches.at(-1);
      if (!b || b.events.length >= SEND_AT) batches.push((b = { checkout: false, events: [] }));
      b.events.push(event);
      if (b.events.length >= SEND_AT) send();
    },
    // Unmasked, but a password's value is recorded as asterisks. (A blockSelector would check
    // every mutation's ancestors against it: too dear on a streaming page.)
    maskAllInputs: false,
    maskInputOptions: { password: true },
    sampling: { mousemove: 100, scroll: 100, input: "last" },
    recordCanvas: false,
    collectFonts: false,
  });
  recordingNow = true;

  // Checkouts wait for the operator to leave the page alone.
  let input = 0;
  let checked = performance.now();
  const touched = () => void (input = performance.now());
  window.addEventListener("pointerdown", touched, { capture: true, passive: true });
  window.addEventListener("keydown", touched, { capture: true, passive: true });
  let checkingOut = false;
  /** The last checkout's span: its own long task is replay's, not the page's stall. */
  let snap = { start: 0, end: 0 };
  const checkout = () => {
    checkingOut = false;
    if (!recordingNow || performance.now() - input < QUIET_MS) return;
    const t0 = performance.now();
    record.takeFullSnapshot(true);
    snap = { start: t0, end: performance.now() };
    const ms = Math.round((snap.end - t0) * 10) / 10;
    checked = snap.end;
    mark("replay.checkout", { ms });
    send();
  };

  // Stalls: the timer's lateness while the page was visible throughout, and long animation frames.
  let lastStall = -Infinity;
  /** What of the span from `start` to `end` was not replay's own checkout. */
  const theirs = (start: number, end: number) => end - start - Math.max(0, Math.min(end, snap.end) - Math.max(start, snap.start));
  const stalled = (ms: number, via: "timer" | "frame") => {
    if (ms < o.stall || performance.now() - lastStall < STALL_GAP_MS) return;
    lastStall = performance.now();
    mark("replay.stall", { ms: Math.round(ms), via });
    o.onStall(Math.round(ms));
  };
  let hidden = document.visibilityState !== "visible";
  const seen = () => void (hidden ||= document.visibilityState !== "visible");
  document.addEventListener("visibilitychange", seen);
  let loaf: PerformanceObserver | null = null;
  if (PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")) {
    loaf = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (e.duration >= o.stall) stalled(theirs(e.startTime, e.startTime + e.duration), "frame");
    });
    loaf.observe({ type: "long-animation-frame", buffered: false });
  }
  let tick = performance.now();
  const timer = setInterval(() => {
    const now = performance.now();
    const late = theirs(tick, now) - SEND_MS;
    tick = now;
    if (!hidden) stalled(late, "timer");
    hidden = document.visibilityState !== "visible";
    send();
    if (!checkingOut && now - checked >= o.checkout && now - input >= QUIET_MS) {
      checkingOut = true;
      idle(checkout, SEND_MS);
    }
  }, SEND_MS);

  // The shells abymed runs, oldest first: what a terminal view asked for nothing shows.
  const shells = o.terminals ? (terminal?.server.shells() as Followed["store"] | undefined) : undefined;
  /** Follows each terminal on screen, and lets go of each that is not. */
  const reconcile = () => {
    const want = new Map<string, { source: string; id: string }>();
    const tree = layout.tree();
    const views = tree.views.filter((v) => v.ref.view === "terminal");
    const inTabs = new Set(views.map((v) => v.ref.params?.id).filter(Boolean));
    // What a terminal asked for nothing shows, as the terminal's dock picks (terminal/Docked.tsx):
    // the newest shell not open in a tab. A dock says which view it shows, never its params.
    const free = () => ((shells?.getState() ?? []) as { id: string }[]).filter((s) => !inTabs.has(s.id)).at(-1)?.id;
    for (const v of views) {
      if (!v.visible) continue;
      const source = v.ref.params?.source || "shell";
      const id = v.ref.params?.id ?? free();
      if (id) want.set(`${source}/${id}`, { source, id });
    }
    for (const d of tree.docks) {
      const id = d.shown && d.showing === "terminal" ? free() : undefined;
      if (id) want.set(`shell/${id}`, { source: "shell", id });
    }
    for (const [key, t] of followed)
      if (!want.has(key)) {
        t.off.dispose();
        followed.delete(key);
      }
    for (const [key, { source, id }] of want) {
      if (followed.has(key)) continue;
      const store = terminal?.server.screen({ id }) as Followed["store"] | undefined;
      if (!store) continue;
      const off = store.on("change", () => {
        const now = store.getState();
        if (now && Object.keys(now).length) record.addCustomEvent("replay.terminal", { source, id, ...(now as object) });
      });
      followed.set(key, { store, off });
    }
  };
  const offLayout = o.terminals ? layout.on("change", reconcile) : null;
  const offShells = shells?.on("change", reconcile);
  if (o.terminals) reconcile();

  const stop = () => {
    offLayout?.dispose();
    offShells?.dispose();
    for (const t of followed.values()) t.off.dispose();
    followed.clear();
    recordingNow = false;
    stopRecord?.();
    clearInterval(timer);
    loaf?.disconnect();
    document.removeEventListener("visibilitychange", seen);
    window.removeEventListener("pointerdown", touched, { capture: true });
    window.removeEventListener("keydown", touched, { capture: true });
    flush();
  };
  return { stop, flush };
}
