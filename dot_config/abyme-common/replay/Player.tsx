// The view Replays: a save as a debugging view. The header names the save (a picker of them) and
// what it is; the recorded page plays in a frame scaled to fit, rrweb's Replayer and nothing of
// rrweb-player; a timeline under it marks each error, save point and terminal burst; the list
// beside it is every moment worth finding, following playback; "Send to agent" puts the save and
// the moment picked in an agent's composer. A terminal shows blank in the frame (its bytes are the
// list's terminal rows), and so do the browser's and PDF frames.
import replay from "@abyme/replay";
import agents from "@abyme/agents/optional";
import chat from "@abyme/chat/optional";
import layout from "@abyme/layout";
import { useStore, type ViewProps } from "@abyme/client";
import type { Agent } from "@abyme/agents";
import { Badge } from "@abyme/ui/components/ui/badge";
import { Button } from "@abyme/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@abyme/ui/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@abyme/ui/components/ui/toggle-group";
import { cn } from "@abyme/ui/lib/utils";
import { sideRow, ViewState } from "@abyme/ui";
import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { Replayer } from "./vendor/replay.js";
import type { Read, Save } from "./api.server.ts";
import { clock, kb, moments, pageWhy, parseName, savedFor, type Event, type Kind, type Moment } from "./moments.ts";
import { parseSave } from "./format.ts";
import * as I from "./icons.tsx";

const SHEET = new URL("./vendor/replay.css", import.meta.url).href;
const SPEEDS = ["1", "2", "4", "8"] as const;
type Speed = (typeof SPEEDS)[number];

const LOOK: Record<Kind, { icon: ComponentType<{ className?: string; style?: CSSProperties }>; color: string }> = {
  error: { icon: I.Alert, color: "var(--destructive)" },
  save: { icon: I.Bookmark, color: "var(--primary)" },
  snapshot: { icon: I.Camera, color: "var(--subtle)" },
  mutations: { icon: I.Layers, color: "var(--muted-foreground)" },
  terminal: { icon: I.Terminal, color: "var(--info)" },
  click: { icon: I.Click, color: "var(--muted-foreground)" },
  resize: { icon: I.Resize, color: "var(--muted-foreground)" },
  input: { icon: I.Keyboard, color: "var(--muted-foreground)" },
};
/** What the timeline marks: the moments to jump to. */
const MARKED: ReadonlySet<Kind> = new Set(["error", "save", "terminal"]);

/** The Replayer's sheet (its cursor), in the page while a replay shows. */
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
    const it = link;
    it.dataset.users = String(Number(it.dataset.users) + 1);
    return () => {
      const n = Number(it.dataset.users) - 1;
      it.dataset.users = String(n);
      if (n <= 0) it.remove();
    };
  }, []);
}

type Loaded = Pick<Read, "name" | "page" | "label" | "reason" | "saved"> & { events: Event[] };

async function load(name: string): Promise<Loaded> {
  const r = await fetch(`/api/replay/saves/${encodeURIComponent(name)}`);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const text = await new Response(r.body!.pipeThrough(new DecompressionStream("gzip"))).text();
  const { page, label, reason, saved, events } = parseSave(text);
  return { name, page, label, reason, saved, events };
}

const when = (t: number) => new Date(t).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const time = (t: number) => new Date(t).toLocaleTimeString([], { hour12: false });

