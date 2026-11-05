// The server half's API, defined once (docs/plugins/defining-an-api.md): each function takes one
// object, as `abyme call publish <fn> path=<abs .md>`, a page and a half pass it. Pages import its
// types alone.
import { api, fn, store, z, type Api } from "@abyme/schema";

const path = z.string().min(1).describe("The document, by its absolute path (a `.md` file)");

/** A document exported and waiting for the operator's yes: where it will be, and what it holds. */
export const PreparedSchema = z
  .object({
    path: z.string(),
    title: z.string(),
    slug: z.string(),
    url: z.string(),
    files: z.array(z.string()).describe("The files the export holds, as the confirm lists them"),
    again: z.boolean().describe("It is published already: this replaces what is at the URL"),
  })
  .meta({ id: "PublishPrepared" });
export type Prepared = z.infer<typeof PreparedSchema>;

/** A publish or unpublish under way, or how the last one ended. */
export const JobSchema = z.object({
  action: z.enum(["publish", "unpublish"]),
  slug: z.string(),
  since: z.number(),
  state: z.enum(["running", "done", "failed"]),
  url: z.string().optional(),
  error: z.string().optional(),
});
export type Job = z.infer<typeof JobSchema>;

export const StateSchema = z
  .object({
    published: z.record(z.string(), z.object({ slug: z.string(), url: z.string(), at: z.number() })).describe("Each published document, by its path"),
    jobs: z.record(z.string(), JobSchema).describe("Each document's last job, by its path"),
  })
  .meta({ id: "PublishState" });
export type State = z.infer<typeof StateSchema>;

const slug = z.object({ slug: z.string() });

export const publish = api({
  prepare: fn({
    description: "Exports the document into a staging folder and says what publishing it would put where: its title, slug, URL and files. Publishes nothing.",
    args: z.object({ path }),
    value: PreparedSchema,
  }),
  publish: fn({
    description: "Publishes what `prepare` staged for the document; answers at once, and `state` follows the job.",
    args: z.object({ path }),
    value: slug,
  }),
  unpublish: fn({
    description: "Takes the document's page down; answers at once, and `state` follows the job.",
    args: z.object({ path }),
    value: slug,
  }),
  share: fn({
    description:
      "An agent's one call: exports the document, publishes it on the artifacts site with no confirm, waits for the deploy (minutes) and answers its URL. The operator sees it published and can unpublish it from the document's menu.",
    args: z.object({ path }),
    value: z.object({ slug: z.string(), url: z.string() }),
  }),
  state: store({ description: "Published documents and their jobs, by path.", value: StateSchema }),
});
export type Publish = Api<typeof publish>;
