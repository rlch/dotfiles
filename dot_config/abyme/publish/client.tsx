// publish, in every page: "Publish canvas to the web" and "Unpublish canvas" in the palette and on a
// canvas's menus (its board, its row in Canvases). Publishing asks first, naming the URL and what the
// export holds; the job then runs in abymed, the status bar says so, and its end is a notice with the
// URL and Copy URL.
import abyme from "@abyme/plugin";
import publish from "@abyme/publish";
import type { MenuTarget } from "@abyme/client";
import commands from "@abyme/commands/inventory";
import menus from "@abyme/menus/inventory";
import notifications from "@abyme/notifications/optional";
import shell from "@abyme/shell/inventory";
import status from "@abyme/status/inventory";
import type { Job, State } from "./api.ts";
import { asking, Confirm, Progress } from "./parts.tsx";

const seen = publish.server.state();
const now = (): State | undefined => seen.getState();

/** The canvas a menu was opened on: a board's or a document's, or a view of one. */
const canvasOf = (t?: MenuTarget): string | null => {
  const board = t?.all["canvas.board"];
  if (typeof board === "string") return board;
  const view = t?.all.view as { view?: string; params?: { id?: string } } | undefined;
  return view?.view === "canvas" && view.params?.id ? view.params.id : null;
};

async function ask(id: string) {
  try {
    asking.set(() => null);
    const p = await publish.server.prepare(id);
    asking.set(() => p);
  } catch (e) {
    notifications?.notify({ level: "error", title: `${id} was not exported`, body: (e as Error).message });
  }
}

async function takeDown(id: string) {
  try {
    await publish.server.unpublish(id);
  } catch (e) {
    notifications?.notify({ level: "error", title: `${id} was not unpublished`, body: (e as Error).message });
  }
}

// A job's end, told by the page that saw it run.
const last = new Map<string, Job["state"]>();
function follow() {
  for (const [id, job] of Object.entries(now()?.jobs ?? {})) {
    const was = last.get(id);
    last.set(id, job.state);
    if (was !== "running" || job.state === "running") continue;
    const key = `publish.${id}`;
    if (job.state === "failed") notifications?.notify({ level: "error", title: `${id} was not ${job.action}ed`, body: job.error ?? "", output: "publish", key });
    else if (job.action === "unpublish") notifications?.notify({ level: "success", title: `Unpublished ${id}`, body: `${job.slug} is off the web.`, key });
    else {
      const url = job.url ?? "";
      notifications?.notify({
        level: "success",
        title: `Published ${id}`,
        body: url,
        key,
        seconds: 0,
        action: { label: "Copy URL", run: () => void navigator.clipboard?.writeText(url) },
      });
    }
  }
}
abyme.effect(() => seen.on("change", follow));
follow();

commands.add(
  {
    id: "publish.canvas",
    title: "Publish canvas to the web",
    group: "Canvases",
    keywords: ["share", "artifact", "public", "url"],
    args: [{ title: "Canvas", picker: "canvas.all" }],
    run: (_event, target, answers) => {
      const id = canvasOf(target) ?? answers?.[0];
      if (id) void ask(id);
    },
  },
  {
    id: "publish.unpublish",
    title: "Unpublish canvas",
    group: "Canvases",
    keywords: ["artifact", "remove", "take down"],
    args: [{ title: "Canvas", picker: "canvas.all" }],
    run: (_event, target, answers) => {
      const id = canvasOf(target) ?? answers?.[0];
      if (id) void takeDown(id);
    },
  },
);
const published = (t: MenuTarget) => !!now()?.published[canvasOf(t) ?? ""];
for (const kind of ["canvas.board", "view"]) {
  menus.add(
    { kind, command: "publish.canvas", group: "publish", order: 60, title: (t) => (published(t) ? "Publish again" : "Publish to the web"), when: (t) => canvasOf(t) !== null },
    { kind, command: "publish.unpublish", group: "publish", order: 61, title: "Unpublish", when: published },
  );
}
shell.overlays.add({ id: "publish.confirm", Component: Confirm });
status.segments.add({ id: "publish.progress", side: "right", order: 25, Component: Progress });