export function ReplayView({ params, api }: ViewProps) {
  useSheet();
  const [saves, setSaves] = useState<Save[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const name = params.save ?? saves?.[0]?.name;
  const [data, setData] = useState<Loaded | null>(null);

  const [tries, setTries] = useState(0);
  const refresh = () => {
    setFailed(null);
    setTries((n) => n + 1);
    replay.server.saves().then(setSaves, (e: Error) => setFailed(e.message));
  };
  useEffect(refresh, []);
  useEffect(() => {
    if (!name) return;
    let live = true;
    setData(null);
    load(name).then(
      (d) => live && setData(d),
      (e: Error) => live && setFailed(e.message),
    );
    return () => void (live = false);
  }, [name, tries]);
  useEffect(() => {
    if (name) api.setTitle(`Replay ${time(parseName(name).time)}`);
  }, [name]);

  if (failed) return <ViewState kind="failed" title="Replay not read" detail={failed} action={{ label: "Retry", onClick: refresh }} />;
  if (!saves) return <ViewState kind="loading" />;
  if (!saves.length && !params.save) return <ViewState kind="empty" title="No replays saved" detail="Save replay: leader ⇧R. An error on a page saves one too." />;
  const save = saves.find((s) => s.name === name);
  const pick = (next: string) => layout.open({ view: "replay", params: { save: next } }, { target: "replace", from: api.key });
  return (
    <div className="flex h-full min-h-0 flex-col bg-background" data-replay={name}>
      <Header saves={saves} name={name!} save={save} data={data} onPick={pick} />
      {data ? <Replay key={name} data={data} save={save} /> : <ViewState kind="loading" />}
    </div>
  );
}

function Header({ saves, name, save, data, onPick }: { saves: Save[]; name: string; save?: Save; data: Loaded | null; onPick(name: string): void }) {
  const meta = parseName(name);
  const length = data?.events.length ? data.events.at(-1)!.timestamp - data.events[0]!.timestamp : null;
  const why = meta.why ?? (data ? pageWhy(data.reason) : null);
  const error = why === "error";
  return (
    <div className="flex shrink-0 items-center gap-3 border-b px-3" style={{ height: 48 }} data-replay-header>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 font-medium" data-replay-pick>
            <span className="tabular-nums">{when(meta.time)}</span>
            <I.ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" style={{ maxHeight: 420 }}>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Saves, newest first</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={name} onValueChange={onPick}>
            {saves.map((s) => {
              const m = parseName(s.name);
              return (
                <DropdownMenuRadioItem key={s.name} value={s.name} className="gap-3 text-xs" data-replay-save={s.name}>
                  <span className="tabular-nums">{when(m.time)}</span>
                  <span className="text-muted-foreground">
                    {m.view || "page"} · {m.device}
                  </span>
                  <span className="ml-auto flex items-center gap-2 pl-4">
                    {m.why === "error" && <I.Alert className="size-3 shrink-0" style={{ color: "var(--destructive)" }} />}
                    <span className="text-muted-foreground tabular-nums">{kb(s.size)}</span>
                  </span>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={error ? "destructive" : "muted"} className="shrink-0 rounded-full" title={data?.reason}>
          {savedFor(why)}
        </Badge>
        {why !== "key" && data && (
          <span className="min-w-0 truncate" style={{ flexShrink: 0, maxWidth: "50%", ...(error ? { color: "var(--destructive)" } : {}) }} title={data.reason}>
            {data.reason.replace(/^(error|stall):\s*/, "")}
          </span>
        )}
        <span className="min-w-0 truncate">{[meta.view || "page", meta.device, length !== null && clock(length), save && kb(save.size)].filter(Boolean).join(" · ")}</span>
      </div>
    </div>
  );
}

/** The replay: the frame and its timeline, the list beside them. */
function Replay({ data, save }: { data: Loaded; save?: Save }) {
  const t0 = data.events[0]?.timestamp ?? 0;
  const total = data.events.length ? data.events.at(-1)!.timestamp - t0 : 0;
  const list = useMemo(() => moments(data.events, { at: data.saved, reason: data.reason, why: parseName(data.name).why }), [data]);
  // Where it opens: just before the first error, else a second in (a fresh page's first moments
  // are its loading screen).
  const start = useMemo(() => {
    const error = list.find((m) => m.kind === "error");
    return Math.min(total, error ? Math.max(0, error.at - 2000) : 1000);
  }, [list, total]);
  const [now, setNow] = useState(start);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>("1");
  const [picked, setPicked] = useState<Moment | null>(null);
  const player = useRef<Replayer | null>(null);

  const seek = (at: number, m?: Moment) => {
    const p = player.current;
    const to = Math.max(0, Math.min(total, at));
    if (p) {
      if (playing) p.play(to);
      else p.pause(to);
    }
    setNow(to);
    setPicked(m ?? null);
  };
  const toggle = () => {
    const p = player.current;
    if (!p) return;
    if (playing) {
      p.pause();
      setPlaying(false);
    } else {
      const from = p.getCurrentTime();
      p.play(from >= total ? 0 : from);
      setPlaying(true);
    }
  };
  useEffect(() => player.current?.setConfig({ speed: Number(speed) }), [speed]);
  // The clock, while it plays.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 66) {
        last = t;
        setNow(Math.min(total, player.current?.getCurrentTime() ?? 0));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, total]);

  // The moment playback is at: the last one at or before it.
  const at = useMemo(() => {
    let i = -1;
    for (let k = 0; k < list.length && list[k]!.at <= now; k++) i = k;
    return i;
  }, [list, now]);

  // Narrow (a phone): the moments go under the replay, not beside it.
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (!root) return;
    const seen = new ResizeObserver(() => setNarrow(root.clientWidth < 640));
    seen.observe(root);
    return () => seen.disconnect();
  }, [root]);

  return (
    <div ref={setRoot} className={cn("flex min-h-0 flex-1", narrow && "flex-col")}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Stage
          events={data.events}
          speed={Number(speed)}
          start={start}
          onPlayer={(p) => (player.current = p)}
          onFinish={() => {
            setPlaying(false);
            setNow(total);
          }}
          label={`Recording · ${time(t0 + now)}`}
        />
        <Timeline total={total} now={now} playing={playing} speed={speed} list={list} onToggle={toggle} onSeek={seek} onSpeed={setSpeed} />
      </div>
      <Moments narrow={narrow} list={list} at={at} picked={picked} follow={playing} onPick={(m) => seek(m.at, m)} data={data} save={save} now={now} t0={t0} />
    </div>
  );
}

/** The recorded page, scaled to fit, in a plain frame that says it is a recording. */
function Stage({ events, speed, start, onPlayer, onFinish, label }: { events: Event[]; speed: number; start: number; onPlayer(p: Replayer | null): void; onFinish(): void; label: string }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState(() => {
    const meta = events.find((e) => e.type === 4)?.data as { width?: number; height?: number } | undefined;
    return { width: meta?.width ?? 1280, height: meta?.height ?? 800 };
  });
  const [room, setRoom] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!host) return;
    const p = new Replayer(events, {
      root: host,
      speed,
      skipInactive: false,
      mouseTail: false,
      triggerFocus: false,
      showWarning: false,
      UNSAFE_replayCanvas: false,
      // A paused replay pauses CSS animations where they are: abyme's fade-ins stay at opacity 0
      // and the page shows blank. Each animation and transition ends at once instead, so a frame
      // is where the page was headed (a fade-in shown, a fade-out gone).
      insertStyleRules: [
        "html *, html *::before, html *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; }",
      ],
    });
    p.on("resize", (s) => {
      const d = s as { width?: number; height?: number } | undefined;
      if (d?.width && d?.height) setSize({ width: d.width, height: d.height });
    });
    p.on("finish", onFinish);
    p.wrapper.style.transformOrigin = "0 0";
    p.pause(start);
    onPlayer(p);
    return () => {
      onPlayer(null);
      p.destroy();
    };
  }, [host, events]);

  useEffect(() => {
    if (!box) return;
    const seen = new ResizeObserver(() => setRoom({ width: box.clientWidth, height: box.clientHeight }));
    seen.observe(box);
    return () => seen.disconnect();
  }, [box]);

  // Room for the label above the frame, and a margin round it.
  const scale = room.width && room.height ? Math.min(1, (room.width - 32) / size.width, (room.height - 56) / size.height) : 0;
  useEffect(() => {
    const w = host?.firstElementChild as HTMLElement | null;
    if (w) w.style.transform = `scale(${scale})`;
  }, [host, scale, size]);

  return (
    <div ref={setBox} className="relative flex min-h-0 flex-1 flex-col items-center justify-center" style={{ background: "var(--muted)" }}>
      <div style={{ width: size.width * scale, visibility: scale ? "visible" : "hidden" }}>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ marginBottom: 6 }} data-replay-label>
          <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "var(--destructive)" }} />
          <span className="tabular-nums">{label}</span>
          <span className="ml-auto tabular-nums">
            {size.width}×{size.height}
            {scale < 1 && ` at ${Math.round(scale * 100)}%`}
          </span>
        </div>
        <div
          ref={setHost}
          data-replay-frame
          className="overflow-hidden rounded-md"
          style={{ width: size.width * scale, height: size.height * scale, border: "1px solid var(--border-strong)", background: "var(--background)", boxShadow: "0 1px 3px var(--shadow)", pointerEvents: "none" }}
        />
      </div>
    </div>
  );
}

