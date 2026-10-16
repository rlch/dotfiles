// What the server half answers, for both halves and the contract. Types alone.

/** A canvas exported and waiting for the operator's yes: where it will be, and what it holds. */
export type Prepared = {
  id: string;
  title: string;
  slug: string;
  url: string;
  /** The files the export holds, as the confirm lists them. */
  files: string[];
  /** Components no plugin of the viewer draws: each is its placeholder there. */
  placeholders: string[];
  /** It is published already: this replaces what is at the URL. */
  again: boolean;
};

/** A publish or unpublish under way, or how the last one ended. */
export type Job = { action: "publish" | "unpublish"; slug: string; since: number; state: "running" | "done" | "failed"; url?: string; error?: string };

export type State = {
  /** Each published canvas, by its id. */
  published: Record<string, { slug: string; url: string; at: number }>;
  /** Each canvas's last job, by its id. */
  jobs: Record<string, Job>;
};

export type Publish = {
  /** Exports the canvas `id` into a staging folder and says what publishing it would put where. */
  prepare(id: string): Promise<Prepared>;
  /** Publishes what `prepare` staged for `id`; answers at once, and `state()` follows the job. */
  publish(id: string): Promise<{ slug: string }>;
  /** Takes the canvas `id`'s page down; answers at once, and `state()` follows the job. */
  unpublish(id: string): Promise<{ slug: string }>;
  /** Published canvases and their jobs: a value pages follow. */
  state(): { getState(): State; set(next: never): void };
};
