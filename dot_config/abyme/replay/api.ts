// What the server half answers, for both halves and the contract. Types alone.

/** A page's next events. A batch that begins a checkout starts with its Meta event (`checkout`):
 * abymed starts a new segment there, since a replay can start only at a full snapshot. */
export type Batch = { page: string; label: string; checkout: boolean; events: unknown[] };

/** A save on disk. */
export type Save = {
  name: string;
  path: string;
  /** Milliseconds since 1970. */
  at: number;
  size: number;
};

/** What a save holds, once read: `events` is a slice of them. Terminal output is in `events` too,
 * as rrweb custom events tagged `replay.terminal` (`data.payload`: `{ source, id, data?, reset?, at?, exit? }`,
 * `data` base64 bytes as the terminal drew them). */
export type Read = {
  name: string;
  path: string;
  page: string;
  label: string;
  reason: string;
  saved: number;
  /** Every event in the save. */
  count: number;
  from: number;
  events: unknown[];
};

/** A save's first line: a save is JSON lines, gzipped, this and then one rrweb event a line. */
export type Head = { replay: 1; page: string; label: string; reason: string; saved: number; minutes: number };

export type Replay = {
  /** A page's next batch: appended to its open segment on disk. */
  push(batch: Batch): Promise<void>;
  /** Writes the page's last `minutes` (the option `clip` unless given, at most `keep`) to the saves
   * folder, from the checkout at or before then; answers the save, or null when it has nothing or
   * saved for an error under a minute ago (`reason` beginning `error`). */
  save(page: string, reason: string, minutes?: number): Promise<Save | null>;
  /** The saves on disk, newest first. */
  saves(): Promise<Save[]>;
  /** A save's events from `from`, at most `limit` (500), optionally only those of the rrweb `types`. */
  read(options: { name: string; from?: number; limit?: number; types?: number[] }): Promise<Read>;
};
