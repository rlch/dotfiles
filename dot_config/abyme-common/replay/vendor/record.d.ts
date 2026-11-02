// What replay uses of @rrweb/record 2.1.7.
export type RecordEvent = { type: number; data: unknown; timestamp: number };
export function record(options: {
  emit(event: RecordEvent, isCheckout?: boolean): void;
  checkoutEveryNms?: number;
  maskAllInputs?: boolean;
  maskInputOptions?: { password?: boolean };
  blockSelector?: string;
  sampling?: { mousemove?: boolean | number; scroll?: number; input?: "all" | "last" };
  recordCanvas?: boolean;
  collectFonts?: boolean;
  inlineImages?: boolean;
}): (() => void) | undefined;
export namespace record {
  function addCustomEvent<T>(tag: string, payload: T): void;
  /** Patched (README.md): a checkout walked in slices, its cost once its FullSnapshot is out (wall
   * `ms`, `work` in slices, the `longest` slice, the `records` queued meanwhile); null if none was. */
  function takeFullSnapshot(isCheckout?: boolean): Promise<{ ms: number; work: number; longest: number; slices: number; records: number } | null>;
}
