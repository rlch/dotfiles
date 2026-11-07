// The chat's scroll, beside rrweb's recording (parts.tsx starts it), for a drift between what a
// chat paints and where its DOM says it is (abyme's openspec selection-offset): rrweb keeps a
// scroller's scrollTop alone, sampled, and never the paint. Custom events, each in the recording as
// the others are:
//   replay.wheel        the Mac's wheel events over this window, from abyme.app (crates/app, src/page.m):
//                       `{ wheels: [{ seq, at, t, x, y, dx, dy, phase, momentum, precise }] }`, a batch
//                       each send, `at` in ms since 1970 as the app took it, `t` the event's own
//                       clock in ms (their spacing), `x`, `y` in the window's points from its top left
//   replay.scrollWrite  each scroll the page sets on a chat's scroller, and who set it:
//                       `{ chat, via, from, to, height, client, caller }`, `via` scrollTop, scrollTo or
//                       scrollBy (virtua's scrollTo and scrollToIndex set scrollTop), `caller` the stack's
//                       first frames past this file
//   replay.scroll       a chat's scroll, once a frame while it moves: `{ chat, top, height, client }`
//   replay.resize       the window (`{ kind: "window", w, h, dpr }`) or a chat's scroller
//                       (`{ kind: "pane", chat, w, h, top, height, client }`)
//   replay.paint        at a pointerdown in a chat, where abyme.app's web view has scrolled what it
//                       paints there beside the DOM: `{ chat, x, y, top, height, client, rect, row,
//                       after, ms, zoom, hosted, layers: [{ x, y, w, h, sx, sy, class }] }`, `top` the
//                       DOM's scrollTop at the pointerdown, `after` at the answer, `sy` a scrolled
//                       layer's offset as WebKit's scrolling tree set it (what shows); in a browser,
//                       the DOM's alone
// A chat is named by its agent and a number its scroller is given here.

type Mark = (tag: string, payload: Record<string, unknown>) => void;
type Invoke = <T>(command: string, args: Record<string, unknown>) => Promise<T>;

/** abyme.app's bridge (crates/app), none in a browser or the phone shell (also Tauri's). */
function app(): Invoke | null {
  const w = window as Window & { __TAURI_INTERNALS__?: { invoke: Invoke }; abymeComputers?: string };
  const t = w.__TAURI_INTERNALS__;
  return t && w.abymeComputers === undefined ? t.invoke.bind(t) : null;
}

/** A chat's scroller: virtua's list, the one child of `[data-transcript]` (chat/Chat.tsx). */
const isChat = (el: Element | null): el is HTMLElement => !!el && el.parentElement?.hasAttribute("data-transcript") === true;
const scrollerAt = (t: EventTarget | null): HTMLElement | null => {
  const box = t instanceof Element ? t.closest("[data-transcript]") : null;
  const sc = box?.firstElementChild ?? null;
  return isChat(sc) ? sc : null;
};

const names = new WeakMap<Element, string>();
let named = 0;
const nameOf = (el: Element) => {
  let n = names.get(el);
  if (!n) names.set(el, (n = `${el.closest("[data-chat-agent]")?.getAttribute("data-chat-agent") ?? "chat"}#${++named}`));
  return n;
};

/** The stack's frames past this file, each `fn file:line:col`. */
function caller(): string[] {
  // WebKit's lines are `fn@url:line:col`, Chromium's `at fn (url:line:col)` under an `Error` line.
  const frames = (new Error().stack ?? "").split("\n").map((l) => l.trim().replace(/^at /, "").replace(/\(?(?:https?|file):\/\/[^)\s]*\/([^/)\s]+)\)?$/, " $1").replace("@", " ").replace(/\s+/g, " ").trim());
  return frames.filter((f) => f && f !== "Error" && !/(^| )scroll\.ts:/.test(f)).slice(0, 6);
}

const round = (x: number) => Math.round(x * 10) / 10;
const sizes = (el: HTMLElement) => ({ top: round(el.scrollTop), height: el.scrollHeight, client: el.clientHeight });

