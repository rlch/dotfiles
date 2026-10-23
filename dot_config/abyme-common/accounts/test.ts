// clodcurrent's selection and scoring tests (select.rs, usage.rs, usage_cache.rs), against pick.ts.
// Kept in the dotfiles source only (.chezmoiignore): `node dot_config/abyme/accounts/test.ts`.
import assert from "node:assert/strict";
import { best, binding, errorWins, expirePast, family, loginOf, parse, parseModels, rowsSeen, score, staleOk, takePushes, windowSaid, type Family, type Folder, type ModelWindow, type Read, type Row, type Spent, type Usage } from "./pick.ts";

const NOW = Date.parse("2026-10-10T00:00:00Z");
const inDays = (d: number) => new Date(NOW + d * 86_400_000).toISOString();
const usage = (five: number, seven: number): Usage => ({ five, seven, fiveResets: null, sevenResets: null });
const weekly = (seven: number, days: number): Usage => ({ five: 0, seven, fiveResets: null, sevenResets: inDays(days) });
const row = (slug: string, u: [number, number] | Usage | null, o: { busy?: boolean; key?: string; windows?: ModelWindow[]; spent?: string } = {}): Row => ({
  slug,
  key: o.key ?? `uuid-${slug}`,
  usage: u === null ? null : Array.isArray(u) ? usage(u[0], u[1]) : u,
  windows: o.windows ?? [],
  busy: o.busy ?? false,
  spent: o.spent ?? null,
});
const fable = (utilization: number | null): ModelWindow[] => [{ name: "Fable", family: "fable", utilization, resetsAt: "2026-10-12T00:00:00Z" }];
const picks = (rows: Row[], f: Family | null = null) => {
  const out = best(rows, f, NOW);
  return out.pick === null ? null : rows[out.pick]!.slug;
};
const cases: [string, () => void][] = [];
const test = (name: string, f: () => void) => cases.push([name, f]);

// usage.rs
test("expiring soon outscores same usage with time left", () => assert.ok(score(weekly(10, 1), NOW) > score(weekly(10, 6), NOW)));
test("behind pace beats fresher account with more time", () => assert.ok(score(weekly(60, 1), NOW) > score(weekly(10, 6), NOW)));
test("on pace is neutral", () => assert.ok(Math.abs(score(weekly(50, 3.5), NOW) - score({ ...weekly(50, 3.5), sevenResets: null }, NOW)) < 0.5));
test("ahead of pace is backed off", () => assert.ok(score(weekly(80, 6), NOW) < score(weekly(50, 3.5), NOW)));
test("nearly exhausted weekly stays gated even when expiring", () => assert.ok(score(weekly(97, 1 / 24), NOW) < score(weekly(50, 3.5), NOW)));

// select.rs
test("picks account with most remaining", () => assert.equal(picks([row("a", [80, 50]), row("b", [20, 50])]), "b"));
test("prefers account whose weekly quota expires soonest", () =>
  assert.equal(picks([row("a", { ...usage(10, 10), sevenResets: inDays(6) }), row("b", { ...usage(10, 10), sevenResets: inDays(1) })]), "b"));
test("avoids in-use account", () => assert.equal(picks([row("a", [10, 10], { busy: true }), row("b", [40, 40])]), "b"));
test("skips rate-limited when usable exists", () => assert.equal(picks([row("a", [100, 0]), row("b", [50, 50])]), "b"));
test("prefers busy usable over free capped", () => assert.equal(picks([row("capped-free", [100, 50]), row("busy-usable", [30, 30], { busy: true })]), "busy-usable"));
test("never a capped account: the refusal names the first back", () => {
  const rows = [row("a", { ...usage(100, 0), fiveResets: inDays(0.2) }), row("b", { ...usage(100, 80), fiveResets: inDays(0.1) }), row("c", [0, 0], { spent: inDays(0.3) })];
  assert.equal(picks(rows), null);
  assert.equal(best(rows, null, NOW).why, `every account is capped; the first back is b at ${inDays(0.1)}`);
  assert.equal(picks([row("a", [10, 10], { spent: inDays(1) }), row("b", [100, 0], { busy: true })]), null);
});
test("falls back to best when all busy", () => assert.equal(picks([row("a", [10, 10], { busy: true }), row("b", [40, 40], { busy: true })]), "a"));
test("skips unavailable accounts", () => assert.equal(picks([row("a", null), row("b", [90, 90])]), "b"));
test("none when all unavailable", () => assert.equal(picks([row("a", null), row("b", null)]), null));
test("weekly exhausted free account is not best", () => assert.equal(picks([row("weekly-dead", [0, 100]), row("busy-usable", [30, 30], { busy: true })]), "busy-usable"));
test("duplicate dir is busy when its twin is in session", () =>
  assert.equal(picks([row("dup1", [10, 10], { key: "shared", busy: true }), row("dup2", [10, 10], { key: "shared" }), row("b", [40, 40])]), "b"));

