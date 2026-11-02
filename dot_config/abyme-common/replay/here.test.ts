// here.ts: `node --test here.test.ts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { type Here, Presence } from "./here.ts";

const at = (h: Here) => {
  let now = h;
  const p = new Presence(() => now);
  return { p, go: (h: Here) => void ((now = h), p.left()) };
};
const shown = { visible: true, focused: true };

test("a tick shown and focused throughout counts", () => {
  const { p } = at(shown);
  assert.equal(p.tick(), true);
  assert.equal(p.tick(), true);
});

test("hidden or out of focus at any point in the interval, the tick does not count", () => {
  for (const away of [{ visible: false, focused: true }, { visible: true, focused: false }]) {
    const { p, go } = at(shown);
    go(away);
    go(shown);
    assert.equal(p.tick(), false, JSON.stringify(away));
    assert.equal(p.tick(), true);
  }
});

test("a page that starts out of focus counts from the first tick it was focused throughout", () => {
  const { p, go } = at({ visible: true, focused: false });
  assert.equal(p.tick(), false);
  go(shown);
  assert.equal(p.tick(), false);
  assert.equal(p.tick(), true);
});
