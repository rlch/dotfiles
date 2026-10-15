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
  return `${form}-${layout.active()?.view ?? "none"}`;
}

type Followed = { store: { on(e: "change", fn: () => void): { dispose(): void }; getState(): unknown; retry(): void }; off: { dispose(): void } };

/**
 * Records the page with rrweb and sends it to abymed a second at a time, each checkout (a full
 * snapshot) starting a batch of its own. A terminal draws on a canvas in a worker, which rrweb
 * records blank: each visible one's output and size go in beside it as custom events
 * (`replay.terminal`), its whole screen again at each checkout so a replay from there has it.
 * Answers how to stop it, and to send what is pending now (before a save).
 */
export function recording(o: { checkout: number; terminals: boolean }): { stop(): void; flush(): void } {
  let pending: RecordEvent[] = [];
  let checkout = false;
  const flush = () => {
    if (!pending.length) return;
    replay.server.push({ page: PAGE, label: label(), checkout, events: JSON.stringify(pending) });
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
    },
    checkoutEveryNms: o.checkout,
    maskAllInputs: false,
    sampling: { mousemove: 50, scroll: 100, input: "last" },
    recordCanvas: false,
    collectFonts: false,
  });
  const timer = setInterval(flush, 1000);

  /** Follows each terminal on screen, and lets go of each that is not. */
  const reconcile = () => {
    const want = new Map<string, { source: string; id: string }>();
    for (const v of layout.tree().views) {
      if (!v.visible || v.ref.view !== "terminal") continue;
      const source = v.ref.params?.source || "shell";
      const id = v.ref.params?.id;
      if (id) want.set(`${source}/${id}`, { source, id });
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
  if (o.terminals) reconcile();

  const stop = () => {
    offLayout?.dispose();
    for (const t of followed.values()) t.off.dispose();
    followed.clear();
    stopRecord?.();
    clearInterval(timer);
    flush();
  };
  return { stop, flush };
}