// select.rs, model-aware
test("generic headroom does not rescue an exhausted fable window", () => {
  const rows = [row("fresh", [5, 10], { windows: fable(100) }), row("worn", [60, 60], { windows: fable(40) })];
  assert.equal(picks(rows, "fable"), "worn");
  assert.equal(picks(rows, null), "fresh");
});
test("tighter fable window binds the score", () => assert.equal(picks([row("a", [10, 10], { windows: fable(90) }), row("b", [10, 10], { windows: fable(30) })], "fable"), "b"));
test("every fable window exhausted is a refusal", () => {
  const rows = [row("a", [0, 0], { windows: fable(100) }), row("b", [0, 0], { windows: fable(100) }), row("c", null)];
  assert.equal(picks(rows, "fable"), null);
  assert.match(best(rows, "fable", NOW).why, /fable window is spent/);
  assert.notEqual(picks(rows, null), null);
});
test("missing or null fable window falls back to generic limits", () => assert.equal(picks([row("no-window", [50, 50]), row("null-window", [10, 10], { windows: fable(null) })], "fable"), "null-window"));
test("live-account rules still apply within the fable pool", () => {
  assert.equal(picks([row("idle-spent", [0, 0], { windows: fable(100) }), row("busy-ok", [30, 30], { busy: true, windows: fable(30) })], "fable"), "busy-ok");
  assert.equal(picks([row("busy-fresh", [0, 0], { busy: true, windows: fable(0) }), row("idle-ok", [30, 30], { windows: fable(30) })], "fable"), "idle-ok");
});
test("non-fable request ignores fable exhaustion", () => assert.equal(picks([row("fable-spent", [5, 10], { windows: fable(100) }), row("other", [50, 50], { windows: fable(0) })], "opus"), "fable-spent"));

