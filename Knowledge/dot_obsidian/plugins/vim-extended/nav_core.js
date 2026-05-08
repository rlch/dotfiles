"use strict";

function overlapLen(a0, a1, b0, b1) {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

function oppositeDir(dir) {
  return dir === "left" ? "right" : dir === "right" ? "left" : dir === "up" ? "down" : dir === "down" ? "up" : null;
}

function isDirectionallyAdmissible(currentRect, candidateRect, dir, eps = 4) {
  if (!currentRect || !candidateRect || !dir) return false;
  const cx = currentRect.left + currentRect.width / 2;
  const cy = currentRect.top + currentRect.height / 2;
  const x = candidateRect.left + candidateRect.width / 2;
  const y = candidateRect.top + candidateRect.height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const horizontalMove = dir === "left" || dir === "right";

  if (dir === "left" && dx >= -eps) return false;
  if (dir === "right" && dx <= eps) return false;
  if (dir === "up" && dy >= -eps) return false;
  if (dir === "down" && dy <= eps) return false;

  const a0 = horizontalMove ? currentRect.top : currentRect.left;
  const a1 = horizontalMove ? (currentRect.top + currentRect.height) : (currentRect.left + currentRect.width);
  const b0 = horizontalMove ? candidateRect.top : candidateRect.left;
  const b1 = horizontalMove ? (candidateRect.top + candidateRect.height) : (candidateRect.left + candidateRect.width);
  return Math.max(a0, b0) <= (Math.min(a1, b1) + eps);
}

function edgeDistance(currentRect, candidateRect, dir) {
  if (dir === "left") return currentRect.left - (candidateRect.left + candidateRect.width);
  if (dir === "right") return candidateRect.left - (currentRect.left + currentRect.width);
  if (dir === "up") return currentRect.top - (candidateRect.top + candidateRect.height);
  return candidateRect.top - (currentRect.top + currentRect.height);
}

function pickDirectionalNeighbor(currentRect, candidateRects, dir, rememberedLeaf = null) {
  if (!currentRect || !candidateRects || candidateRects.length === 0) return null;

  const cx = currentRect.left + currentRect.width / 2;
  const cy = currentRect.top + currentRect.height / 2;
  const horizontalMove = dir === "left" || dir === "right";

  const evaluated = [];
  for (let i = 0; i < candidateRects.length; i++) {
    const item = candidateRects[i];
    const r = item.rect;
    if (!r || r.width < 20 || r.height < 20) continue;
    if (!isDirectionallyAdmissible(currentRect, r, dir)) continue;

    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const primary = Math.max(0, edgeDistance(currentRect, r, dir));
    const cross = horizontalMove ? Math.abs(y - cy) : Math.abs(x - cx);
    evaluated.push({ item, primary, cross, order: i });
  }

  if (evaluated.length === 0) return null;

  if (rememberedLeaf) {
    const rememberedHit = evaluated.find(e => e.item && (e.item.leaf === rememberedLeaf || e.item.id === rememberedLeaf));
    if (rememberedHit) {
      return { item: rememberedHit.item, primary: rememberedHit.primary, cross: rememberedHit.cross, usedMemory: true };
    }
  }

  evaluated.sort((a, b) => {
    if (a.primary !== b.primary) return a.primary - b.primary;
    if (a.cross !== b.cross) return a.cross - b.cross;
    return a.order - b.order;
  });

  const best = evaluated[0];
  return best ? { item: best.item, primary: best.primary, cross: best.cross, usedMemory: false } : null;
}

function pickLeafByDirectionalCrossAxis(currentRect, candidates, dir) {
  if (!currentRect || !candidates || candidates.length === 0 || !dir) return null;

  const curCx = currentRect.left + currentRect.width / 2;
  const curCy = currentRect.top + currentRect.height / 2;
  const verticalMove = dir === "up" || dir === "down";

  const pool = candidates.filter(c => c && c.rect && (c.overlapArea || 0) > 0);
  if (pool.length === 0) return null;

  let best = null;
  let bestCross = Number.POSITIVE_INFINITY;
  let bestArea = -1;

  for (const c of pool) {
    const cx = c.rect.left + c.rect.width / 2;
    const cy = c.rect.top + c.rect.height / 2;
    const cross = verticalMove ? Math.abs(cx - curCx) : Math.abs(cy - curCy);

    if (cross < bestCross || (cross === bestCross && c.overlapArea > bestArea)) {
      best = c;
      bestCross = cross;
      bestArea = c.overlapArea;
    }
  }

  return best;
}

module.exports = { pickDirectionalNeighbor, pickLeafByDirectionalCrossAxis, isDirectionallyAdmissible, oppositeDir };
