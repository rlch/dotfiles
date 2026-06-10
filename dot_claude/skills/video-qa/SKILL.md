---
name: video-qa
description: Visual QA workflow for Remotion videos via the running Remotion Studio. Use whenever you need to look at specific frames of a Remotion composition to verify layout, animation, shader output, or composition correctness — diagnosing why mercury is in the wrong corner, why a label is mispositioned, whether a transition lands at the right frame, etc. Encodes the chrome-devtools-mcp pattern for scrubbing the studio timeline, the canvas-dump trap that wastes hours if you don't know about it, frame ↔ timeline-x calibration, and the multi-beat sweep pattern. Triggers on "QA the video", "screenshot the composition at frame N", "is the layout right", "debug the studio render", and any visual debugging of Remotion output.
---

# Video QA (Remotion + chrome-devtools-mcp)

The Remotion Studio gives a live preview but the agent can't see it directly. This skill encodes how to drive the studio with chrome-devtools-mcp to capture frames, diagnose layout, and iterate.

## When to invoke

- The user asks to "QA the video", "screenshot frame N", "is the layout right", or any phrasing that means *look at the actual rendered output*.
- You've made a layout/shader/animation change and need to verify it landed correctly.
- The user reports a visual bug ("mercury is at the bottom", "the labels are wrong") and you need to see it to confirm.
- Before reporting that a visual fix is "done" — never claim a render is correct without screenshot evidence.

## Prerequisites

- Remotion Studio is running locally (e.g. `mise exec -- pnpm dev` for the youtube monorepo). Studio port varies (3000, 3001, 3010 if forced); confirm with `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:PORT/`.
- ungoogled-Chromium is running with `--remote-debugging-port=9222` (the user launches via `chrome-debug` fish function). The chrome-devtools-mcp server attaches to that.
- The agent has `mcp__plugin_chrome-devtools-mcp__*` tools available. If they're deferred, load `list_pages`, `navigate_page`, `take_screenshot`, `evaluate_script`, `press_key` via ToolSearch first.

## The canvas-dump trap (read this first or you will waste an hour)

The studio's Three.js canvas has `devicePixelRatio=2`, so the internal pixel buffer is 2× the displayed CSS size (e.g. 3840×2160 buffer for a 1920×1080 video). **Don't dump the canvas content via `canvas.toDataURL()` and read the resulting PNG to QA the layout.** Two problems:

