// A save's text once gunzipped, for both halves: JSON lines (its head, then an event a line), or
// the one JSON object saves were before 2026-10-15.
import type { Head } from "./api.server.ts";

export const SAVE = /^[\w.-]+\.jsonl?\.gz$/;

export function parseSave(text: string): Head & { events: { type: number; timestamp: number; data: any }[] } {
  if (text.startsWith('{"replay"')) {
    const lines = text.split("\n");
    const head = JSON.parse(lines[0]!) as Head;
    const css = head.css ?? {};
    // A stylesheet is kept once, in the head, and named by hash where rrweb had it.
    const put = (line: string) => (line.includes('"replay-css:') ? line.replace(/"replay-css:([0-9a-f]{64})"/g, (ref, h: string) => (h in css ? JSON.stringify(css[h]) : ref)) : line);
    const events = [];
    for (let i = 1; i < lines.length; i++) if (lines[i]) events.push(JSON.parse(put(lines[i]!)));
    delete head.css;
    return { ...head, events };
  }
  const old = JSON.parse(text);
  return { replay: 1, minutes: 0, ...old };
}