/** Starts it: `tick` runs at each send (the app's wheels asked then), `stop` undoes it all. */
export function scrolls(mark: Mark): { tick(): void; stop(): void } {
  const invoke = app();
  // An app from before these commands refuses them: asked once, then no more.
  let paints = !!invoke;
  const offs: (() => void)[] = [];

  // Writes: Element's own scrollTop setter, scrollTo and scrollBy, seen for a chat's scroller alone.
  const proto = Element.prototype;
  const top = Object.getOwnPropertyDescriptor(proto, "scrollTop");
  if (top?.set && top.get) {
    const { get, set } = top;
    Object.defineProperty(proto, "scrollTop", {
      ...top,
      set(this: Element, v: number) {
        if (isChat(this)) mark("replay.scrollWrite", { chat: nameOf(this), via: "scrollTop", from: round(get.call(this)), to: round(v), height: this.scrollHeight, client: this.clientHeight, caller: caller() });
        set.call(this, v);
      },
    });
    offs.push(() => Object.defineProperty(proto, "scrollTop", top));
  }
  for (const via of ["scrollTo", "scrollBy"] as const) {
    const was = proto[via];
    proto[via] = function (this: Element, ...a: unknown[]) {
      if (isChat(this)) {
        const o = a[0] as ScrollToOptions | number | undefined;
        const to = typeof o === "object" ? (o?.top ?? null) : (a[1] ?? null);
        mark("replay.scrollWrite", { chat: nameOf(this), via, from: round(this.scrollTop), to, behavior: typeof o === "object" ? (o?.behavior ?? null) : null, height: this.scrollHeight, client: this.clientHeight, caller: caller() });
      }
      return (was as (...a: unknown[]) => void).apply(this, a);
    } as never;
    offs.push(() => void (proto[via] = was));
  }

  // A chat's scroll, once a frame while it moves.
  const moved = new Set<HTMLElement>();
  let frame = 0;
  const onScroll = (e: Event) => {
    if (!isChat(e.target as Element)) return;
    moved.add(e.target as HTMLElement);
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      for (const el of moved) mark("replay.scroll", { chat: nameOf(el), ...sizes(el) });
      moved.clear();
    });
  };
  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  offs.push(() => {
    document.removeEventListener("scroll", onScroll, { capture: true });
    cancelAnimationFrame(frame);
  });

  // Resizes: the window's, and each chat scroller's, found at each tick.
  const onResize = () => mark("replay.resize", { kind: "window", w: innerWidth, h: innerHeight, dpr: devicePixelRatio });
  window.addEventListener("resize", onResize, { passive: true });
  offs.push(() => window.removeEventListener("resize", onResize));
  const watched = new WeakSet<Element>();
  const sized = new ResizeObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      if (!el.isConnected) continue;
      const r = e.contentRect;
      mark("replay.resize", { kind: "pane", chat: nameOf(el), w: round(r.width), h: round(r.height), ...sizes(el) });
    }
  });
  offs.push(() => sized.disconnect());
  const watch = () => {
    for (const el of document.querySelectorAll<HTMLElement>("[data-transcript] > *"))
      if (!watched.has(el)) {
        watched.add(el);
        sized.observe(el);
      }
  };
  watch();

  // A pointerdown in a chat: the DOM's scroll there, and the paint's, which the app reads.
  const onDown = (e: PointerEvent) => {
    const el = scrollerAt(e.target);
    if (!el) return;
    const b = el.getBoundingClientRect();
    const row = (e.target as Element).closest?.("[data-chat-block]");
    const at = { chat: nameOf(el), x: Math.round(e.clientX), y: Math.round(e.clientY), ...sizes(el), rect: { x: round(b.x), y: round(b.y), w: round(b.width), h: round(b.height) }, row: row ? { id: row.getAttribute("data-chat-block"), top: round(row.getBoundingClientRect().top) } : null };
    if (!paints) return mark("replay.paint", at);
    const t0 = performance.now();
    invoke!<Record<string, unknown>>("page_paint", { x: e.clientX, y: e.clientY }).then(
      (p) => mark("replay.paint", { ...at, after: round(el.scrollTop), ms: round(performance.now() - t0), ...p }),
      (err: unknown) => {
        paints = false;
        mark("replay.paint", { ...at, error: String(err).slice(0, 200) });
      },
    );
  };
  window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
  offs.push(() => window.removeEventListener("pointerdown", onDown, { capture: true }));

  // The Mac's wheels, asked at each tick; an app without the command is asked no more.
  let since = 0;
  let asking = !!invoke;
  let pending = false;
  const tick = () => {
    watch();
    if (!asking || pending) return;
    pending = true;
    invoke!<{ seq: number; wheels: unknown[] }>("page_wheels", { since }).then(
      (r) => {
        pending = false;
        since = r.seq;
        if (r.wheels.length) mark("replay.wheel", { wheels: r.wheels });
      },
      () => void ((pending = false), (asking = false)),
    );
  };
  tick();

  return { tick, stop: () => offs.forEach((f) => f()) };
}
