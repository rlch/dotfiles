// clodcurrent's selection and scoring tests (select.rs, usage.rs, usage_cache.rs), against pick.ts.
// Kept in the dotfiles source only (.chezmoiignore): `node dot_config/abyme/accounts/test.ts`.
import assert from "node:assert/strict";
import { accountId, accountReady, accountStored, accountUrgent } from "./kind.ts";
import { keychainMade, resetSaid, tokenEnds, tokenFrom, tokensListed, tokenWarns, YEAR_MS, loadAccounts, best, binding, expirePast, family, lastAnswer, parse, parseModels, rowsSeen, said, score, takePushes, turnError, unified, warm, windowSaid, WARM_MS, type Account, type Family, type ModelWindow, type Read, type Row, type Usage } from "./pick.ts";

const NOW = Date.parse("2026-10-10T00:00:00Z");
const inDays = (d: number) => new Date(NOW + d * 86_400_000).toISOString();
const usage = (five: number, seven: number): Usage => ({ five, seven, fiveResets: null, sevenResets: null });
const weekly = (seven: number, days: number): Usage => ({ five: 0, seven, fiveResets: null, sevenResets: inDays(days) });
const row = (slug: string, u: [number, number] | Usage | null, o: { busy?: boolean; key?: string; windows?: ModelWindow[]; spent?: string; read?: number; said?: { five: number | null; seven: number | null }; agents?: number } = {}): Row => ({
  slug,
  key: o.key ?? `uuid-${slug}`,
  usage: u === null ? null : Array.isArray(u) ? usage(u[0], u[1]) : u,
  windows: o.windows ?? [],
  busy: o.busy ?? false,
  spent: o.spent ?? null,
  read: o.read ?? null,
  said: o.said,
  agents: o.agents,
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
// No harness has said anything of an account yet: it counts as unused, and its first turn reads it.
test("an account not read yet counts as half used", () => {
  assert.equal(picks([row("a", null), row("b", [90, 90])]), "a");
  assert.equal(picks([row("a", null), row("b", [20, 30])]), "b");
  assert.match(best([row("a", null)], null, NOW).why, /5h \? 7d \?/);
});
test("a window said with no number is unknown, half used, not 0%", () => {
  // samip: its harness said its 5 h with no number; tuteroai's 5 h is known at 30%.
  const unknown = row("samip", [0, 0], { read: NOW, said: { five: null, seven: null } });
  assert.equal(picks([unknown, row("tuteroai", [30, 40], { read: NOW, said: { five: 30, seven: 40 } })]), "tuteroai");
  assert.equal(picks([unknown, row("tuteroai", [80, 76], { read: NOW, said: { five: 80, seven: 76 } })]), "samip");
});
test("on a score tie the account with fewer agents wins", () => {
  // samip and vatsal read alike, every account busy: the one with fewer agents gets the next.
  const busy = (slug: string, agents: number) => row(slug, null, { busy: true, agents });
  assert.equal(picks([busy("samip", 5), busy("vatsal", 1)]), "vatsal");
  assert.equal(picks([busy("samip", 1), busy("vatsal", 6)]), "samip");
  // As many agents: the later, as before.
  assert.equal(picks([busy("samip", 2), busy("vatsal", 2)]), "vatsal");
  // Not a tie: the score wins, however many agents.
  assert.equal(picks([row("a", [10, 10], { busy: true, agents: 5 }), row("b", [60, 60], { busy: true, agents: 1 })]), "a");
});
test("none with no account", () => assert.equal(picks([]), null));
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
  const rows = [row("a", [0, 0], { windows: fable(100) }), row("b", [0, 0], { windows: fable(100) })];
  assert.equal(picks(rows, "fable"), null);
  assert.match(best(rows, "fable", NOW).why, /fable window is spent/);
  assert.notEqual(picks(rows, null), null);
  // An account not read yet may serve it: its windows are unknown, not spent.
  assert.equal(picks([...rows, row("c", null)], "fable"), "c");
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
  const seen = rowsSeen([{ slug: "hsone", dir: "/h/.claude-hsone", key: "u1" }], new Map([["u1", { at: NOW, usage: hsone, windows: [] }]]), new Map())[0]!;
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
test("capped is a window at 100, or a spent mark, until it resets", () => {
  const folders: Account[] = [{ slug: "main", key: "u-main" }, { slug: "tuteroai", key: "u2" }];
  const reads = new Map<string, Read>([
    ["u-main", { at: NOW, usage: { five: 1, seven: 60, fiveResets: inDays(0.1), sevenResets: inDays(5) }, windows: [] }],
    ["u2", { at: NOW, usage: { five: 100, seven: 16, fiveResets: inDays(0.1), sevenResets: inDays(5) }, windows: [] }],
  ]);
  assert.deepEqual(rowsSeen(folders, reads, new Map()).map((r) => [r.slugs[0], r.capped, r.binding, r.back]), [
    ["main", false, null, null],
    ["tuteroai", true, "five", inDays(0.1)],
  ]);
  // Past its reset the window reads 0, and the row is no longer capped.
  const past = { at: NOW, data: { five_hour: { utilization: 100, resets_at: inDays(-0.01) }, seven_day: { utilization: 16, resets_at: inDays(5) } } };
  const u = parse(expirePast(past.data, NOW));
  assert.equal(rowsSeen([folders[1]!], new Map([["u2", { at: NOW, usage: u, windows: [] }]]), new Map())[0]!.capped, false);
  // A spent mark keeps the login out of picks, and its row is capped until it ends, whatever its
  // read says: the account itself refused a turn (hsone, 2026-10-25).
  assert.equal(picks([row("main", [1, 60], { spent: inDays(0.04) }), row("b", [50, 50], { busy: true })]), "b");
  const marked = rowsSeen([folders[0]!], reads, new Map(), new Map([["u-main", { until: Date.parse(inDays(2)), window: "seven" as const }]]), NOW)[0]!;
  assert.deepEqual([marked.capped, marked.binding, marked.back], [true, "seven", inDays(2)]);
});
test("a read older than 5 h counts as unread, so the account is tried", () => {
  const ancient = NOW - 38 * 3600_000;
  // hsone read 89% of its week 38 h ago, and its week had reset: unread, half used, it is tried
  // before main at 5h 60% 7d 80%.
  assert.equal(picks([row("hsone", [0, 89], { read: ancient }), row("main", [60, 80], { read: NOW })]), "hsone");
  assert.match(best([row("hsone", [0, 89], { read: ancient })], null, NOW).why, /^free, 5h \? 7d \?/);
});
test("a stale read near its cap is tried last, and its row says stale", () => {
  const old = NOW - 2 * 3600_000;
  // hsone read 89% of its week 2 h ago; main is at 60% now.
  assert.equal(picks([row("hsone", [0, 89], { read: old }), row("main", [10, 60], { read: NOW })]), "main");
  // Busy elsewhere, it is still before a doubtful one; alone, the doubtful one is tried.
  assert.equal(picks([row("hsone", [0, 89], { read: old }), row("main", [10, 60], { read: NOW, busy: true })]), "main");
  assert.equal(picks([row("hsone", [0, 89], { read: old })]), "hsone");
  assert.match(best([row("hsone", [0, 89], { read: old })], null, NOW).why, /stale near its cap/);
  // Stale but far from its cap: as any other.
  assert.equal(picks([row("a", [0, 20], { read: old }), row("b", [10, 60], { read: NOW })]), "a");
  const rows = rowsSeen([{ slug: "hsone", key: "hsone" }, { slug: "main", key: "main" }], new Map([["hsone", { at: old, usage: usage(0, 89), windows: [] }], ["main", { at: NOW, usage: usage(10, 60), windows: [] }]]), new Map(), new Map(), NOW);
  assert.deepEqual(rows.map((r) => [r.slugs[0], r.stale]), [["hsone", true], ["main", false]]);
});
test("one row per account, in order, with its busy agents", () => {
  const accounts: Account[] = [
    { slug: "main", key: "main" },
    { slug: "hsone", key: "hsone" },
    { slug: "tuteroai", key: "tuteroai" },
  ];
  const rows = rowsSeen(accounts, new Map(), new Map([["hsone", 1], ["tuteroai", 2]]));
  assert.deepEqual(rows.map((r) => [r.slugs, r.agents, r.read]), [
    [["main"], 0, null],
    [["hsone"], 1, null],
    [["tuteroai"], 2, null],
  ]);
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
  // A refusal is a full window, whatever number came with it.
  const refused = takePushes(kept, [{ window: "five_hour", state: "rejected", utilization: null, resets_at: inDays(0.1), at: at(NOW + 1) }], 0)!;
  assert.equal(parse(refused.data).five, 100);
  // No read yet: the first push makes one, the window not said reading as unused, and a refusal says its reset.
  const bare = takePushes(undefined, [{ window: "five_hour", state: "rejected", utilization: 100, resets_at: inDays(0.1), at: at(NOW) }], 0)!;
  assert.deepEqual([parse(bare.data), bare.rejected], [{ five: 100, seven: 0, fiveResets: inDays(0.1), sevenResets: null }, [{ window: "five", resets: inDays(0.1) }]]);
  // Onto a read: the other window and the model windows are kept.
  const had = { at: NOW, data: { five_hour: { utilization: 80, resets_at: inDays(0.1) }, seven_day: { utilization: 40, resets_at: inDays(2) }, seven_day_opus: { utilization: 70, resets_at: inDays(2) } } };
  const onto = takePushes(had, [{ window: "seven_day", state: "allowed", utilization: 45, resets_at: null, at: at(NOW + 1000) }], 0)!;
  assert.deepEqual(parse(onto.data), { five: 80, seven: 45, fiveResets: inDays(0.1), sevenResets: inDays(2) });
  assert.equal(parseModels(onto.data)[0]!.utilization, 70);
  // A window said with no number, and none read: it stays unread.
  assert.equal(takePushes({ at: NOW, data: {} }, [{ window: "five_hour", state: "allowed", utilization: null, resets_at: null, at: at(NOW + 1) }], 0)!.data!.five_hour, undefined);
  // Heard again after it was taken: nothing.
  assert.equal(takePushes({ at: next.at, data: next.data }, [{ window: "seven_day", state: "rejected", utilization: 100, resets_at: inDays(2), at: at(NOW + 2000) }], next.at), null);
});

// Warm (2026-10-25): 388 of 394 cache rebuilds 5–60 min after a call came with an account change.
const resumed = (rows: Row[], last: { slug: string; at: number } | null, f: Family | null = null) => {
  const out = warm(rows, last, f, NOW) ?? best(rows, f, NOW);
  return out.pick === null ? null : rows[out.pick]!.slug;
};
test("taken up again within the hour, an agent stays on its account, busy and worn or not", () => {
  const rows = [row("a", [70, 60], { busy: true }), row("b", [5, 5])];
  assert.equal(picks(rows), "b");
  assert.equal(resumed(rows, { slug: "a", at: NOW - 40 * 60_000 }), "a");
  assert.match(warm(rows, { slug: "a", at: NOW - 40 * 60_000 }, null, NOW)!.why, /^warm, its last call 40 min ago/);
  // Past the hour its cache is gone: by quota.
  assert.equal(resumed(rows, { slug: "a", at: NOW - WARM_MS }), "b");
  assert.equal(resumed(rows, null), "b");
});
test("a warm agent leaves an account that is spent, capped, out for its model, or gone", () => {
  const at = NOW - 10 * 60_000;
  assert.equal(resumed([row("a", [10, 10], { spent: inDays(0.1) }), row("b", [50, 50])], { slug: "a", at }), "b");
  assert.equal(resumed([row("a", [100, 10]), row("b", [50, 50])], { slug: "a", at }), "b");
  assert.equal(resumed([row("a", [10, 100]), row("b", [50, 50])], { slug: "a", at }), "b");
  assert.equal(resumed([row("a", [10, 10], { windows: fable(100) }), row("b", [50, 50])], { slug: "a", at }, "fable"), "b");
  assert.equal(resumed([row("a", [10, 10], { windows: fable(100) }), row("b", [50, 50])], { slug: "a", at }, "opus"), "a");
  assert.equal(resumed([row("b", [50, 50])], { slug: "a", at }), "b");
});
test("a transcript's last answer: the model's last line, no subagent's, none made up, not what exit wrote", () => {
  const line = (o: object) => JSON.stringify(o);
  const lines = [
    line({ type: "assistant", timestamp: "2026-10-24T15:00:00.000Z", message: { model: "claude-opus-5-5" } }),
    line({ type: "user", timestamp: "2026-10-24T15:01:00.000Z" }),
    line({ type: "assistant", isSidechain: true, timestamp: "2026-10-24T15:02:00.000Z", message: { model: "claude-sonnet-5-5" } }),
    line({ type: "assistant", timestamp: "2026-10-24T15:03:00.000Z", message: { model: "<synthetic>" } }),
    line({ type: "cost-state", sessionId: "s" }),
    line({ type: "last-prompt", leafUuid: "u", sessionId: "s" }),
    "",
  ];
  assert.equal(lastAnswer(lines), Date.parse("2026-10-24T15:00:00.000Z"));
  assert.equal(lastAnswer(['nt":"assistant" half a line', ...lines.slice(1)]), null);
  assert.equal(lastAnswer([]), null);
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
// load's accounts: one per login, null kept null, capped on the binding window.
test("load's accounts", () => {
  const seen = [
    { slugs: ["hsone", "tuteroai"], five: 0, seven: 100, fiveResets: null, sevenResets: "2026-10-25T11:00:00.000Z", windows: [], capped: true, binding: "seven" as const, back: null, spent: null, read: null, agents: 0 },
    { slugs: ["main"], five: null, seven: 74, fiveResets: "2026-10-23T17:30:00.000Z", sevenResets: null, windows: [], capped: false, binding: null, back: null, spent: null, read: null, agents: 2 },
  ];
  const [h, m] = loadAccounts(seen);
  assert.equal(h!.id, "hsone,tuteroai");
  assert.deepEqual(h!.folders, ["hsone", "tuteroai"]);
  assert.deepEqual(h!.windows.map((w) => [w.name, w.used, w.capped]), [["5h", 0, false], ["week", 1, true]]);
  assert.equal(h!.windows[1]!.resets, Date.parse("2026-10-25T11:00:00.000Z"));
  assert.equal(m!.windows[0]!.used, null);
  assert.equal(m!.windows[1]!.resets, null);
});

// A spent mark: the row's `spent`, never its cap; load counts that window capped until the mark ends.
test("a spent mark is the row's spent, and load's cap until it ends", () => {
  const until = Date.parse("2026-10-25T11:00:00Z");
  const reads = new Map<string, Read>([["hsone", { at: NOW, usage: { five: 0, seven: 88, fiveResets: null, sevenResets: "2026-10-29T02:00:00.000Z" }, windows: [] }]]);
  const [week] = rowsSeen([{ slug: "hsone", key: "hsone" }], reads, new Map(), new Map([["hsone", { until, window: "seven" as const }]]));
  assert.deepEqual([week!.capped, week!.spent], [true, { until: "2026-10-25T11:00:00.000Z", window: "seven" }]);
  const [w] = loadAccounts([week!]);
  assert.deepEqual(w!.windows.map((x) => [x.name, x.capped, x.resets]), [["5h", false, null], ["week", true, until]]);
  // A mark naming no window caps the five hours; with none, nothing is capped.
  const [none] = rowsSeen([{ slug: "hsone", key: "hsone" }], reads, new Map(), new Map([["hsone", { until, window: null }]]));
  assert.deepEqual(loadAccounts([none!])[0]!.windows.map((x) => x.capped), [true, false]);
  assert.deepEqual(loadAccounts(rowsSeen([{ slug: "hsone", key: "hsone" }], reads, new Map()))[0]!.windows.map((x) => x.capped), [false, false]);
});

// The reset a refusal names, in its own zone: the next such time.
test("the reset a limit message names", () => {
  const at = Date.parse("2026-10-25T03:15:00Z"); // 14:15 in Melbourne (AEDT, +11)
  assert.equal(resetSaid("You have hit your weekly limit · resets 10pm (Australia/Melbourne)", at), Date.parse("2026-10-25T11:00:00Z"));
  assert.equal(resetSaid("resets 10:30am (Australia/Melbourne)", at), Date.parse("2026-10-25T23:30:00Z"));
  assert.equal(resetSaid("limit reached, resets Oct 29, 1pm (UTC)", at), Date.parse("2026-10-29T13:00:00Z"));
  assert.equal(resetSaid("resets 4:30am (Australia/Melbourne)", at), Date.parse("2026-10-25T17:30:00Z"));
  assert.equal(resetSaid("Claude AI usage limit reached", at), null);
  assert.equal(resetSaid("resets 10pm (Not/AZone)", at), null);
});

// setup-tokens: read out of setup-token's output, a year long, warned of 30 days before.
test("setup-tokens", () => {
  const t = "sk-ant-oat01-" + "a".repeat(40) + "_-b";
  assert.equal(tokenFrom(`Your OAuth token (valid for 1 year):\n\n${t}\n\nStore this token securely.`), t);
  assert.equal(tokenFrom("Login cancelled"), null);
  const made = Date.parse("2026-10-24T01:30:00Z");
  assert.equal(tokenEnds(made), made + YEAR_MS);
  assert.equal(tokenWarns(tokenEnds(made), made + 300 * 86_400_000), false);
  assert.equal(tokenWarns(tokenEnds(made), made + 340 * 86_400_000), true);
  assert.equal(keychainMade('    "cdat"<timedate>=0x32303236313032343031333030305A00  "20261024013000Z\\000"'), made);
  assert.equal(keychainMade("no such item"), null);
});

// The keychain's listing of setup-tokens: each slug once, when it was last written; no other item.
test("setup-tokens listed from the keychain", () => {
  const item = (svce: string, mdat: string) => `keychain: "/Users/r/Library/Keychains/login.keychain-db"\nclass: "genp"\nattributes:\n    "acct"<blob>="r"\n    "cdat"<timedate>=0x00  "20261020000000Z\\000"\n    "mdat"<timedate>=0x00  "${mdat}Z\\000"\n    "svce"<blob>="${svce}"\n`;
  const dump = item("abyme-accounts-main", "20261024111931") + item("Claude Code-credentials", "20261001000000") + item("abyme-accounts-hsone", "20261024112108");
  assert.deepEqual(tokensListed(dump), [
    { slug: "main", made: Date.UTC(2026, 9, 24, 11, 19, 31) },
    { slug: "hsone", made: Date.UTC(2026, 9, 24, 11, 21, 8) },
  ]);
  assert.deepEqual(tokensListed(""), []);
});

test("an account is not Ready while spent or capped, with when it is back", () => {
  const seen = { slugs: ["hsone"], five: 40, seven: 99, fiveResets: null, sevenResets: null, windows: [], capped: true, binding: null, back: "2026-10-27T01:00", spent: null, read: null, stale: false, agents: 2 };
  assert.deepEqual(accountReady(seen), { type: "Ready", status: "False", reason: "Capped", message: "capped until 2026-10-27T01:00", observedBy: "accounts" });
  assert.equal(accountReady({ ...seen, spent: { until: "2026-10-26T22:00", window: null } }).reason, "Spent");
  assert.equal(accountReady({ ...seen, capped: false }).status, "True");
  const r = accountStored(seen, []);
  assert.equal(accountId(seen), "hsone");
  assert.deepEqual(r.spec, { slugs: ["hsone"] });
  assert.equal(r.status.phase, "capped");
  // Its windows and agents wait; its phase is written at once.
  assert.equal(accountUrgent(accountStored({ ...seen, five: 80, agents: 3 }, []).status), accountUrgent(r.status));
  assert.notEqual(accountUrgent(accountStored({ ...seen, capped: false }, []).status), accountUrgent(r.status));
});

test("a window no harness gave a number for is null in the view, never 0", () => {
  const a = [{ slug: "samip", key: "samip" }];
  const read = (said: { five: number | null; seven: number | null }) => new Map([["samip", { at: NOW, usage: { five: 0, seven: 40, fiveResets: null, sevenResets: null }, windows: [], said }]]);
  const r = rowsSeen(a, read({ five: null, seven: 40 }), new Map(), new Map(), NOW)[0]!;
  assert.deepEqual([r.five, r.seven], [null, 40]);
  assert.deepEqual([rowsSeen(a, read({ five: 0, seven: 40 }), new Map(), new Map(), NOW)[0]!.five], [0]);
  assert.deepEqual(said({ five_hour: { resets_at: "x" }, seven_day: { utilization: 40 } }), { five: null, seven: 40 });
});

test("a refresh's turn gives both windows' numbers, refused or not", () => {
  // As `claude -p --output-format stream-json` said them, 2026-10-27.
  const refused = JSON.stringify({ type: "rate_limit_event", rate_limit_info: { status: "rejected", resetsAt: 1793232000, rateLimitType: "seven_day", unifiedWindows: { five_hour: { utilization: 0, resetsAt: 1793046000, status: "allowed" }, seven_day: { utilization: 1, resetsAt: 1793232000, status: "rejected" } } } });
  const at = "2026-10-27T00:00:00.000Z";
  assert.deepEqual(unified(`{"type":"system"}\n${refused}\n{"type":"result"}`, at), [
    { window: "five_hour", state: "allowed", utilization: 0, resets_at: "2026-10-26T20:20:00.000Z", at },
    { window: "seven_day", state: "rejected", utilization: 100, resets_at: "2026-10-29T00:00:00.000Z", at },
  ]);
  const allowed = JSON.stringify({ type: "rate_limit_event", rate_limit_info: { status: "allowed", rateLimitType: "five_hour", unifiedWindows: { five_hour: { utilization: 0, resetsAt: 1793045400, status: "allowed" }, seven_day: { utilization: 0.47, resetsAt: 1793286000, status: "allowed" } } } });
  const pushes = unified(allowed, at);
  assert.deepEqual(pushes.map((p) => [p.window, p.utilization]), [["five_hour", 0], ["seven_day", 47]]);
  // Into a capped read: both overwritten, and nothing refused (rjmathies, 2026-10-27).
  const next = takePushes({ at: Date.parse(at) - 3600_000, data: { seven_day: { utilization: 100, resets_at: "2026-10-29T10:00:00Z" } } }, pushes, 0)!;
  assert.deepEqual([parse(next.data).five, parse(next.data).seven, next.rejected.length], [0, 47, 0]);
  // With no unified windows, the one window it names, as a harness's push.
  assert.deepEqual(unified(JSON.stringify({ type: "rate_limit_event", rate_limit_info: { status: "allowed_warning", utilization: 0.9, rateLimitType: "seven_day" } }), at).map((p) => [p.window, p.state, p.utilization]), [["seven_day", "warning", 90]]);
  assert.deepEqual(unified("no events", at), []);
  // A turn that says no limits says why it failed: a bad token's 401, never only "no limits".
  assert.equal(turnError(`{"type":"system"}\n${JSON.stringify({ type: "result", subtype: "success", is_error: true, result: "Failed to authenticate. API Error: 401 OAuth access token is invalid." })}`), "Failed to authenticate. API Error: 401 OAuth access token is invalid.");
  assert.equal(turnError(JSON.stringify({ type: "result", is_error: false, result: "ok" })), null);
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
