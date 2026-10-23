// What the server half answers, for both halves and the contract: its API's definition, which its
// type is read off (@abyme/schema, docs/plugins.md, Defining an API). Pages import it as types alone.

import { api, fn, store, z, type Api } from "@abyme/schema";

/** A page's next events. A batch that begins a checkout starts with its Meta event (`checkout`):
 * abymed starts a new segment there, since a replay can start only at a full snapshot. */
export const BatchSchema = z.object({ page: z.string(), label: z.string(), checkout: z.boolean(), events: z.array(z.unknown()) });

/** A save on disk: `at` in milliseconds since 1970. */
export const SaveSchema = z.object({ name: z.string(), path: z.string(), at: z.number(), size: z.number() }).meta({ id: "Save" });

/** What a save holds, once read: `events` is a slice of them. Terminal output is in `events` too,
 * as rrweb custom events tagged `replay.terminal` (`data.payload`: `{ source, id, data?, reset?, at?, exit? }`,
 * `data` base64 bytes as the terminal drew them). `count` is every event in the save. */
export const ReadSchema = z.object({
  name: z.string(),
  path: z.string(),
  page: z.string(),
  label: z.string(),
  reason: z.string(),
  saved: z.number(),
  count: z.number(),
  from: z.number(),
  events: z.array(z.unknown()),
});

/** A save's first line: a save is JSON lines, gzipped, this and then one rrweb event a line. `css`:
 * the stylesheets its events name as `replay-css:<sha256>`, by hash. */
export type Head = { replay: 1; page: string; label: string; reason: string; saved: number; minutes: number; css?: Record<string, string> };

export const replay = api({
  push: fn({ description: "A page's next batch: appended to its open segment, in abymed's memory.", args: BatchSchema }),
  save: fn({
    description:
      "Writes a page's last `minutes` (the option `clip` unless given, at most `keep`) to the saves folder, from the checkout at or before then; answers the save, or null when it has nothing or saved for an error or a stall under a minute ago (`reason` beginning `error` or `stall`). Without `page` (an agent's: `abyme call replay save reason=\"checking the dock\"`), every page abymed holds is saved, named `agent`, each once its page has sent what it held, and the answer is the saves written.",
    args: z.object({ page: z.string().optional(), reason: z.string(), minutes: z.number().optional() }),
    value: z.union([SaveSchema, z.array(SaveSchema)]).nullable(),
  }),
  asked: store({ description: "A count abymed bumps to ask every page to send what it holds now, before a save of every page.", value: z.number() }),
  saves: fn({
    description:
      "The operator's UI recordings of abyme pages (rrweb), newest first: name, path, time, size. A save is gzipped JSON lines (`gunzip -c <path>`: its head, then an rrweb event a line; a stylesheet in an event is `replay-css:<sha256>`, its text in the head's `css`; replay_read puts them back), from a full snapshot up to when it was saved: the last 10 minutes by default, up to the option `keep` (15). One is written when the operator saves one, when a page has an uncaught error or a stall, and on an agent's request.",
    value: z.array(SaveSchema),
    readOnly: true,
    tool: true,
  }),
  read: fn({
    description:
      "A recording's rrweb events, with its page, label and why it was saved. rrweb types: 2 full snapshot, 3 incremental (data.source 0 mutation, 1 mousemove, 2 click/mouse, 3 scroll, 4 viewport resize, 5 input), 4 meta, 5 custom (`replay.terminal`: a terminal's output, base64, and its size). Page through with from/limit; filter with types.",
    args: z.object({
      name: z.string().describe("A name from replay_saves."),
      from: z.number().describe("First event index (0).").optional(),
      limit: z.number().describe("At most this many events (500, up to 5000).").optional(),
      types: z.array(z.number()).describe("Only events of these rrweb types.").optional(),
    }),
    value: ReadSchema,
    readOnly: true,
    tool: true,
  }),
});

export type Replay = Api<typeof replay>;
export type Batch = z.infer<typeof BatchSchema>;
export type Save = z.infer<typeof SaveSchema>;
export type Read = z.infer<typeof ReadSchema>;
