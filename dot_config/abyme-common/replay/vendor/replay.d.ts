// What replay uses of @rrweb/replay 2.1.7.
export class Replayer {
  constructor(
    events: unknown[],
    config?: { root?: HTMLElement; speed?: number; skipInactive?: boolean; mouseTail?: boolean; triggerFocus?: boolean; showWarning?: boolean; showDebug?: boolean; UNSAFE_replayCanvas?: boolean; insertStyleRules?: string[] },
  );
  readonly wrapper: HTMLDivElement;
  readonly iframe: HTMLIFrameElement;
  play(timeOffset?: number): void;
  pause(timeOffset?: number): void;
  getCurrentTime(): number;
  getMetaData(): { startTime: number; endTime: number; totalTime: number };
  setConfig(config: { speed?: number; skipInactive?: boolean }): void;
  on(event: "start" | "pause" | "finish" | "resize" | "event-cast", handler: (payload: unknown) => void): this;
  destroy(): void;
}
