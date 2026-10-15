// What client.tsx runs: the page's recording, and the terminals recorded beside it.
import replay from "@abyme/replay";
import layout from "@abyme/layout";
import terminal from "@abyme/terminal/optional";
import herdr from "@abyme/herdr/optional";
import { record, type RecordEvent } from "./vendor/record.js";

/** This page, while it is loaded: a reload is another page. */
export const PAGE = crypto.randomUUID();

/** What a save is named by besides its time: the device and the view the operator is in. */
export function label(): string {
  const form = layout.current.getState().env.formFactor;
  // The view the operator is in, else the one in front in the main frame (focus in a dock).
  const tree = layout.tree();
  const main = tree.views.find((v) => v.key === tree.frames[0]?.active)?.ref.view;
  return `${form}-${layout.active()?.view ?? main ?? "page"}`;
}

/** A moment worth finding in a replay (an error, a save), put in the recording as a custom event
 * the view marks; nothing while the page is not recording. */
export function mark(tag: "replay.error" | "replay.save", payload: Record<string, unknown>) {
  if (recordingNow) record.addCustomEvent(tag, payload);
}
let recordingNow = false;

type Followed = { store: { on(e: "change", fn: () => void): { dispose(): void }; getState(): unknown; retry(): void }; off: { dispose(): void } };

/** How often the page sends what it recorded, and how many events send at once. */
const SEND_MS = 2000;
const SEND_AT = 500;

/**
 * Records the page with rrweb and sends it to abymed every two seconds as it is (the call's own
 * JSON is the one serialisation; nothing here stringifies), each checkout (a full snapshot)
 * starting a batch of its own and going at once. A terminal draws on a canvas in a worker, which
 * rrweb records blank: each visible one's output and size go in beside it as custom events
 * (`replay.terminal`), its whole screen again at each checkout so a replay from there has it.
 * Answers how to stop it, and to send what is pending now (before a save).
 */
export function recording(o: { checkout: number; terminals: boolean }): { stop(): void; flush(): void } {
  let pending: RecordEvent[] = [];
  let checkout = false;
  const flush = () => {
    if (!pending.length) return;
    void replay.server.push({ page: PAGE, label: label(), checkout, events: pending });
    pending = [];
    checkout = false;
  };
  const followed = new Map<string, Followed>();
  const stopRecord = record({
    emit(event) {
      // A Meta event begins every full snapshot, the first and each checkout.
      if (event.type === 4) {
        flush();
        checkout = true;
        for (const t of followed.values()) t.store.retry();
      }
      pending.push(event);
      // A full snapshot is the biggest event there is: it goes now, not held two seconds.
      if (event.type === 2 || pending.length >= SEND_AT) flush();
    },
    checkoutEveryNms: o.checkout,
    // Unmasked, but a password's value is recorded as asterisks. (A blockSelector would check
    // every mutation's ancestors against it: too dear on a streaming page.)
    maskAllInputs: false,
    maskInputOptions: { password: true },
    sampling: { scroll: 100, input: "last" },
    recordCanvas: false,
    collectFonts: false,
  });
  recordingNow = true;
  const timer = setInterval(flush, SEND_MS);

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
      const store = (source === "herdr" ? herdr?.server.pane(id) : terminal?.server.screen(id)) as Followed["store"] | undefined;
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
    flush();
  };
  return { stop, flush };
}
