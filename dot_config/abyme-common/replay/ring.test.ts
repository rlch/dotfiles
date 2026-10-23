// ring.ts's bounds: `node --test ring.test.ts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GONE_MS, Ring } from "./ring.ts";

const MIN = 60_000;
const line = (n: number) => JSON.stringify({ type: 3, n });

test("a checkout closes the open segment and starts the next", () => {
  const r = new Ring({ keepMs: 15 * MIN, memory: 1e9 });
  r.append("a", "desktop-chat", true, [line(1)], [], 1000, 1000);
  r.append("a", "", false, [line(2)], [], 2000, 2000);
  r.append("a", "", true, [line(3)], [], 3000, 3000);
  const segs = r.pages.get("a")!.segments;
  assert.deepEqual(segs.map((s) => [s.start, s.end]), [[1000, 3000], [3000, null]]);
  assert.equal(r.pages.get("a")!.label, "desktop-chat");
});

test("events before a page's first checkout are dropped", () => {
  const r = new Ring({ keepMs: 15 * MIN, memory: 1e9 });
  r.append("a", "x", false, [line(1)], [], 1000, 1000);
  assert.equal(r.pages.get("a")!.segments.length, 0);
  assert.equal(r.size, 0);
});

test("a save across a checkout takes from the checkout at or before the cut", () => {
  const r = new Ring({ keepMs: 15 * MIN, memory: 1e9 });
  r.append("a", "x", true, [line(1)], [], 0, 0);
  r.append("a", "x", true, [line(2)], [], 5 * MIN, 5 * MIN);
  r.append("a", "x", true, [line(3)], [], 10 * MIN, 10 * MIN);
  // Cut at 7 minutes: the segment 5-10 holds it, and the open one follows.
  assert.equal(r.take("a", 7 * MIN)!.text, `${line(2)}\n${line(3)}\n`);
  assert.equal(r.take("a", 0)!.text, `${line(1)}\n${line(2)}\n${line(3)}\n`);
  assert.equal(r.take("b", 0), null);
});

test("a page gone three minutes is closed, kept, and ages out past keep", () => {
  const r = new Ring({ keepMs: 15 * MIN, memory: 1e9 });
  r.append("a", "x", true, [line(1)], [], 0, 1000);
  r.sweep(1000 + GONE_MS - 1);
  assert.equal(r.pages.get("a")!.segments[0]!.end, null);
  r.sweep(1000 + GONE_MS + 1);
  assert.equal(r.pages.get("a")!.segments[0]!.end, 1000);
  assert.ok(r.take("a", 0));
  r.sweep(1000 + 15 * MIN + 1);
  assert.equal(r.pages.has("a"), false);
  assert.equal(r.size, 0);
});

test("a closed segment older than keep goes, the open one never", () => {
  const r = new Ring({ keepMs: 15 * MIN, memory: 1e9 });
  r.append("a", "x", true, [line(1)], [], 0, 0);
  r.append("a", "x", true, [line(2)], [], 1 * MIN, 1 * MIN);
  r.append("a", "x", false, [line(3)], [], 20 * MIN, 20 * MIN);
  r.sweep(20 * MIN);
  assert.deepEqual(r.pages.get("a")!.segments.map((s) => s.start), [1 * MIN]);
});

test("the memory cap drops the oldest closed segment of any page, never a page's last", () => {
  const big = "x".repeat(100);
  const r = new Ring({ keepMs: 60 * MIN, memory: 350 });
  r.append("a", "x", true, [big], [], 0, 0);
  r.append("b", "y", true, [big], [], 1, 1);
  r.append("a", "x", true, [big], [], 2, 2);
  // 303 held: under the cap.
  assert.equal(r.size, 303);
  r.append("b", "y", true, [big], [], 3, 3);
  // Past it: a's first (the oldest closed) goes; b's first is next oldest, under the cap again.
  assert.deepEqual(r.pages.get("a")!.segments.map((s) => s.start), [2]);
  assert.deepEqual(r.pages.get("b")!.segments.map((s) => s.start), [1, 3]);
  r.append("b", "y", false, [big, big, big], [], 4, 4);
  // Far past it: everything closed goes, and each page's last stays.
  assert.deepEqual(r.pages.get("a")!.segments.map((s) => s.start), [2]);
  assert.deepEqual(r.pages.get("b")!.segments.map((s) => s.start), [3]);
});

test("a stylesheet is held once, and goes with its last segment", () => {
  const r = new Ring({ keepMs: 15 * MIN, memory: 1e9 });
  const sheet = { hash: "h1", text: "body{}".repeat(200) };
  r.append("a", "x", true, [line(1)], [sheet], 0, 0);
  r.append("b", "y", true, [line(1)], [sheet], 0, 0);
  r.append("a", "x", false, [line(2)], [sheet], 1, 1);
  assert.equal(r.css.get("h1")!.uses, 2);
  assert.equal(r.size, 2 * (line(1).length + 1) + line(2).length + 1 + sheet.text.length);
  assert.deepEqual(r.take("a", 0)!.css, { h1: sheet.text });
  r.append("a", "x", true, [line(3)], [], 5 * MIN, 5 * MIN);
  r.append("b", "y", true, [line(3)], [], 5 * MIN, 5 * MIN);
  r.append("a", "x", false, [line(4)], [], 29 * MIN, 29 * MIN);
  r.append("b", "y", false, [line(4)], [], 29 * MIN, 29 * MIN);
  r.sweep(30 * MIN);
  assert.equal(r.css.has("h1"), false);
  assert.deepEqual(r.take("a", 0)!.css, {});
  assert.equal(r.size, 2 * (line(3).length + line(4).length + 2));
});
