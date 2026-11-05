// publish, in every page: "Publish document to the web" and "Unpublish document" in the palette
// and on a document's menus (its tab, its page's blocks, its view and its row). Publishing here asks first, naming the URL and what the
// export holds; the job then runs in abymed, the status bar says so, and its end is a notice with the
// URL and Copy URL.
import abyme from "@abyme/plugin";
import publish from "@abyme/publish";
import type { MenuTarget } from "@abyme/client";
import commands from "@abyme/commands/inventory";
import layout from "@abyme/layout/optional";
import menus from "@abyme/menus/inventory";
import notifications from "@abyme/notifications/optional";
import shell from "@abyme/shell/inventory";
import status from "@abyme/status/inventory";
import type { State } from "./api.server.ts";
import { asking, Confirm, Progress } from "./parts.tsx";

const seen = publish.server.state();
const now = (): State | undefined => seen.getState();

const md = (p: unknown): string | null => (typeof p === "string" && p.endsWith(".md") ? p : null);
/** The document a menu was opened on: a `.md` file, a view of one, the tab showing one (the
 * document page's tab), or a block of its page (a reference to its lines). */
const documentOf = (t?: MenuTarget): string | null => {
  if (!t) return null;
  const view = t.all.view as { view?: string; params?: { path?: unknown } } | undefined;
  const tab = typeof t.all.tab === "string" ? layout?.list().find((v) => v.key === t.all.tab) : undefined;
  const reference = t.all.reference as { path?: unknown } | undefined;
  return (
    md(t.all.file) ??
    (view?.view === "file" ? md(view.params?.path) : null) ??
    (tab?.view === "file" ? md(tab.params.path) : null) ??
    md(reference?.path)
  );
};

async function ask(id: string) {
  try {
    asking.set(() => null);
    const p = await publish.server.prepare({ path: id });
    asking.set(() => p);
  } catch (e) {
    notifications?.notify({ level: "error", title: `${id} was not exported`, body: (e as Error).message });
  }
}

async function takeDown(id: string) {
  try {
    await publish.server.unpublish({ path: id });
  } catch (e) {
    notifications?.notify({ level: "error", title: `${id} was not unpublished`, body: (e as Error).message });
  }
}

// A job's end, told by every page open when it ended: one the page saw run, or one an agent's
// `share` started and ended between two changes the page heard. What had ended before the page
// first heard the state is not told again.
const told = new Set<string>();
let heard = false;
function follow() {
  const jobs = now()?.jobs;
  if (!jobs) return;
  for (const [id, job] of Object.entries(jobs)) {
    const at = `${id}@${job.since}`;
    if (job.state === "running" || told.has(at)) continue;
    told.add(at);
    if (!heard) continue;
    const key = `publish.${id}`;
    if (job.state === "failed") notifications?.notify({ level: "error", title: `${id} was not ${job.action}ed`, body: job.error ?? "", output: "publish", key });
    else if (job.action === "unpublish") notifications?.notify({ level: "info", title: `Unpublished ${id}`, body: `${job.slug} is off the web.`, key });
    else {
      const url = job.url ?? "";
      notifications?.notify({
        level: "success",
        title: `Published ${id}`,
        body: url,
        key,
        // A success is told only as a toast holding a click (Copy URL); it stays until dismissed.
        toast: true,
        sticky: true,
        action: { label: "Copy URL", run: () => void navigator.clipboard?.writeText(url) },
      });
    }
  }
  heard = true;
}
abyme.effect(() => seen.on("change", follow));
follow();

commands.add(
  {
    id: "publish.document",
    title: "Publish document to the web",
    group: "Documents",
    keywords: ["share", "artifact", "public", "url"],
    args: [{ title: "Document", picker: "documents.all" }],
    run: (_event, target, answers) => {
      const id = documentOf(target) ?? answers?.[0];
      if (id) void ask(id);
    },
  },
  {
    id: "publish.unpublish",
    title: "Unpublish document",
    group: "Documents",
    keywords: ["artifact", "remove", "take down"],
    args: [{ title: "Document", picker: "documents.all" }],
    run: (_event, target, answers) => {
      const id = documentOf(target) ?? answers?.[0];
      if (id) void takeDown(id);
    },
  },
);
const published = (t: MenuTarget) => !!now()?.published[documentOf(t) ?? ""];
// "tab": the document page's tab, and the pane's; "reference": a right-click on the page's body.
for (const kind of ["tab", "reference", "view", "file"]) {
  menus.add(
    { kind, command: "publish.document", group: "publish", order: 60, title: (t) => (published(t) ? "Publish again" : "Publish to the web"), when: (t) => documentOf(t) !== null },
    { kind, command: "publish.unpublish", group: "publish", order: 61, title: "Unpublish", when: published },
  );
}
shell.overlays.add({ id: "publish.confirm", Component: Confirm });
status.segments.add({ id: "publish.progress", side: "right", order: 25, Component: Progress });
