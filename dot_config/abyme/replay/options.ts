// What the operator may set for replay, in init.ts: `replay.setup({ ... })`.
export default {
  checkout: {
    type: "number",
    default: 60_000,
    title: "Checkout every (ms)",
    description: "How often rrweb takes a full snapshot of the page. A save holds the last `keep` of them, so this times `keep` is about how far back it reaches.",
  },
  keep: { type: "number", default: 3, title: "Checkouts kept", description: "Per page, in abymed's memory: 3 at 60 s is the last 2 to 3 minutes." },
  saves: { type: "number", default: 30, title: "Saves kept", description: "The oldest save beyond this many is deleted." },
  dir: { type: "string", default: "", title: "Saves folder", description: "Empty: <stateDir>/replays." },
  terminals: { type: "boolean", default: true, title: "Record terminals", description: "Each visible terminal's output bytes and size, beside the page's DOM, which shows a terminal blank." },
  onError: { type: "boolean", default: true, title: "Save on an error", description: "Save when the page has an uncaught error, a rejection, or a fault the kernel holds; at most once a minute per page." },
} as const;
