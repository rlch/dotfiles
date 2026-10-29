// What the operator may set for replay, in init.ts: `replay.setup({ ... })`.
export default {
  checkout: {
    type: "number",
    default: 120_000,
    title: "Checkout every (ms)",
    description: "How often rrweb takes a full snapshot of the page, where a replay can start: once this long has passed and the page has had no key or pointer for 2 s, when it is idle.",
  },
  keep: { type: "number", default: 15, title: "Minutes kept", description: "Each page's recording, in abymed's memory a checkout at a time; older checkouts are dropped." },
  memory: { type: "number", default: 128 * 1024 * 1024, title: "Memory (bytes)", description: "The most abymed holds for all pages' recordings; past it, the oldest checkout of any page goes (never a page's newest)." },
  stall: { type: "number", default: 1000, title: "Stall (ms)", description: "A visible page blocked this long (a frame, or its timer this late) saves a replay; at most once a minute per page." },
  clip: { type: "number", default: 10, title: "Minutes a save takes", description: "Fractions allowed (0.5 is 30 s, at least 0.25). What leader ⇧R and an error save: from the checkout at or before this many minutes ago. Save replay of the last <keep> minutes takes all that is kept." },
  saves: { type: "number", default: 30, title: "Saves kept", description: "The oldest save beyond this many is deleted." },
  dir: { type: "string", default: "", title: "Folder", description: "Empty: <stateDir>/replays, where saves are written." },
  terminals: { type: "boolean", default: true, title: "Record terminals", description: "Each visible terminal's output bytes and size, beside the page's DOM, which shows a terminal blank." },
  onError: { type: "boolean", default: true, title: "Save on an error", description: "Save when the page has an uncaught error, a rejection, or a fault the kernel holds; at most once a minute per page." },
} as const;