// account-usage-accurate (2026-10-23)
const HSONE_BACK = "2026-10-25T11:00:00.000Z";
test("a week-capped login with 5h at 0 is never picked before its 7d reset", () => {
  const hsone: Usage = { five: 0, seven: 100, fiveResets: null, sevenResets: HSONE_BACK };
  assert.deepEqual(binding(hsone), { window: "seven", resets: HSONE_BACK });
  assert.equal(picks([row("hsone", hsone), row("b", [95, 99], { busy: true })]), "b");
  assert.match(best([row("hsone", hsone)], null, NOW).why, /first back is hsone at 2026-10-25T11:00/);
  const seen = rowsSeen([{ slug: "hsone", dir: "/h/.claude-hsone", key: "u1" }], new Map([["u1", { at: NOW, usage: hsone, windows: [] }]]), new Map(), new Map(), NOW)[0]!;
  assert.deepEqual([seen.capped, seen.binding, seen.back], [true, "seven", HSONE_BACK]);
});
test("the binding window", () => {
  assert.equal(binding(usage(99, 99)), null);
  assert.deepEqual(binding({ ...usage(100, 50), fiveResets: inDays(0.1) }), { window: "five", resets: inDays(0.1) });
  assert.deepEqual(binding({ five: 100, seven: 100, fiveResets: inDays(0.1), sevenResets: inDays(2) }), { window: "seven", resets: inDays(2) });
  assert.equal(windowSaid("You've hit your weekly limit"), "seven");
  assert.equal(windowSaid("5-hour limit reached"), "five");
  assert.equal(windowSaid("Claude AI usage limit reached"), null);
});
test("a stale read near its cap is unknown", () => {
  assert.equal(staleOk(usage(50, 50), 10 * 60_000), true);
  assert.equal(staleOk(usage(50, 50), 31 * 60_000), false);
  assert.equal(staleOk(usage(90, 10), 60_000), false);
  assert.equal(staleOk(usage(10, 93), 60_000), false);
});
test("one row per login, every folder of it, main first", () => {
  const folders: Folder[] = [
    { slug: "main", dir: "/h/.claude", key: "u-main" },
    { slug: "hsone", dir: "/h/.claude-hsone", key: "u1" },
    { slug: "tuteroai", dir: "/h/.claude-tuteroai", key: "u1" },
  ];
  const rows = rowsSeen(folders, new Map(), new Map(), new Map([["/h/.claude-hsone", 1], ["/h/.claude-tuteroai", 2]]), NOW);
  assert.deepEqual(rows.map((r) => [r.slugs, r.agents, r.error, r.read]), [
    [["main"], 0, null, null],
    [["hsone", "tuteroai"], 3, null, null],
  ]);
});
test("a folder signed in again as another login: its row, quota, spent mark and pick follow the new uuid", () => {
  const was = loginOf(JSON.stringify({ oauthAccount: { emailAddress: "hs@one", accountUuid: "u1" } }))!;
  const now = loginOf(JSON.stringify({ oauthAccount: { emailAddress: "tutero.ai@gmail.com", accountUuid: "u2" } }))!;
  assert.deepEqual([was.key, now.key, loginOf("{}"), loginOf("not json")], ["u1", "u2", null, null]);
  const reads = new Map<string, Read>([
    ["u1", { at: NOW, usage: { five: 0, seven: 100, fiveResets: null, sevenResets: HSONE_BACK }, windows: [] }],
    ["u2", { at: NOW, usage: usage(20, 30), windows: [] }],
  ]);
  const spent = new Map<string, Spent>([["u1", { until: Date.parse(HSONE_BACK), window: "seven" }]]);
  const before: Folder[] = [{ slug: "hsone", dir: "/h/.claude-hsone", key: was.key }, { slug: "tuteroai", dir: "/h/.claude-tuteroai", key: was.key }];
  const after: Folder[] = [before[0]!, { ...before[1]!, key: now.key }];
  assert.deepEqual(rowsSeen(before, reads, spent, new Map(), NOW).map((r) => [r.slugs, r.capped]), [[["hsone", "tuteroai"], true]]);
  const rows = rowsSeen(after, reads, spent, new Map([["/h/.claude-tuteroai", 1]]), NOW);
  assert.deepEqual(rows.map((r) => [r.slugs, r.five, r.capped, r.agents]), [
    [["hsone"], 0, true, 0],
    [["tuteroai"], 20, false, 1],
  ]);
  const pickRows = (fs: Folder[]) => fs.map((f) => { const r = reads.get(f.key)!; return row(f.slug, "usage" in r ? r.usage : null, { key: f.key, spent: spent.has(f.key) ? HSONE_BACK : undefined }); });
  assert.equal(picks(pickRows(before)), null);
  assert.equal(picks(pickRows(after)), "tuteroai");
});
test("a push newer than the read wins, an older one does not, a rejected one says its reset", () => {
  const at = (ms: number) => new Date(ms).toISOString();
  const kept = { at: NOW, data: { five_hour: { utilization: 10, resets_at: inDays(0.1) }, seven_day: { utilization: 80, resets_at: inDays(2) } } };
  assert.equal(takePushes(kept, [{ window: "seven_day", state: "warning", utilization: 95, resets_at: inDays(2), at: at(NOW - 1000) }], 0), null);
  const next = takePushes(kept, [
    { window: "seven_day", state: "rejected", utilization: 100, resets_at: inDays(2), at: at(NOW + 2000) },
    { window: "seven_day_opus", state: "rejected", utilization: 100, resets_at: inDays(3), at: at(NOW + 3000) },
    { window: "five_hour", state: "allowed", utilization: 12, resets_at: null, at: at(NOW + 1000) },
  ], 0)!;
  assert.equal(next.at, NOW + 2000);
  assert.deepEqual(parse(next.data), { five: 12, seven: 100, fiveResets: inDays(0.1), sevenResets: inDays(2) });
  assert.deepEqual(next.rejected, [{ window: "seven", resets: inDays(2) }]);
  // Heard again after it was taken: nothing.
  assert.equal(takePushes({ at: next.at, data: next.data }, [{ window: "seven_day", state: "rejected", utilization: 100, resets_at: inDays(2), at: at(NOW + 2000) }], next.at), null);
});

