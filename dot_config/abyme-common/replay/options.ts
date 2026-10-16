// What the operator may set for replay, in init.ts: `replay.setup({ ... })`.
export default {
  checkout: {
    type: "number",
    default: 120_000,
    title: "Checkout every (ms)",
    description: "How often rrweb takes a full snapshot of the page, where a replay can start. Each costs the page a long frame on a big DOM.",
  },
  keep: { type: "number", default: 60, title: "Minutes kept", description: "Each page's recording on disk, gzipped a checkout at a time; older checkouts are deleted." },
  clip: { type: "number", default: 10, title: "Minutes a save takes", description: "What leader ⇧R and an error save: from the checkout at or before this many minutes ago. Save replay of the last hour takes all that is kept." },
  saves: { type: "number", default: 30, title: "Saves kept", description: "The oldest save beyond this many is deleted." },
  dir: { type: "string", default: "", title: "Folder", description: "Empty: <stateDir>/replays (saves; the running recording in its ring/)." },
  terminals: { type: "boolean", default: true, title: "Record terminals", description: "Each visible terminal's output bytes and size, beside the page's DOM, which shows a terminal blank." },
  onError: { type: "boolean", default: true, title: "Save on an error", description: "Save when the page has an uncaught error, a rejection, or a fault the kernel holds; at most once a minute per page." },
} as const;
