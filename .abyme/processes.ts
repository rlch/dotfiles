// The long-running commands agents start from this repo: `abyme call processes start name=<name>`.
import type { ProcessFile } from "@abyme/processes";

export default {
  // The headed Chromium on :9222 that agents share on a lease (dot_local/bin/executable_browser-headed).
  // `browser-headed up` starts it here when herdr is not running.
  "browser-headed": { cmd: "browser-headed serve" },
} satisfies ProcessFile;