1. **WebGL canvases don't preserve their drawing buffer by default.** `toDataURL()` returns blank unless the renderer is created with `preserveDrawingBuffer: true` (which has a perf cost and isn't shipped).
2. **Even when buffer is preserved, the render only fills part of the buffer.** Three.js renders to the bottom-left 1920×1080 quadrant of the 3840×2160 buffer (OpenGL's origin is bottom-left). The dump shows the rendered content sitting in the bottom-left corner with the rest of the buffer empty — which looks like a layout bug but is just a buffer artifact.

**Use viewport screenshots instead.** `take_screenshot` of the page captures what's actually visible. The canvas's CSS-displayed size matches the rendered content correctly.

## Frame seeking

URL params don't work — Remotion Studio ignores `?frame=N`. Keyboard shortcuts (`5`, `End`, arrow keys, etc.) only work if the right element has focus, and even then they don't always trigger Remotion's seek logic. **The reliable mechanism is dispatching synthetic pointer events on the timeline strip.**

The timeline strip is a wide horizontal element at roughly `y ≈ window.innerHeight * 0.78` (just above the playback controls). Its DOM has no helpful class — search for it by geometry:

```js
const all = document.querySelectorAll('*');
for (const el of all) {
  const r = el.getBoundingClientRect();
  if (r.height > 5 && r.height < 50 && r.width > 600 && r.y > window.innerHeight * 0.65) {
    // candidate
  }
}
```

The seek call is `pointerdown + mousedown + click + pointerup + mouseup` on the element at the target x:

```js
async (x, y) => {
  const el = document.elementFromPoint(x, y);
  const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: 1 };
  el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, pointerId: 1, pointerType: 'mouse' }));
  el.dispatchEvent(new MouseEvent('mousedown', opts));
  el.dispatchEvent(new MouseEvent('click', opts));
  el.dispatchEvent(new PointerEvent('pointerup', { ...opts, pointerId: 1, pointerType: 'mouse' }));
  el.dispatchEvent(new MouseEvent('mouseup', opts));
  await new Promise(r => setTimeout(r, 300));  // let the seek apply
  return (document.body.innerText.match(/\d{2}:\d{2}\.\d{2}/g))?.slice(0, 3);
}
```

The second timestamp in the body's text matches (`"01:45.22"` etc.) is the current playhead — use it to verify the seek landed.

## Frame ↔ timeline-x calibration

The timeline-x range varies with studio window size. Calibrate empirically:

1. Click once at a known x (e.g. 1225) and read the resulting `mm:ss.ff` timestamp → frame number.
2. Click at a second x and read the second timestamp.
3. Compute pixels-per-frame and the timeline's left-x origin.

For the youtube monorepo studio at the standard viewport size, the calibration that's worked: timeline spans approximately `x = 420` (frame 0) to `x = 2030` (last frame) — so `framesPerPixel ≈ totalFrames / 1610`. **Recalibrate any time the window resizes.**

## Multi-beat sweep

Don't QA one frame. The composition's beats look different at each scene. Always screenshot:

- Frame 0 (cold open / hook)
- One frame in each major teaching beat (e.g. S4 derive-h, S5 chord, S6 dip)
- The code beat (S7)
- Any beat the user specifically flagged

Save screenshots to `<repo>/.tmp-qa/seek-sN.png` so you can read them with the Read tool (which only works for paths inside workspace roots).

## Studio chrome ≠ canvas content

Beware: the studio has menu bars, sidebars, timeline rows, panel splitters. The dark rectangle in the middle is not necessarily the *whole* canvas — it may include letterboxing or chrome padding. When measuring a render's position, use `evaluate_script` to read the canvas's `getBoundingClientRect()`, not eyeballs on the screenshot.

```js
const canvas = document.querySelector('canvas');
const r = canvas.getBoundingClientRect();
// r.x, r.y, r.width, r.height — the canvas's actual position in CSS pixels
```

Then if a screenshot shows mercury at screen-px (335, 305) and the canvas rect is `{x: 220, y: 50, w: 700, h: 394}`, the mercury position *within the canvas* is `(335-220, 305-50) = (115, 255)` — which is the lower-left of a 700×394 canvas. That's a real layout bug, not a UI chrome misread.

## Dev server gotchas

- The studio caches bundles aggressively. If you change a shader or a deeply imported module, **kill and restart the dev server** before believing the studio render reflects your change. Hot-reload sometimes silently misses GLSL string changes.
- Force a fresh studio with `pnpm exec remotion studio --port <NEW> --force-new`. The `--force-new` is needed if any studio is already running.
- After restart, wait ~10s for the initial build before navigating Chrome to the new port. Tail the dev server output until you see `Built in Nms`.

## Reporting findings

When you write up QA findings:

1. **One section per beat** you screenshotted. State the frame number and the beat from the storyboard.
2. **Concrete observations**, not vibes. "Mercury at (335, 305) within a 700×394 canvas → ~25% below canvas vertical centre" beats "mercury looks low."
3. **Separate verification from speculation.** What you saw vs what you think is causing it.
4. **Propose specific fixes** with file:line references. Don't end a QA pass with "looks broken, idk".

## Anti-patterns

- ❌ Trusting `canvas.toDataURL()` content for layout QA (devicePixelRatio buffer trap).
- ❌ Claiming a fix is verified without a screenshot at the affected frame.
- ❌ QA'ing only one frame and assuming the whole video is fine.
- ❌ Using `?frame=N` in the URL (Remotion Studio ignores it).
- ❌ Eyeballing screenshot pixel positions without checking the canvas's `getBoundingClientRect()`.
- ❌ Believing the studio render matches the latest code without restarting the dev server after a shader/bundle change.
