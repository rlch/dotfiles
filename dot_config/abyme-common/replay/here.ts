// Whether the two-second timer's lateness is the page's: `node --test here.test.ts`.

/** Where the page is now: shown, and its window the one with focus. */
export type Here = { visible: boolean; focused: boolean };

/**
 * A page hidden, or in a window without focus (another app in front, App Nap, Chromium's
 * throttling of a background page), has its timers throttled: a timer late then is the browser's,
 * not a stall, and saves no replay. `left()` on each visibility or focus change; `tick()` at each
 * tick says whether its lateness counts (the page was shown and focused throughout) and starts the
 * next interval.
 */
export class Presence {
  private readonly now: () => Here;
  private away: boolean;
  constructor(now: () => Here) {
    this.now = now;
    this.away = !this.here();
  }
  private here(): boolean {
    const h = this.now();
    return h.visible && h.focused;
  }
  left(): void {
    this.away ||= !this.here();
  }
  tick(): boolean {
    const counts = !this.away;
    this.away = !this.here();
    return counts;
  }
}
