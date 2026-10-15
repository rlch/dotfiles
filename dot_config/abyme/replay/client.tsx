// replay, in every page it loads on: rrweb records the page, unmasked but for passwords, and abymed
// keeps the last `keep` minutes on disk; nothing leaves the machine. "Save replay" (leader shift+r,
// the last `clip` minutes), "Save replay of the last hour" and any uncaught error, rejection or
// fault write a save, which agents read with replay_read and the view Replays plays.
import abyme from "@abyme/plugin";
import replay from "@abyme/replay";
import { restParam } from "@abyme/client";
import commands from "@abyme/commands/inventory";
import keys from "@abyme/keys/inventory";
import views from "@abyme/views/inventory";
import layout from "@abyme/layout";
import plugins from "@abyme/plugins";
import notifications from "@abyme/notifications/optional";
import options from "./options.ts";
import { mark, PAGE, recording } from "./parts.tsx";

const o = abyme.with(options).plugin.options;
let rec: ReturnType<typeof recording> | null = null;
let stopped = false;
// After the page has drawn, so it costs the load nothing.
abyme.on("ready", () => {
  if (!stopped) rec = recording({ checkout: Math.max(5_000, o.checkout), terminals: o.terminals });
});
abyme.effect(() => () => {
  stopped = true;
  rec?.stop();
});

async function save(reason: string, minutes?: number) {
  mark("replay.save", { reason });
  rec?.flush();
  return replay.server.save(PAGE, reason, minutes);
}

if (o.onError) {
  // What follows an error is part of it: the save waits a moment for it.
  const soon = (reason: string, stack?: string) => {
    mark("replay.error", { message: reason.slice(0, 1000), stack: stack?.slice(0, 4000) });
    setTimeout(() => void save(`error: ${reason}`.slice(0, 300)).catch(() => {}), 1500);
  };
  // An error event with no error is the browser's word alone (the ResizeObserver loop notice, a
  // script of another origin), no fault: the sentry plugin skips it too.
  const uncaught = (e: ErrorEvent) => {
    if (e.error) soon(e.error instanceof Error ? e.error.message : String(e.error), e.error instanceof Error ? e.error.stack : undefined);
  };
  const rejected = (e: PromiseRejectionEvent) => soon(e.reason instanceof Error ? e.reason.message : String(e.reason), e.reason instanceof Error ? e.reason.stack : undefined);
  window.addEventListener("error", uncaught);
  window.addEventListener("unhandledrejection", rejected);
  const seen = new Set(plugins.faults.getState().map((f) => f.id));
  const off = plugins.faults.on("change", () => {
    for (const f of plugins.faults.getState()) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      soon(`fault ${f.plugin} ${f.kind}: ${f.error?.message ?? f.what}`, f.error?.stack);
    }
  });
  abyme.effect(() => () => {
    window.removeEventListener("error", uncaught);
    window.removeEventListener("unhandledrejection", rejected);
    off.dispose();
  });
}

views.add({
  id: "replay",
  title: (p) => (p.save ? `Replay ${p.save.replace(/\.jsonl?\.gz$/, "")}` : "Replays"),
  keywords: ["rrweb", "recording", "session", "jank", "debug"],
  url: restParam("save"),
  describe: (p) => ({ save: p.save ?? null }),
  load: () => import("./Player.tsx").then((m) => m.ReplayView),
});

async function saveNow(minutes: number | undefined, event?: unknown) {
  try {
    const s = await save("asked", minutes);
    if (!s) return void notifications?.notify({ level: "info", title: "Nothing recorded yet", body: "The first checkout has not reached abymed." });
    notifications?.notify({
      level: "success",
      title: "Replay saved",
      body: s.name,
      detail: s.path,
      key: "replay.saved",
      action: { label: "Watch", run: (e) => layout.open({ view: "replay", params: { save: s.name } }, { event: (e ?? event) as never }) },
    });
  } catch (e) {
    notifications?.notify({ level: "error", title: "Replay not saved", body: (e as Error).message, output: "replay" });
  }
}

commands.add(
  {
    id: "replay.save",
    title: `Save replay of the last ${o.clip} minutes`,
    group: "Replay",
    keywords: ["rrweb", "record", "jank", "bug"],
    run: (event) => saveNow(undefined, event),
  },
  {
    id: "replay.save.all",
    title: o.keep === 60 ? "Save replay of the last hour" : `Save replay of the last ${o.keep} minutes`,
    group: "Replay",
    keywords: ["rrweb", "record", "jank", "bug", "hour", "all"],
    run: (event) => saveNow(o.keep, event),
  },
);
keys.add({ keys: "leader shift+r", command: "replay.save" });
