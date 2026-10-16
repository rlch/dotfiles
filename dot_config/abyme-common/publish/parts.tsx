// What client.tsx draws: the confirm before a canvas goes on the web, and the status bar's segment
// while a publish or unpublish runs.
import publish from "@abyme/publish";
import { createStore, useStore } from "@abyme/client";
import notifications from "@abyme/notifications/optional";
import { Button } from "@abyme/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@abyme/ui/components/ui/dialog";
import { useState } from "react";
import type { Prepared } from "./api.ts";

/** The export being asked about; the command sets it. */
export const asking = createStore<Prepared | null>(null);

export function Confirm() {
  const p = useStore(asking, (s) => s);
  const [busy, setBusy] = useState(false);
  const dismiss = () => asking.set(() => null);
  const go = async () => {
    if (!p || busy) return;
    setBusy(true);
    try {
      await publish.server.publish(p.id);
    } catch (e) {
      notifications?.notify({ level: "error", title: `${p.title} was not published`, body: (e as Error).message });
    }
    setBusy(false);
    dismiss();
  };
  return (
    <Dialog open={!!p} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="sm:max-w-md" data-publish-confirm={p?.id}>
        <DialogHeader>
          <DialogTitle>Publish {p?.title} to the web?</DialogTitle>
          <DialogDescription>
            It will be public at {p?.url}. Anyone with the URL can open it, and the URL is guessable.
            {p?.again ? " This replaces what is there now." : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">It holds:</span>
          <ul className="flex flex-col gap-0.5" style={{ maxHeight: 200, overflowY: "auto", paddingLeft: 16, listStyle: "disc" }}>
            {p?.files.map((f) => (
              <li key={f} className="font-mono text-xs">
                {f}
              </li>
            ))}
          </ul>
          {!!p?.placeholders.length && (
            <span className="text-muted-foreground">Drawn as a placeholder there: {p.placeholders.join(", ")}.</span>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" autoFocus onClick={dismiss}>
            Cancel
          </Button>
          <Button type="button" disabled={busy} onClick={() => void go()}>
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** "Publishing x…" while a job runs; nothing otherwise. */
export function Progress() {
  const running = useStore(publish.server.state(), (s) =>
    Object.values(s?.jobs ?? {})
      .filter((j) => j.state === "running")
      .map((j) => `${j.action === "publish" ? "Publishing" : "Unpublishing"} ${j.slug}…`)
      .join(" · "),
  );
  if (!running) return null;
  return (
    <span className="text-muted-foreground" data-publish-progress>
      {running}
    </span>
  );
}
