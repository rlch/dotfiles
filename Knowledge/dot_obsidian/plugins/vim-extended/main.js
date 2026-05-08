"use strict";

const { Plugin, Notice } = require("obsidian");
const BUILD = "vim-extended 1.0.2-navfix";

function overlapLen(a0, a1, b0, b1) {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
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
    const rememberedHit = evaluated.find(e => e.item && e.item.leaf === rememberedLeaf);
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

module.exports = class ReadingVimScrollPlugin extends Plugin {
  async onload() {
    this.lastG = 0;
    this.lastZ = 0;
    this.debug = true;
    this.navMemory = new WeakMap();
    this.lastNavMove = null;
    this.listener = (evt) => this.onKeydown(evt);
    document.addEventListener("keydown", this.listener, true);
    new Notice(`${BUILD} loaded (debug ON)`, 3000);
    console.log(`[vim-extended] ${BUILD} loaded, debug=ON`);

    this.addCommand({
      id: "toggle-debug-logs",
      name: "Toggle debug logs",
      callback: () => {
        this.debug = !this.debug;
        new Notice(`vim-extended debug: ${this.debug ? "ON" : "OFF"}`);
        console.log(`[vim-extended] debug=${this.debug}`);
      },
    });

    this.addCommand({ id: "focus-pane-left", name: "Focus pane left", callback: () => this.navigatePane("h") });
    this.addCommand({ id: "focus-pane-down", name: "Focus pane down", callback: () => this.navigatePane("j") });
    this.addCommand({ id: "focus-pane-up", name: "Focus pane up", callback: () => this.navigatePane("k") });
    this.addCommand({ id: "focus-pane-right", name: "Focus pane right", callback: () => this.navigatePane("l") });
    this.addCommand({ id: "split-vertical", name: "Split vertical", callback: () => this.splitPane("v") });
    this.addCommand({ id: "split-horizontal", name: "Split horizontal", callback: () => this.splitPane("s") });
    this.addCommand({ id: "close-pane", name: "Close pane", callback: () => this.closePane() });
    this.addCommand({ id: "close-other-panes", name: "Close other panes", callback: () => this.closeOtherPanes() });
    this.addCommand({ id: "resize-pane-left", name: "Resize pane left", callback: () => this.resizePane("h") });
    this.addCommand({ id: "resize-pane-down", name: "Resize pane down", callback: () => this.resizePane("j") });
    this.addCommand({ id: "resize-pane-up", name: "Resize pane up", callback: () => this.resizePane("k") });
    this.addCommand({ id: "resize-pane-right", name: "Resize pane right", callback: () => this.resizePane("l") });
  }

  onunload() {
    if (this.listener) {
      document.removeEventListener("keydown", this.listener, true);
    }
  }

  isTypingContext(target) {
    if (!target) return false;
    const tag = (target.tagName || "").toLowerCase();
    if (target.isContentEditable) return true;
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    return !!target.closest(".cm-editor, .markdown-source-view");
  }

  isBlockedContext(target) {
    if (!target) return false;
    return !!target.closest(".mod-settings, .modal, .suggestion-container, .menu, .prompt");
  }

  getActiveMarkdownView() {
    const leaf = this.app.workspace.getMostRecentLeaf();
    const view = leaf?.view;
    if (!view || view.getViewType?.() !== "markdown") return null;
    return view;
  }

  getReadingScroller() {
    const view = this.getActiveMarkdownView();
    if (!view) return null;

    const mode = view.getMode?.();
    if (mode !== "preview") return null;

    const root = view.containerEl;
    return (
      root.querySelector(".markdown-reading-view .markdown-preview-view") ||
      root.querySelector(".markdown-preview-view") ||
      root.querySelector(".view-content")
    );
  }

  clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  runFirstCommand(ids, label = "") {
    for (const id of ids) {
      try {
        const ok = this.app.commands.executeCommandById(id);
        if (this.debug) console.log(`[vim-extended] cmd ${label} id=${id} ok=${!!ok}`);
        if (ok) return true;
      } catch (e) {
        if (this.debug) console.log(`[vim-extended] cmd ${label} id=${id} threw=${e?.message || e}`);
      }
    }
    return false;
  }

  oppositeDir(dir) {
    return dir === "left" ? "right" : dir === "right" ? "left" : dir === "up" ? "down" : dir === "down" ? "up" : null;
  }

  getRememberedNeighbor(fromLeaf, dir) {
    const memo = this.navMemory.get(fromLeaf);
    const cand = memo?.[dir] || null;
    if (!cand) return null;
    if (!cand.containerEl?.isConnected) return null;
    return cand;
  }

  rememberNeighborPair(fromLeaf, dir, toLeaf) {
    if (!fromLeaf || !toLeaf || !dir || fromLeaf === toLeaf) return;
    const opp = this.oppositeDir(dir);

    const fromMemo = this.navMemory.get(fromLeaf) || {};
    fromMemo[dir] = toLeaf;
    this.navMemory.set(fromLeaf, fromMemo);

    if (opp) {
      const toMemo = this.navMemory.get(toLeaf) || {};
      toMemo[opp] = fromLeaf;
      this.navMemory.set(toLeaf, toMemo);
    }
  }

  getSplitAxis(split) {
    try {
      const children = Array.from(split?.children || []).filter(el =>
        el.classList?.contains('workspace-tabs') || el.classList?.contains('workspace-split')
      );
      if (children.length < 2) return null;
      const a = children[0].getBoundingClientRect?.();
      const b = children[1].getBoundingClientRect?.();
      if (!a || !b) return null;
      const dx = Math.abs((b.left + b.width / 2) - (a.left + a.width / 2));
      const dy = Math.abs((b.top + b.height / 2) - (a.top + a.height / 2));
      return dx >= dy ? 'x' : 'y';
    } catch (_) {
      return null;
    }
  }

  getSplitChildren(split) {
    return Array.from(split?.children || []).filter(el =>
      el.classList?.contains('workspace-tabs') || el.classList?.contains('workspace-split')
    );
  }

  findOwnerInSplit(tabs, split) {
    let owner = tabs;
    while (owner && owner.parentElement !== split) owner = owner.parentElement;
    return owner;
  }

  resolveLeafInNode(node, currentRect, dir, preferredLeaf = null) {
    const container = node?.classList?.contains('workspace-tabs')
      ? node
      : node?.querySelector?.('.workspace-tabs');
    if (!container) return null;

    const cRect = container.getBoundingClientRect?.();
    if (!cRect) return null;

    const overlapArea = (a, b) => {
      const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return w * h;
    };

    const all = this.app.workspace.getLeavesOfType?.('markdown') || [];
    const candidates = [];
    for (let i = 0; i < all.length; i++) {
      const cand = all[i];
      const r = cand?.containerEl?.getBoundingClientRect?.();
      if (!r) continue;
      const area = overlapArea(cRect, r);
      if (area <= 0) continue;
      candidates.push({ cand, r, area, order: i });
    }

    if (candidates.length === 0) return null;

    // Scoped directional memory: if we have a remembered leaf for this direction,
    // prefer it only when it is still inside this neighbor node and directionally valid.
    if (preferredLeaf && currentRect && dir) {
      const remembered = candidates.find(c => c.cand === preferredLeaf);
      if (remembered && isDirectionallyAdmissible(currentRect, remembered.r, dir)) {
        return preferredLeaf;
      }
    }

    // Keep legacy behavior when directional context is unavailable.
    if (!currentRect || !dir) {
      let best = null;
      let bestArea = -1;
      for (const c of candidates) {
        if (c.area > bestArea) {
          bestArea = c.area;
          best = c.cand;
        }
      }
      return best;
    }

    const curCx = currentRect.left + currentRect.width / 2;
    const curCy = currentRect.top + currentRect.height / 2;
    const verticalMove = dir === 'up' || dir === 'down';

    let best = null;
    let bestCross = Number.POSITIVE_INFINITY;
    let bestArea = -1;
    let bestOrder = Number.POSITIVE_INFINITY;

    for (const c of candidates) {
      const cx = c.r.left + c.r.width / 2;
      const cy = c.r.top + c.r.height / 2;
      const cross = verticalMove ? Math.abs(cx - curCx) : Math.abs(cy - curCy);

      if (
        cross < bestCross ||
        (cross === bestCross && c.area > bestArea) ||
        (cross === bestCross && c.area === bestArea && c.order < bestOrder)
      ) {
        best = c.cand;
        bestCross = cross;
        bestArea = c.area;
        bestOrder = c.order;
      }
    }

    return best;
  }

  navigatePaneByDomSplit(leaf, dir, preferredLeaf = null) {
    try {
      const tabs = leaf?.containerEl?.closest?.('.workspace-tabs');
      if (!tabs || !dir) return null;

      const currentRect = leaf?.containerEl?.getBoundingClientRect?.();
      const wantsHorizontalMove = dir === 'left' || dir === 'right';
      const wantedAxis = wantsHorizontalMove ? 'x' : 'y';
      const preferPrev = dir === 'left' || dir === 'up';

      let walker = tabs;
      while (walker) {
        if (walker.classList?.contains('workspace-split')) {
          const split = walker;
          const axis = this.getSplitAxis(split);
          if (axis === wantedAxis) {
            const owner = this.findOwnerInSplit(tabs, split);
            if (owner) {
              const children = this.getSplitChildren(split);
              const idx = children.indexOf(owner);
              if (idx >= 0) {
                const neighborNode = preferPrev
                  ? (idx > 0 ? children[idx - 1] : null)
                  : (idx < children.length - 1 ? children[idx + 1] : null);
                if (neighborNode) {
                  const resolved = this.resolveLeafInNode(neighborNode, currentRect, dir, preferredLeaf);
                  if (resolved) return resolved;
                }
              }
            }
          }
        }
        walker = walker.parentElement;
      }
    } catch (e) {
      if (this.debug) console.log(`[vim-extended] dom-split ${dir} threw=${e?.message || e}`);
    }
    return null;
  }

  navigatePane(key) {
    const map = {
      h: [
        "workspace:move-focus-left",
        "workspace:focus-left-pane",
        "workspace:focus-left",
      ],
      j: [
        "workspace:move-focus-down",
        "workspace:focus-down-pane",
        "workspace:focus-down",
      ],
      k: [
        "workspace:move-focus-up",
        "workspace:focus-up-pane",
        "workspace:focus-up",
      ],
      l: [
        "workspace:move-focus-right",
        "workspace:focus-right-pane",
        "workspace:focus-right",
      ],
      w: [
        "workspace:move-focus-right",
        "workspace:focus-right-pane",
        "workspace:focus-right",
        "workspace:move-focus-left",
        "workspace:focus-left-pane",
        "workspace:focus-left",
      ],
    };

    const leaf = this.app.workspace.getMostRecentLeaf();
    if (!leaf) return false;

    const dir =
      key === "h" ? "left" :
      key === "j" ? "down" :
      key === "k" ? "up" :
      key === "l" ? "right" : null;

    // Deterministic directional navigation for h/j/k/l:
    // geometry selection only (strict direction + overlap-aware tie-break).
    // We intentionally skip command IDs/getLeafInDirection for hjkl because they can pick surprising panes.
    // NOTE: memory-first navigation was removed because stale directional memory caused wrong-axis jumps.
    try {
      if (dir) {
        const currentRect = leaf.containerEl?.getBoundingClientRect?.();
        const opp = this.oppositeDir(dir);
        const reverseFromLast = this.lastNavMove
          && this.lastNavMove.to === leaf
          && this.lastNavMove.dir === opp
          ? this.lastNavMove.from
          : null;
        const rememberedFromMap = this.getRememberedNeighbor(leaf, dir);
        const remembered = reverseFromLast || rememberedFromMap;

        // Zellij-parity reverse preference: on immediate opposite move,
        // return to the originating pane if still directionally valid.
        if (reverseFromLast && reverseFromLast !== leaf) {
          const reverseRect = reverseFromLast.containerEl?.getBoundingClientRect?.();
          if (currentRect && reverseRect && isDirectionallyAdmissible(currentRect, reverseRect, dir)) {
            this.app.workspace.setActiveLeaf(reverseFromLast, { focus: true });
            this.rememberNeighborPair(leaf, dir, reverseFromLast);
            this.lastNavMove = { from: leaf, to: reverseFromLast, dir };
            if (this.debug) console.log(`[vim-extended] reverse ${dir} hit immediate-origin`);
            return true;
          }
        }

        const domNeighbor = this.navigatePaneByDomSplit(leaf, dir, remembered);
        if (domNeighbor && domNeighbor !== leaf) {
          const nextRect = domNeighbor.containerEl?.getBoundingClientRect?.();
          if (currentRect && nextRect && isDirectionallyAdmissible(currentRect, nextRect, dir)) {
            this.app.workspace.setActiveLeaf(domNeighbor, { focus: true });
            this.rememberNeighborPair(leaf, dir, domNeighbor);
            this.lastNavMove = { from: leaf, to: domNeighbor, dir };
            if (this.debug) {
              const curr = leaf.containerEl?.getBoundingClientRect?.();
              const next = domNeighbor.containerEl?.getBoundingClientRect?.();
              const ccx = curr ? (curr.left + curr.width / 2).toFixed(1) : 'n/a';
              const ccy = curr ? (curr.top + curr.height / 2).toFixed(1) : 'n/a';
              const ncx = next ? (next.left + next.width / 2).toFixed(1) : 'n/a';
              const ncy = next ? (next.top + next.height / 2).toFixed(1) : 'n/a';
              console.log(`[vim-extended] dom-split ${dir} hit currentCenter=${ccx},${ccy} resolvedCenter=${ncx},${ncy}`);
            }
            return true;
          }
        }

        const all = this.app.workspace.getLeavesOfType?.("markdown") || [];
        if (!currentRect || all.length < 2) return false;

        const candidates = [];
        for (const cand of all) {
          if (!cand || cand === leaf) continue;
          const rect = cand.containerEl?.getBoundingClientRect?.();
          if (!rect) continue;
          candidates.push({ leaf: cand, rect });
        }

        const picked = pickDirectionalNeighbor(currentRect, candidates, dir, remembered);
        if (picked?.item?.leaf) {
          const best = picked.item.leaf;
          this.app.workspace.setActiveLeaf(best, { focus: true });
          this.rememberNeighborPair(leaf, dir, best);
          this.lastNavMove = { from: leaf, to: best, dir };
          if (this.debug) console.log(`[vim-extended] geometry ${dir} hit primary=${picked.primary.toFixed(1)} cross=${picked.cross.toFixed(1)} memory=${picked.usedMemory ? 'yes' : 'no'}`);
          return true;
        }
        this.lastNavMove = null;
      }

      // keep w as cycle
      if (key === "w") {
        const leaves = this.app.workspace.getLeavesOfType?.("markdown") || [];
        if (leaves.length > 1) {
          const idx = leaves.indexOf(leaf);
          const next = leaves[(idx + 1) % leaves.length];
          if (next) {
            this.app.workspace.setActiveLeaf(next, { focus: true });
            return true;
          }
        }
      }
    } catch (_) {}

    return false;
  }

  splitPane(key) {
    if (key === "v" || key === "|") {
      return this.runFirstCommand(["workspace:split-vertical"]);
    }
    if (key === "s" || key === "-") {
      return this.runFirstCommand(["workspace:split-horizontal"]);
    }
    return false;
  }

  closePane() {
    const did = this.runFirstCommand([
      "workspace:close",
      "workspace:close-leaf",
      "workspace:close-active-tab",
      "workspace:close-window",
    ]);
    if (did) return true;

    // Fallback: close active leaf directly
    try {
      const leaf = this.app.workspace.getMostRecentLeaf();
      if (leaf) {
        this.app.workspace.setActiveLeaf(leaf, { focus: true });
        this.app.workspace.detachLeaf(leaf);
        return true;
      }
    } catch (_) {}

    return false;
  }

  closeOtherPanes() {
    return this.runFirstCommand(["workspace:close-others-in-group", "workspace:close-other-tabs", "workspace:close-all-tabs-except-current"]);
  }

  resizePane(key) {
    if (this.debug) {
      const leaf = this.app.workspace.getMostRecentLeaf();
      const r = leaf?.containerEl?.getBoundingClientRect?.();
      console.log(`[vim-extended] resize start key=${key} leafRect=${r ? `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}` : 'n/a'}`);
    }

    const map = {
      h: [
        "workspace:resize-pane-left",
        "workspace:decrease-width",
        "workspace:shrink-width",
      ],
      l: [
        "workspace:resize-pane-right",
        "workspace:increase-width",
        "workspace:grow-width",
      ],
      k: [
        "workspace:resize-pane-up",
        "workspace:decrease-height",
        "workspace:shrink-height",
      ],
      j: [
        "workspace:resize-pane-down",
        "workspace:increase-height",
        "workspace:grow-height",
      ],
    };

    const nativeIds = map[key] || [];
    if (this.debug) console.log(`[vim-extended] resize native-attempt key=${key} ids=${nativeIds.join(",") || "none"}`);
    const did = this.runFirstCommand(nativeIds, `resize-${key}`);
    if (this.debug) console.log(`[vim-extended] resize native-result key=${key} did=${did}`);
    if (did) return true;

    if (this.debug) console.log(`[vim-extended] resize fallback-enter key=${key} method=dom-flex`);
    const fallback = this.resizePaneByDomFlex(key);
    if (!fallback && this.debug) {
      const available = this.app.commands.listCommands()
        .map(c => c.id)
        .filter(id => id.includes("resize") || id.includes("width") || id.includes("height") || id.includes("pane"))
        .slice(0, 60);
      console.log("[vim-extended] resize failed; candidate command IDs:", available);
    }
    return fallback;
  }

  resizePaneByDomFlex(key) {
    try {
      const fail = (reason, extra) => {
        if (this.debug) console.log(`[vim-extended] dom-resize key=${key} fail=${reason}`, extra || "");
        return false;
      };

      const leaf = this.app.workspace.getMostRecentLeaf();
      const tabs = leaf?.containerEl?.closest?.('.workspace-tabs');
      if (!tabs) return fail('no-active-tabs');

      const wantsWidth = key === 'h' || key === 'l';
      const wantsHeight = key === 'j' || key === 'k';
      const wantedAxis = wantsWidth ? 'x' : (wantsHeight ? 'y' : null);
      if (!wantedAxis) return fail('invalid-key');

      // Direction semantics (vim-style):
      // h => shrink current horizontally, l => grow current horizontally
      // j => grow current vertically,   k => shrink current vertically
      const growCurrent = key === 'l' || key === 'j';
      const preferPrev = key === 'h' || key === 'k';
      const axis = wantsWidth ? 'width' : 'height';
      if (this.debug) {
        console.log(
          `[vim-extended] dom-resize start key=${key} axis=${axis} wantedAxis=${wantedAxis} growCurrent=${growCurrent} preferPrev=${preferPrev}`
        );
      }

      const splitAncestors = [];
      let walker = tabs;
      while (walker) {
        if (walker.classList?.contains('workspace-split')) {
          const splitAxis = this.getSplitAxis(walker);
          if (splitAxis === wantedAxis) splitAncestors.push(walker);
        }
        walker = walker.parentElement;
      }
      if (this.debug) console.log(`[vim-extended] dom-resize split-ancestors axis=${axis} count=${splitAncestors.length}`);
      if (splitAncestors.length === 0) return fail('no-axis-split', { axis: wantedAxis });

      let picked = null;
      for (const split of splitAncestors) {
        const owner = this.findOwnerInSplit(tabs, split);
        if (!owner) continue;

        const children = this.getSplitChildren(split);
        if (children.length < 2) continue;

        const idx = children.indexOf(owner);
        if (idx < 0) continue;

        const prev = idx > 0 ? children[idx - 1] : null;
        const next = idx < children.length - 1 ? children[idx + 1] : null;
        const preferredNeighbor = preferPrev ? prev : next;
        const fallbackNeighbor = preferPrev ? next : prev;

        if (!picked && (preferredNeighbor || fallbackNeighbor)) {
          const neighborIdx = preferredNeighbor
            ? (preferPrev ? idx - 1 : idx + 1)
            : (preferPrev ? idx + 1 : idx - 1);
          picked = {
            split,
            owner,
            neighbor: preferredNeighbor || fallbackNeighbor,
            neighborIdx,
            usedFallbackSide: !preferredNeighbor,
            idx,
            childCount: children.length,
          };
        }

        if (preferredNeighbor) {
          picked = {
            split,
            owner,
            neighbor: preferredNeighbor,
            neighborIdx: preferPrev ? idx - 1 : idx + 1,
            usedFallbackSide: false,
            idx,
            childCount: children.length,
          };
          break;
        }
      }

      if (!picked?.neighbor) return fail('no-neighbor-in-axis-split');
      if (this.debug) {
        console.log(
          `[vim-extended] dom-resize picked axis=${axis} idx=${picked.idx} childCount=${picked.childCount} usedFallbackSide=${picked.usedFallbackSide}`
        );
      }

      const parseGrow = (el) => {
        const inline = parseFloat(el.style.flexGrow || '');
        if (!Number.isNaN(inline) && inline > 0) return inline;
        const cs = window.getComputedStyle(el);
        const g = parseFloat(cs.flexGrow || '1');
        return Number.isNaN(g) ? 1 : Math.max(0.1, g);
      };

      const mine = parseGrow(picked.owner);
      const theirs = parseGrow(picked.neighbor);

      const STEP = 8;
      const MIN_GROW = 8;

      // Divider-direction semantics (zellij/tmux-like): key means move the divider
      // in that direction. Determine grow/shrink from which side of the divider
      // the active pane is on.
      const dirPositive = key === 'l' || key === 'j'; // right/down
      const ownerAfterNeighbor = (picked.idx ?? 0) > (picked.neighborIdx ?? -1); // right/bottom side
      const effectiveGrowCurrent = ownerAfterNeighbor !== dirPositive;
      if (this.debug) {
        console.log(
          `[vim-extended] dom-resize resolve key=${key} dirPositive=${dirPositive} ownerAfterNeighbor=${ownerAfterNeighbor} ` +
          `growCurrent(base)=${growCurrent} effectiveGrowCurrent=${effectiveGrowCurrent} preferPrev=${preferPrev}`
        );
      }
      if (this.debug) {
        console.log(
          `[vim-extended] dom-resize flex-before mine=${mine.toFixed(2)} neighbor=${theirs.toFixed(2)} growCurrent=${growCurrent} effectiveGrowCurrent=${effectiveGrowCurrent}`
        );
      }

      let newMine = mine + (effectiveGrowCurrent ? STEP : -STEP);
      let newTheirs = theirs + (effectiveGrowCurrent ? -STEP : STEP);

      if (newMine < MIN_GROW) {
        const delta = MIN_GROW - newMine;
        newMine = MIN_GROW;
        newTheirs -= delta;
      }
      if (newTheirs < MIN_GROW) {
        const delta = MIN_GROW - newTheirs;
        newTheirs = MIN_GROW;
        newMine -= delta;
      }

      if (newMine < MIN_GROW || newTheirs < MIN_GROW) {
        return fail('min-grow-clamp-blocked', {
          mine,
          theirs,
          newMine,
          newTheirs,
          min: MIN_GROW,
        });
      }

      picked.owner.style.flexGrow = String(newMine);
      picked.neighbor.style.flexGrow = String(newTheirs);

      if (this.debug) {
        console.log(
          `[vim-extended] dom-resize flex-after key=${key} axis=${axis} wantedAxis=${wantedAxis} idx=${picked.idx}/${picked.childCount - 1} usedFallbackSide=${picked.usedFallbackSide} ` +
          `mine:${mine.toFixed(2)}->${newMine.toFixed(2)} neighbor:${theirs.toFixed(2)}->${newTheirs.toFixed(2)}`
        );
      }
      return true;
    } catch (e) {
      if (this.debug) console.log(`[vim-extended] dom-resize key=${key} threw=${e?.message || e}`);
      return false;
    }
  }

  focusInlineTitle(view) {
    const root = view?.containerEl;
    if (!root) return false;

    const titleEl = root.querySelector(".inline-title") || root.querySelector(".view-header-title");
    if (!titleEl) return false;

    try {
      titleEl.click();
      titleEl.focus();
      if (titleEl.setSelectionRange && typeof titleEl.value === "string") {
        const n = titleEl.value.length;
        titleEl.setSelectionRange(n, n);
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  onKeydown(evt) {
    if (this.isBlockedContext(evt.target)) return;

    // Never run pane movement/resize while typing in inputs/contenteditable
    // (eg Properties long-text fields), otherwise Ctrl-h/j/k/l can jump panes
    // based on stale MRU leaf and feel random until user clicks a pane again.
    if (this.isTypingContext(evt.target)) return;

    const key = evt.key;
    const code = evt.code;
    const ctrlOrMeta = evt.ctrlKey || evt.metaKey;

    if (this.debug && evt.ctrlKey && !evt.metaKey && !evt.altKey) {
      console.log(
        `[vim-extended] raw keydown key=${JSON.stringify(key)} code=${code} ctrl=${evt.ctrlKey} shift=${evt.shiftKey} alt=${evt.altKey} meta=${evt.metaKey} target=${evt.target?.className || evt.target?.tagName || "unknown"}`
      );
    }

    // Normalize ctrl-combos by physical key code (important on macOS where Ctrl-h reports Backspace)
    const ctrlKey = (evt.ctrlKey && !evt.metaKey && !evt.altKey && !evt.shiftKey)
      ? (code === "KeyH" ? "h"
        : code === "KeyJ" ? "j"
        : code === "KeyK" ? "k"
        : code === "KeyL" ? "l"
        : code === "KeyW" ? "w"
        : code === "KeyV" ? "v"
        : code === "KeyS" ? "s"
        : code === "KeyQ" ? "q"
        : code === "KeyO" ? "o"
        : null)
      : null;

    const ctrlShiftKey = (evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.shiftKey)
      ? (code === "KeyH" ? "h"
        : code === "KeyJ" ? "j"
        : code === "KeyK" ? "k"
        : code === "KeyL" ? "l"
        : null)
      : null;

    if (this.debug && evt.ctrlKey && evt.shiftKey && !evt.metaKey && !evt.altKey) {
      console.log(`[vim-extended] ctrl-shift detect key=${JSON.stringify(key)} code=${code} resolved=${ctrlShiftKey || "none"}`);
    }

    // Never hijack macOS app quit
    if (evt.metaKey && !evt.ctrlKey && !evt.altKey && !evt.shiftKey && (key === "q" || key === "Q")) {
      return;
    }

    if (ctrlShiftKey) {
      const didResize = this.resizePane(ctrlShiftKey);
      if (didResize) {
        if (this.debug) console.log(`[vim-extended] handled ctrl-shift-${ctrlShiftKey} (resize)`);
        evt.preventDefault();
        evt.stopPropagation();
        return;
      }
      if (this.debug) console.log(`[vim-extended] ctrl-shift-${ctrlShiftKey} not handled (resize)`);
    }

    // Direct Ctrl- bindings for pane/window actions (no prefix)
    // IMPORTANT: ctrl-only (not cmd/meta), so system shortcuts like Cmd-Q keep working.
    if (ctrlKey) {
      let did = false;
      if (["h", "j", "k", "l", "w"].includes(ctrlKey)) did = this.navigatePane(ctrlKey);
      else if (ctrlKey === "v") did = this.splitPane("v");
      else if (ctrlKey === "s") did = this.splitPane("s");
      else if (ctrlKey === "q") did = this.closePane();
      else if (ctrlKey === "o") did = this.closeOtherPanes();

      if (did) {
        if (this.debug) {
          console.log(`[vim-extended] handled ctrl-${ctrlKey} (pane action)`);
        }
        evt.preventDefault();
        evt.stopPropagation();
        return;
      }

      if (this.debug) {
        const leaf = this.app.workspace.getMostRecentLeaf();
        const count = (this.app.workspace.getLeavesOfType?.("markdown") || []).length;
        console.log(`[vim-extended] ctrl-${ctrlKey} not handled by pane action (activeLeaf=${!!leaf}, markdownLeaves=${count})`);
      }
    }

    // Reading-view scrolling behavior
    const view = this.getActiveMarkdownView();
    const scroller = this.getReadingScroller();
    if (!scroller || !view || this.isTypingContext(evt.target)) return;

    const halfPage = Math.max(80, Math.floor(scroller.clientHeight * 0.5));
    const fullPage = Math.max(120, Math.floor(scroller.clientHeight * 0.9));

    if (ctrlOrMeta && !evt.altKey && !evt.shiftKey && (key === "d" || key === "u")) {
      evt.preventDefault();
      evt.stopPropagation();
      scroller.scrollBy({ top: key === "d" ? halfPage : -halfPage, behavior: "auto" });
      return;
    }

    if (ctrlOrMeta && !evt.altKey && !evt.shiftKey && (key === "f" || key === "b")) {
      evt.preventDefault();
      evt.stopPropagation();
      scroller.scrollBy({ top: key === "f" ? fullPage : -fullPage, behavior: "auto" });
      return;
    }

    if (!ctrlOrMeta && !evt.altKey && !evt.shiftKey && (key === "j" || key === "k")) {
      evt.preventDefault();
      evt.stopPropagation();
      scroller.scrollBy({ top: key === "j" ? 48 : -48, behavior: "auto" });
      return;
    }

    if (!ctrlOrMeta && !evt.altKey && !evt.shiftKey && key === "g") {
      const now = Date.now();
      if (now - this.lastG < 450) {
        evt.preventDefault();
        evt.stopPropagation();
        scroller.scrollTo({ top: 0, behavior: "auto" });
        this.lastG = 0;
      } else {
        this.lastG = now;
      }
      return;
    }

    if (!ctrlOrMeta && !evt.altKey && evt.shiftKey && key === "G") {
      evt.preventDefault();
      evt.stopPropagation();
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: "auto" });
      return;
    }

    if (!ctrlOrMeta && !evt.altKey && !evt.shiftKey && key === "z") {
      this.lastZ = Date.now();
      return;
    }

    if (!ctrlOrMeta && !evt.altKey && !evt.shiftKey && (key === "t" || key === "z" || key === "b")) {
      const now = Date.now();
      if (now - this.lastZ > 700) return;

      evt.preventDefault();
      evt.stopPropagation();

      const maxTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      const currentTop = scroller.scrollTop;

      let target = currentTop;
      if (key === "t") target = currentTop - Math.floor(scroller.clientHeight * 0.35);
      else if (key === "z") target = currentTop;
      else if (key === "b") target = currentTop + Math.floor(scroller.clientHeight * 0.35);

      target = this.clamp(target, 0, maxTop);
      scroller.scrollTo({ top: target, behavior: "auto" });
      this.lastZ = 0;
    }
  }
};
