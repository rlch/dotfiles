// The view Replays: pick a save, watch it with rrweb-player. The page's DOM only: a terminal shows
// blank there (its bytes are in the save as `replay.terminal` events), and so do the browser's and
// PDF frames.
import replay from "@abyme/replay";
import layout from "@abyme/layout";
import type { ViewProps } from "@abyme/client";
import { Button } from "@abyme/ui/components/ui/button";
import { ViewState } from "@abyme/ui";
import { useEffect, useState } from "react";
import Player from "./vendor/rrweb-player.js";
import type { Save } from "./api.ts";

const SHEET = new URL("./vendor/rrweb-player.css", import.meta.url).href;
/** The player's controller, under the replay. */
const CONTROLLER = 80;

/** rrweb-player's sheet, in the page while a player shows. */
function useSheet() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[data-replay-sheet]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = SHEET;
      link.dataset.replaySheet = "";
      link.dataset.users = "0";
      document.head.append(link);
    }
    link.dataset.users = String(Number(link.dataset.users) + 1);
    return () => {
      const n = Number(link.dataset.users) - 1;
      link.dataset.users = String(n);
      if (n <= 0) link.remove();
    };
  }, []);
}

async function events(name: string): Promise<unknown[]> {
  const r = await fetch(`/api/replay/saves/${encodeURIComponent(name)}`);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const json = r.body!.pipeThrough(new DecompressionStream("gzip"));
  return ((await new Response(json).json()) as { events: unknown[] }).events;
}

export function ReplayView({ params, api }: ViewProps) {
  useSheet();
  const [saves, setSaves] = useState<Save[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const name = params.save ?? saves?.[0]?.name;
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  const refresh = () => {
    setFailed(null);
    replay.server.saves().then(setSaves, (e: Error) => setFailed(e.message));
  };
  useEffect(refresh, []);

  useEffect(() => {
    if (!el || !name) return;
    let player: Player | null = null;
    let gone = false;
    const size = () => ({ width: Math.max(200, el.clientWidth), height: Math.max(120, el.clientHeight - CONTROLLER) });
    events(name).then(
      (ev) => {
        if (gone) return;
        el.replaceChildren();
        player = new Player({ target: el, props: { events: ev, ...size(), autoPlay: false, skipInactive: true } });
      },
      (e: Error) => !gone && setFailed(e.message),
    );
    const seen = new ResizeObserver(() => {
      const p = player as unknown as { $set?(props: object): void; triggerResize(): void } | null;
      p?.$set?.(size());
      p?.triggerResize();
    });
    seen.observe(el);
    return () => {
      gone = true;
      seen.disconnect();
      player?.$destroy();
      el.replaceChildren();
    };
  }, [name, el]);

  if (failed) return <ViewState kind="failed" title="Replay not read" detail={failed} action={{ label: "Retry", onClick: refresh }} />;
  if (!saves) return <ViewState kind="loading" />;
  if (!saves.length && !params.save) return <ViewState kind="empty" title="No replays saved" detail="Save replay of the last 2 minutes: leader ⇧R." />;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="flex items-center gap-2 text-sm">
        <select
          className="text-sm"
          style={{ background: "transparent", minWidth: 0, flex: 1 }}
          value={name}
          // The view shows what its params say: the pick opens in its place.
          onChange={(e) => layout.open({ view: "replay", params: { save: e.target.value } }, { target: "replace", from: api.key })}
        >
          {saves.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({Math.round(s.size / 1024)} KB)
            </option>
          ))}
        </select>
        <Button type="button" variant="ghost" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>
      <div ref={setEl} className="min-h-0 flex-1" style={{ overflow: "hidden" }} />
    </div>
  );
}