// model.rs
test("families", () => {
  assert.equal(family("fable"), "fable");
  assert.equal(family("best"), "fable");
  assert.equal(family("opus[1m]"), "opus");
  assert.equal(family("opusplan"), "opus");
  assert.equal(family("claude-sonnet-5-5"), "sonnet");
  assert.equal(family("us.anthropic.claude-fable-5-1"), "fable");
  assert.equal(family("default"), null);
  assert.equal(family(""), null);
  assert.equal(family("gpt-5"), "other");
});

// usage.rs's live shape, and usage_cache.rs
test("the live answer's windows", () => {
  const data = {
    five_hour: { utilization: 2.0, resets_at: "2026-09-20T21:20:00.782100+00:00" },
    seven_day: { utilization: 42.0, resets_at: "2026-09-22T10:00:00.782121+00:00" },
    seven_day_opus: null,
    seven_day_sonnet: null,
    limits: [
      { group: "session", kind: "session", percent: 2, scope: null, resets_at: "2026-09-20T21:20:00.782100+00:00" },
      { group: "weekly", kind: "weekly_all", percent: 42, scope: null, resets_at: "2026-09-22T10:00:00.782121+00:00" },
      { group: "weekly", kind: "weekly_scoped", percent: 50, resets_at: "2026-09-22T09:59:59.782307+00:00", scope: { model: { display_name: "Fable", id: "x" }, surface: null } },
    ],
  };
  assert.deepEqual(parse(data), { five: 2, seven: 42, fiveResets: data.five_hour.resets_at, sevenResets: data.seven_day.resets_at });
  const w = parseModels(data);
  assert.equal(w.length, 1);
  assert.deepEqual(w[0], { name: "Fable", family: "fable", utilization: 50, resetsAt: "2026-09-22T09:59:59.782307+00:00" });
});
test("a window whose reset has passed is zeroed", () => {
  const out = expirePast(
    {
      five_hour: { utilization: 100, resets_at: "2026-09-23T02:40:00Z" },
      seven_day: { utilization: 40, resets_at: "2026-09-29T00:00:00Z" },
      limits: [{ utilization: 90, resets_at: "2026-09-23T01:00:00Z" }],
    },
    Date.parse("2026-09-23T03:00:00Z"),
  ) as { five_hour: { utilization: number }; seven_day: { utilization: number }; limits: { utilization: number }[] };
  assert.equal(out.five_hour.utilization, 0);
  assert.equal(out.seven_day.utilization, 40);
  assert.equal(out.limits[0]!.utilization, 0);
});

// server.ts's showCached
test("an error read after the answer kept is shown", () => {
  assert.equal(errorWins({ at: 1 }, { at: 2, error: "signed out" }), true);
  assert.equal(errorWins(undefined, { at: 2, error: "signed out" }), true);
  assert.equal(errorWins({ at: 3 }, { at: 2, error: "unreachable" }), false);
  assert.equal(errorWins({ at: 1 }, { at: 2 }), false);
  assert.equal(errorWins({ at: 1 }, undefined), false);
});

let failed = 0;
for (const [name, f] of cases)
  try {
    f();
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${(e as Error).message}`);
  }
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
