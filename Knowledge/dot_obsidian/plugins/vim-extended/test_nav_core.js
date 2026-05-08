"use strict";

const assert = require("assert");
const fs = require("fs");
const { pickDirectionalNeighbor } = require("./nav_core");

const MAIN = "/Users/rjm/Knowledge/.obsidian/plugins/vim-extended/main.js";

function rect(left, top, width = 100, height = 100) {
  return { left, top, width, height };
}

function run() {
  const src = fs.readFileSync(MAIN, "utf8");
  assert(src.includes("const wantedAxis = wantsHorizontalMove ? 'x' : 'y';"), "dom nav must select axis by measured geometry");
  assert(src.includes("const axis = this.getSplitAxis(split);"), "dom nav must infer split axis dynamically");

  const T = rect(100, 0);
  const BL = rect(0, 140);
  const BR = rect(220, 140);

  let picked = pickDirectionalNeighbor(T, [
    { id: "BL", rect: BL },
    { id: "BR", rect: BR },
  ], "down");
  assert(picked && picked.item.id === "BL", "down from top should pick BL");

  picked = pickDirectionalNeighbor(BL, [
    { id: "T", rect: T },
    { id: "BR", rect: BR },
  ], "right");
  assert(picked && picked.item.id === "BR", "right from BL should pick BR");

  picked = pickDirectionalNeighbor(BR, [
    { id: "T", rect: T },
    { id: "BL", rect: BL },
  ], "left");
  assert(picked && picked.item.id === "BL", "left from BR should pick BL");

  picked = pickDirectionalNeighbor(BL, [
    { id: "T", rect: T },
    { id: "BR", rect: BR },
  ], "up");
  assert(picked && picked.item.id === "T", "up from BL should pick T");

  picked = pickDirectionalNeighbor(T, [
    { id: "BL", rect: BL },
    { id: "BR", rect: BR },
  ], "up");
  assert(picked === null, "up from top should be null");

  const CUR = rect(300, 220, 220, 180);
  const LEFT = rect(40, 220, 220, 180);
  const UPPER_LEFT = rect(40, 20, 220, 140);
  picked = pickDirectionalNeighbor(CUR, [
    { id: "UPPER_LEFT", rect: UPPER_LEFT },
    { id: "LEFT", rect: LEFT },
  ], "left");
  assert(picked && picked.item.id === "LEFT", "left should prefer overlapping left neighbor, not upper-left");

  const TL = rect(0, 0, 200, 120);
  const TR = rect(220, 0, 200, 120);
  const BL2 = rect(0, 160, 200, 120);
  const BR2 = rect(220, 160, 200, 120);

  picked = pickDirectionalNeighbor(TR, [
    { id: "BL2", rect: BL2 },
    { id: "BR2", rect: BR2 },
  ], "down");
  assert(picked && picked.item.id === "BR2", "2x2: down from top-right must pick bottom-right");

  picked = pickDirectionalNeighbor(TR, [
    { id: "TL", rect: TL },
    { id: "BL2", rect: BL2 },
  ], "left");
  assert(picked && picked.item.id === "TL", "left from top-right should pick top-left, not bottom-left");

  // Asymmetric split regression: top-right down then up returns to source.
  const L = rect(0, 0, 240, 280);
  const RT = rect(280, 0, 220, 120);
  const RB = rect(280, 160, 220, 120);
  picked = pickDirectionalNeighbor(RT, [
    { id: "L", rect: L },
    { id: "RB", rect: RB },
  ], "down");
  assert(picked && picked.item.id === "RB", "down from top-right should pick bottom-right in asymmetric split");
  picked = pickDirectionalNeighbor(RB, [
    { id: "L", rect: L },
    { id: "RT", rect: RT },
  ], "up", "RT");
  assert(picked && picked.item.id === "RT", "immediate reverse up should return to top-right source");

  // Asymmetric split regression: right into stacked area then left returns origin.
  const ORIGIN = rect(0, 120, 220, 120);
  const STACK_TOP = rect(260, 0, 220, 100);
  const STACK_MID = rect(260, 120, 220, 120);
  const STACK_BOT = rect(260, 260, 220, 100);
  picked = pickDirectionalNeighbor(ORIGIN, [
    { id: "STACK_TOP", rect: STACK_TOP },
    { id: "STACK_MID", rect: STACK_MID },
    { id: "STACK_BOT", rect: STACK_BOT },
  ], "right");
  assert(picked && picked.item.id === "STACK_MID", "right should enter stacked area at overlapping middle pane");
  picked = pickDirectionalNeighbor(STACK_MID, [
    { id: "ORIGIN", rect: ORIGIN },
    { id: "OTHER_LEFT", rect: rect(-260, 0, 220, 220) },
  ], "left", "ORIGIN");
  assert(picked && picked.item.id === "ORIGIN", "left reverse from stacked area should return originating pane");

  // Regression from movement logs:
  // down: A(677.5,600.7) -> B(677.5,985.9)
  // right: B(677.5,985.9) -> C(1181.5,793.3)
  // left from C must return B (immediate reverse), not A.
  const A = rect(560, 430, 235, 341.4);   // center ~677.5,600.7
  const B = rect(560, 815.2, 235, 341.4); // center ~677.5,985.9
  const C = rect(1064, 622.6, 235, 341.4); // center ~1181.5,793.3
  picked = pickDirectionalNeighbor(C, [
    { id: "A", rect: A },
    { id: "B", rect: B },
  ], "left", "B");
  assert(picked && picked.item.id === "B", "left reverse from C must return B (originating pane), not A");

  // Deterministic tie-break: no random jump-to-top under ties.
  const CUR2 = rect(300, 200, 120, 120);
  const CAND_A = rect(100, 180, 120, 120);
  const CAND_B = rect(100, 180, 120, 120);
  picked = pickDirectionalNeighbor(CUR2, [
    { id: "CAND_A", rect: CAND_A },
    { id: "CAND_B", rect: CAND_B },
  ], "left");
  assert(picked && picked.item.id === "CAND_A", "ties must resolve deterministically by input order");

  console.log("vim-extended nav_core tests: PASS");
}

run();