function Timeline({
  total,
  now,
  playing,
  speed,
  list,
  onToggle,
  onSeek,
  onSpeed,
}: {
  total: number;
  now: number;
  playing: boolean;
  speed: Speed;
  list: Moment[];
  onToggle(): void;
  onSeek(at: number, m?: Moment): void;
  onSpeed(s: Speed): void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const pct = (t: number) => `${total ? (t / total) * 100 : 0}%`;
  const fromPointer = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    return ((x - r.left) / r.width) * total;
  };
  const drag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-replay-mark]")) return;
    onSeek(fromPointer(e.clientX));
    const move = (m: PointerEvent) => onSeek(fromPointer(m.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const marks = list.filter((m) => MARKED.has(m.kind));
  return (
    <div className="flex shrink-0 items-center gap-3 border-t px-3" style={{ height: 52 }} data-replay-timeline>
      <Button variant="ghost" size="icon-sm" onClick={onToggle} aria-label={playing ? "Pause" : "Play"} data-replay-play>
        {playing ? <I.Pause className="size-4" /> : <I.Play className="size-4" />}
      </Button>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums" style={{ minWidth: 72 }}>
        {clock(now)} / {clock(total)}
      </span>
      <div ref={track} onPointerDown={drag} className="relative min-w-0 flex-1 cursor-pointer" style={{ height: 28 }} data-replay-track>
        <div className="absolute rounded-full" style={{ left: 0, right: 0, top: 12, height: 4, background: "var(--muted)" }} />
        <div className="absolute rounded-full" style={{ left: 0, width: pct(now), top: 12, height: 4, background: "var(--muted-foreground)" }} />
        {marks.map((m, i) => (
          <button
            key={i}
            type="button"
            data-replay-mark={m.kind}
            title={`${clock(m.at)} · ${m.title}`}
            onClick={() => onSeek(m.at, m)}
            className="absolute rounded-full"
            style={{
              left: pct(m.at),
              top: m.kind === "terminal" ? 9 : 5,
              width: m.kind === "terminal" ? 3 : 4,
              height: m.kind === "terminal" ? 10 : 18,
              marginLeft: -2,
              background: LOOK[m.kind].color,
              opacity: m.kind === "terminal" ? 0.7 : 1,
            }}
          />
        ))}
        <div className="absolute rounded-full" style={{ left: pct(now), top: 7, width: 14, height: 14, marginLeft: -7, background: "var(--background)", border: "2px solid var(--foreground)", pointerEvents: "none" }} />
      </div>
      <ToggleGroup type="single" value={speed} onValueChange={(v) => v && onSpeed(v as Speed)} aria-label="Speed" className="shrink-0">
        {SPEEDS.map((s) => (
          <ToggleGroupItem key={s} value={s} className="h-7 px-2 text-xs tabular-nums" aria-label={`${s}×`}>
            {s}×
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

/** Every moment, in time, the one playback is at lit; a click seeks to it. */
function Moments({
  narrow,
  list,
  at,
  picked,
  follow,
  onPick,
  data,
  save,
  now,
  t0,
}: {
  narrow: boolean;
  list: Moment[];
  at: number;
  picked: Moment | null;
  follow: boolean;
  onPick(m: Moment): void;
  data: Loaded;
  save?: Save;
  now: number;
  t0: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!follow || at < 0) return;
    scroller.current?.querySelector(`[data-moment="${at}"]`)?.scrollIntoView({ block: "nearest" });
  }, [at, follow]);
  return (
    <div className={cn("flex min-h-0 shrink-0 flex-col bg-sidebar text-sidebar-foreground", narrow ? "border-t" : "border-l")} style={narrow ? { height: "40%" } : { width: 320 }} data-replay-moments>
      <div className="flex shrink-0 items-center gap-2 border-b px-3" style={{ height: 40 }}>
        <span className="text-xs font-medium text-muted-foreground">{list.length} moments</span>
        <span className="ml-auto" />
        <SendToAgent data={data} save={save} moment={picked} now={now} t0={t0} />
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto" style={{ padding: "4px 6px" }}>
        {list.map((m, i) => {
          const look = LOOK[m.kind];
          const lit = i === at;
          return (
            <button
              key={i}
              type="button"
              data-moment={i}
              data-moment-kind={m.kind}
              data-lit={lit || undefined}
              onClick={() => onPick(m)}
              className={cn(sideRow, "items-start", lit && "bg-sidebar-accent")}
              style={{ height: "auto", paddingBlock: 6, ...(picked === m ? { boxShadow: "inset 2px 0 0 var(--primary)" } : {}) }}
            >
              <look.icon className="size-3.5 shrink-0" style={{ color: look.color, marginTop: 2 }} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate", m.kind === "error" && "font-medium")} style={m.kind === "error" ? { color: "var(--destructive)" } : undefined}>
                  {m.title}
                </span>
                {line(m) && <span className="truncate text-xs text-muted-foreground">{line(m)}</span>}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums" style={{ marginTop: 2 }}>
                {clock(m.at)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const recent = (a: Agent, b: Agent) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "") || a.label.localeCompare(b.label);

/** A moment's detail in one line: an error's top frame (its stack's first line is its message). */
const line = (m: Moment) => (m.kind === "error" ? m.detail?.split("\n")[1]?.trim() : m.detail?.split("\n")[0]);

/** The save and the moment picked (or playback's), as an agent is to read it. */
function brief(data: Loaded, save: Save | undefined, moment: Moment | null, now: number, t0: number) {
  const at = moment?.at ?? now;
  const detail = moment && line(moment);
  return [
    `Look at this UI recording of abyme (rrweb): ${data.name}${save ? ` (${save.path})` : ""}.`,
    `It was ${data.reason === "asked" ? "saved with the key" : `saved for ${data.reason}`}, page ${data.label}.`,
    moment
      ? `The moment: ${clock(at)} in (${time(t0 + at)}), event #${moment.index}: ${moment.title}${detail ? `, ${detail}` : ""}.`
      : `The moment: ${clock(at)} in (${time(t0 + at)}, timestamp ${t0 + at}).`,
    `Read it with replay_read name=${data.name}${moment ? ` from=${Math.max(0, moment.index - 20)}` : ""}.`,
  ].join("\n");
}

function SendToAgent({ data, save, moment, now, t0 }: { data: Loaded; save?: Save; moment: Moment | null; now: number; t0: number }) {
  const [open, setOpen] = useState(false);
  // In a tab of its own: the replay stays open beside it.
  const toNew = () => layout.open({ view: "new-agent", params: { brief: brief(data, save, moment, now, t0) } }, { target: "tab", focus: true });
  const toAgent = (id: string) => {
    chat?.compose(id, { text: brief(data, save, moment, now, t0) });
    chat?.open(id, { target: "tab", focus: true });
  };
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" data-replay-send>
          <I.Send className="size-3.5" />
          Send to agent
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ maxHeight: 420, minWidth: 240 }}>
        <DropdownMenuLabel className="text-xs text-muted-foreground">{moment ? `${moment.title} at ${clock(moment.at)}` : `At ${clock(now)}`}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={toNew} className="gap-2 text-xs" data-replay-send-new>
          <I.Plus className="size-3.5" />
          New agent
        </DropdownMenuItem>
        {open && chat && agents && <Agents store={agents.store} onPick={toAgent} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The agents to send to, most recently active first: read only while the menu is open. */
function Agents({ store, onPick }: { store: NonNullable<typeof agents>["store"]; onPick(id: string): void }) {
  const byId = useStore(store, (s) => s.agents);
  const all = Object.values(byId).sort(recent).slice(0, 12);
  if (!all.length) return null;
  return (
    <>
      <DropdownMenuSeparator />
      {all.map((a) => (
        <DropdownMenuItem key={a.id} onSelect={() => onPick(a.id)} className="gap-2 text-xs" data-replay-send-agent={a.id}>
          <I.Bot className="size-3.5 text-muted-foreground" />
          <span className="truncate">{a.label}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
}
