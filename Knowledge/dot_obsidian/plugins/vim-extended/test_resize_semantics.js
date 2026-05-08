"use strict";

const assert = require("assert");
const fs = require("fs");

const MAIN = "/Users/rjm/Knowledge/.obsidian/plugins/vim-extended/main.js";

function extractGrowCurrentExpr(source) {
  const m = source.match(/const growCurrent = ([^;]+);/);
  if (!m) throw new Error("could not find growCurrent expression in main.js");
  return m[1].trim();
}

function evalGrowCurrent(expr, key) {
  // eslint-disable-next-line no-new-func
  const fn = new Function("key", `return (${expr});`);
  return !!fn(key);
}

function expectedGrowCurrent(key) {
  return key === "l" || key === "j";
}

function effectiveGrowCurrentDividerSemantic(key, ownerAfterNeighbor) {
  const dirPositive = key === "l" || key === "j"; // right/down
  return ownerAfterNeighbor !== dirPositive;
}

function run() {
  const src = fs.readFileSync(MAIN, "utf8");
  const expr = extractGrowCurrentExpr(src);

  assert(src.includes("const wantedAxis = wantsWidth ? 'x' : (wantsHeight ? 'y' : null);"), "resize fallback must use deterministic axis detection");
  assert(src.includes("const ownerAfterNeighbor = (picked.idx ?? 0) > (picked.neighborIdx ?? -1);"), "resize fallback should compute side-of-divider");
  assert(src.includes("const effectiveGrowCurrent = ownerAfterNeighbor !== dirPositive;"), "resize fallback should use divider-direction semantics");

  for (const key of ["h", "j", "k", "l"]) {
    const cur = evalGrowCurrent(expr, key);
    const exp = expectedGrowCurrent(key);
    assert.equal(cur, exp, `${key} growCurrent mismatch (current=${cur}, expected=${exp}, expr=${expr})`);
  }

  // Right pane + left key: should grow current (divider moves left)
  assert.equal(effectiveGrowCurrentDividerSemantic("h", true), true, "right-pane left resize should grow current");
  // Left pane + left key: should shrink current
  assert.equal(effectiveGrowCurrentDividerSemantic("h", false), false, "left-pane left resize should shrink current");
  // Bottom pane + down key: should shrink current (divider moves down)
  assert.equal(effectiveGrowCurrentDividerSemantic("j", true), false, "bottom-pane down resize should shrink current");
  // Top pane + down key: should grow current
  assert.equal(effectiveGrowCurrentDividerSemantic("j", false), true, "top-pane down resize should grow current");

  console.log("resize semantics tests: PASS");
}

run();
