#!/usr/bin/env bash
# Build scratch-dimmer: a Cocoa helper that paints a translucent black
# overlay on every visible non-scratch window for as long as Scratch.app
# is running, leaving the wallpaper untouched. Scratch lives in a
# "spotlight" with all other app windows softly dimmed.
#
# Why per-window (not full-screen): a single screen-sized overlay also
# darkens the wallpaper, which the user found heavy. Per-window overlays
# follow the same shape as HazeOver / Backdrop — enumerate windows via
# CGWindowListCopyWindowInfo and create one click-through NSWindow per
# match, sized to that window's frame. Snapshot at scratch open is fine
# because scratch's autoquit-on-unfocus tears everything down the moment
# you click out, so we don't need to track window moves/resizes.
#
# Lifecycle: scratchpad.sh spawns this binary right before `open -na` on
# the scratch app. The dimmer polls every 250ms for any process matching
# Scratch.app's MacOS path; once it appears, the dimmer monitors that
# pid with `kill(pid, 0)` and exits the moment scratch dies — so both
# the explicit toggle-off and the autoquit-on-unfocus path tear it down
# for free. No pid file to manage from shell.
#
# The same 250ms loop also re-reads scratch's window frame; if it has
# moved or resized (drag, ghostty config edit applied between toggles,
# off-by-one between ghostty's initial layout and the final position,
# etc.) the hole in every overlay's mask is rebuilt so the cutout keeps
# tracking the actual window position.
#
# Window levels: overlays sit at .floating (3). Scratch (Ghostty) is a
# .normal (0) window, so where the scratch frame overlaps another app's
# frame the overlay would otherwise also dim scratch — we use a private
# CGS API (CGSSetWindowLevel) to bump scratch one level above the
# overlays once its window appears. CGS is unsupported but stable since
# 10.x; if Apple removes it the worst case is scratch getting dimmed in
# the overlapping region only.
#
# Source is inlined so chezmoi's run_onchange hash captures any swift
# tweak; edit the source, the binary rebuilds.
set -euo pipefail

DEST="$HOME/.local/bin/scratch-dimmer"

if ! command -v swiftc >/dev/null 2>&1; then
  echo "scratch-dimmer: swiftc not found; skipping build (toggle will run without dimmer)" >&2
  exit 0
fi

mkdir -p "$(dirname "$DEST")"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cat >"$TMP/scratch-dimmer.swift" <<'SWIFT'
import Cocoa
import Foundation

// scratch-dimmer — per-window translucent black overlays covering every
// visible non-scratch app window. Wallpaper is untouched. Click-through,
// joins all Spaces, no shadow, no Dock icon, no menu bar.
//
// Args (positional, all optional):
//   $1 = opacity (0.0 – 1.0, default 0.25)
//
// Env:
//   SCRATCH_DIMMER_SCREEN_IDX = NSScreen index (1-based) to scope to.
//   When set, only windows whose CG bounds intersect that screen's
//   CGDisplayBounds get an overlay. Unset / 0 = dim every screen
//   (legacy single-monitor behaviour).
//
// Exit codes:
//   0 — clean exit (scratch went away, or SIGTERM)
//   1 — failed to find Scratch.app within startup grace

// Match the binary path, NOT the directory. The user's PATH env var
// contains `…/Scratch.app/Contents/MacOS` as a search path entry, and
// every shell-spawned subprocess (npm exec, MCP servers, etc.) inherits
// it — so `pgrep -f "Scratch.app/Contents/MacOS"` matches all of them.
// Appending `/ghostty` cuts that off because the npm PATH entry ends at
// `MacOS:` (path separator), never `MacOS/ghostty`.
let SCRATCH_BINARY_PATH = (NSHomeDirectory() as NSString)
    .appendingPathComponent("Applications/Scratch.app/Contents/MacOS/ghostty")
let POLL_INTERVAL_US: UInt32 = 250_000              // 250 ms
let STARTUP_GRACE_S: TimeInterval = 3.0
let WINDOW_GRACE_S:  TimeInterval = 2.0

let opacity: Double = {
    if CommandLine.arguments.count > 1, let v = Double(CommandLine.arguments[1]) {
        return min(max(v, 0.0), 1.0)
    }
    return 0.4
}()

// Optional monitor scoping. When SCRATCH_DIMMER_SCREEN_IDX is set, the
// dimmer only overlays windows whose CG bounds intersect the named
// NSScreen's CGDisplayBounds (1-indexed to match aerospace's
// monitor-appkit-nsscreen-screens-id and scratch-axpos). Unset / 0 / out
// of range = legacy behaviour: dim every screen.
let targetScreenCG: CGRect? = {
    guard let s = ProcessInfo.processInfo.environment["SCRATCH_DIMMER_SCREEN_IDX"],
          let idx = Int(s), idx > 0,
          NSScreen.screens.indices.contains(idx - 1)
    else { return nil }
    let scr = NSScreen.screens[idx - 1]
    guard let n = scr.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber
    else { return nil }
    return CGDisplayBounds(n.uint32Value)
}()

// We initially tried bumping scratch's window above the overlays via the
// private CGSSetWindowLevel API — modern macOS hardened it against
// cross-process level changes, so the call returns success but the level
// doesn't actually move. Instead we cut a hole in each overlay at
// scratch's frame: overlays still sit at .floating, but they're
// transparent in scratch's region, so the compositor falls through to
// what's beneath the overlay at that pixel — which is scratch (above the
// dim target's window within .normal by activation order). No private
// CGS APIs needed.

func findScratchPid() -> pid_t? {
    let task = Process()
    task.launchPath = "/usr/bin/pgrep"
    task.arguments  = ["-f", SCRATCH_BINARY_PATH]
    let out = Pipe(); task.standardOutput = out; task.standardError = Pipe()
    do { try task.run() } catch { return nil }
    task.waitUntilExit()
    let data = out.fileHandleForReading.readDataToEndOfFile()
    guard let s = String(data: data, encoding: .utf8) else { return nil }
    return s.split(separator: "\n").first.flatMap { pid_t($0) }
}

func windowList() -> [[String: Any]] {
    let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
    return (CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]]) ?? []
}

// kCGWindowBounds returns a CFDictionary of CFNumbers; bridge defensively
// since Swift won't let us do `as? CFDictionary` (that downcast always
// succeeds and the compiler warns). Pull X/Y/Width/Height as NSNumber so
// CFNumber → CGFloat works on every macOS version.
func boundsRect(from window: [String: Any]) -> CGRect? {
    guard let dict = window[kCGWindowBounds as String] as? [String: Any] else { return nil }
    func num(_ key: String) -> CGFloat? {
        (dict[key] as? NSNumber).map { CGFloat(truncating: $0) }
    }
    guard let x = num("X"), let y = num("Y"),
          let wd = num("Width"), let ht = num("Height") else { return nil }
    return CGRect(x: x, y: y, width: wd, height: ht)
}

func waitForScratchWindow(pid: pid_t, deadline: Date) -> Bool {
    while Date() < deadline {
        for w in windowList() {
            guard let owner = w[kCGWindowOwnerPID as String] as? pid_t, owner == pid,
                  let layer = w[kCGWindowLayer    as String] as? Int32, layer == 0,
                  let frame = boundsRect(from: w),
                  frame.size.height > 50
            else { continue }
            return true
        }
        usleep(POLL_INTERVAL_US)
    }
    return false
}

// Find scratch's primary on-screen window frame in CG (top-left origin)
// coords. Used as the "hole" cut out of each overlay's mask.
func findScratchWindowFrame(pid: pid_t) -> CGRect? {
    for w in windowList() {
        guard let owner = w[kCGWindowOwnerPID as String] as? pid_t, owner == pid,
              let layer = w[kCGWindowLayer    as String] as? Int32, layer == 0,
              let cg    = boundsRect(from: w),
              cg.size.height > 50
        else { continue }
        return cg
    }
    return nil
}

// CG global coords are top-left origin from the primary screen's top.
// AppKit NSWindow frames are bottom-left origin from the primary screen's
// bottom. Convert by flipping y across the primary screen height.
func appKitFrame(forCGFrame cg: CGRect) -> NSRect {
    guard let primary = NSScreen.screens.first else { return cg }
    let y = primary.frame.size.height - cg.origin.y - cg.size.height
    return NSRect(x: cg.origin.x, y: y, width: cg.size.width, height: cg.size.height)
}

// macOS standard window corner radius. Big Sur+ uses ~10 pt with the
// `continuous` (squircle) curve. Match that so overlays don't bleed past
// the underlying window's rounded corners.
let WINDOW_CORNER_RADIUS: CGFloat = 10
// Fade durations. Short — these are UI hints, not stage transitions.
let FADE_IN_S:  TimeInterval = 0.18
let FADE_OUT_S: TimeInterval = 0.14

// One overlay = one dimmed background window. We hang on to the AppKit
// frame and the mask layer so the pid-monitor loop can rebuild the hole
// without recomputing or re-creating the NSWindow when scratch moves.
final class DimOverlay {
    let window: NSWindow
    let mask:   CAShapeLayer
    let frame:  NSRect
    init(window: NSWindow, mask: CAShapeLayer, frame: NSRect) {
        self.window = window; self.mask = mask; self.frame = frame
    }
}

// Build the mask path for an overlay of size `overlayFrame` (AppKit
// coords) with an optional cutout at scratch's CG frame. Pulled out so
// the same code runs at create time and on every scratch-frame change.
func buildMaskPath(overlayFrame: NSRect, scratchCG: CGRect?) -> CGPath {
    let bounds = CGRect(origin: .zero, size: overlayFrame.size)
    let path   = CGMutablePath()
    path.addRoundedRect(in: bounds,
                        cornerWidth:  WINDOW_CORNER_RADIUS,
                        cornerHeight: WINDOW_CORNER_RADIUS)

    if let s = scratchCG {
        // Scratch CG frame → AppKit globally → overlay-local.
        let sAppKit = appKitFrame(forCGFrame: s)
        let local = CGRect(
            x: sAppKit.origin.x - overlayFrame.origin.x,
            y: sAppKit.origin.y - overlayFrame.origin.y,
            width:  sAppKit.size.width,
            height: sAppKit.size.height
        )
        let cut = local.intersection(bounds)
        if !cut.isNull && cut.width > 1 && cut.height > 1 {
            path.addRoundedRect(in: cut,
                                cornerWidth:  WINDOW_CORNER_RADIUS,
                                cornerHeight: WINDOW_CORNER_RADIUS)
        }
    }
    return path
}

func makeOverlay(forCGFrame cg: CGRect, opacity: Double, level: NSWindow.Level, scratchCG: CGRect?) -> DimOverlay? {
    let frame = appKitFrame(forCGFrame: cg)
    let w = NSWindow(
        contentRect: frame,
        styleMask:   .borderless,
        backing:     .buffered,
        defer:       false
    )
    // Window background MUST be clear; the dim color is drawn into the
    // contentView's CALayer so the mask actually clips it. A non-clear
    // NSWindow background composites a square fill behind the layer and
    // the corners / hole look square again.
    w.backgroundColor      = .clear
    w.isOpaque             = false
    w.level                = level
    w.ignoresMouseEvents   = true
    w.hasShadow            = false
    w.isReleasedWhenClosed = false
    w.collectionBehavior   = [.canJoinAllSpaces, .stationary, .ignoresCycle, .fullScreenAuxiliary]
    w.setFrame(frame, display: false)

    guard let cv = w.contentView else { return nil }
    cv.wantsLayer = true
    guard let layer = cv.layer else { return nil }
    layer.backgroundColor = NSColor(white: 0, alpha: CGFloat(opacity)).cgColor

    let mask = CAShapeLayer()
    mask.path     = buildMaskPath(overlayFrame: frame, scratchCG: scratchCG)
    mask.fillRule = .evenOdd
    layer.mask = mask

    // Fade in: alphaValue 0 → 1 over FADE_IN_S so the dim doesn't snap on.
    w.alphaValue = 0
    w.orderFrontRegardless()
    NSAnimationContext.runAnimationGroup { ctx in
        ctx.duration = FADE_IN_S
        ctx.timingFunction = CAMediaTimingFunction(name: .easeOut)
        w.animator().alphaValue = 1
    }
    return DimOverlay(window: w, mask: mask, frame: frame)
}

// Two CG frames are "the same" if every edge is within 0.5pt — guards
// against sub-pixel jitter from CGWindowListCopyWindowInfo while still
// catching real moves and resizes.
func cgFramesEqual(_ a: CGRect?, _ b: CGRect?) -> Bool {
    switch (a, b) {
    case (nil, nil): return true
    case (let l?, let r?):
        return abs(l.origin.x   - r.origin.x)   < 0.5
            && abs(l.origin.y   - r.origin.y)   < 0.5
            && abs(l.size.width  - r.size.width)  < 0.5
            && abs(l.size.height - r.size.height) < 0.5
    default: return false
    }
}

// Lightweight stderr logger; scratchpad.sh redirects stderr to a tmp log.
func log(_ msg: String) {
    let line = "[scratch-dimmer] \(msg)\n"
    FileHandle.standardError.write(Data(line.utf8))
}

func describeWindow(_ w: [String: Any]) -> String {
    let pid    = (w[kCGWindowOwnerPID  as String] as? pid_t)  ?? -1
    let name   = (w[kCGWindowOwnerName as String] as? String) ?? "?"
    let layer  = (w[kCGWindowLayer     as String] as? Int32)  ?? -999
    let alpha  = (w[kCGWindowAlpha     as String] as? Double) ?? -1
    let title  = (w[kCGWindowName      as String] as? String) ?? ""
    let frame  = boundsRect(from: w).map { "(\(Int($0.origin.x)),\(Int($0.origin.y)) \(Int($0.size.width))x\(Int($0.size.height)))" } ?? "?"
    return "pid=\(pid) owner=\"\(name)\" layer=\(layer) alpha=\(alpha) title=\"\(title)\" frame=\(frame)"
}

// --- App ---
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let overlayLevel = NSWindow.Level.floating
let overlayCGLevel = Int32(overlayLevel.rawValue)

// Retained so they aren't released. Mutated only on the main queue.
var overlays: [DimOverlay] = []

// Graceful shutdown: animate every overlay's alphaValue → 0 over
// FADE_OUT_S then exit. Defined here so both the SIGTERM handler and
// the scratch-pid monitor (further down) can call it.
let shutdown: () -> Void = {
    NSAnimationContext.runAnimationGroup({ ctx in
        ctx.duration = FADE_OUT_S
        ctx.timingFunction = CAMediaTimingFunction(name: .easeIn)
        for o in overlays { o.window.animator().alphaValue = 0 }
    }, completionHandler: {
        exit(0)
    })
    // Belt-and-braces: force-exit after duration + slack in case the
    // animation engine never fires the completion handler (e.g. mid
    // fade-in interrupted by SIGTERM).
    DispatchQueue.main.asyncAfter(deadline: .now() + FADE_OUT_S + 0.10) {
        exit(0)
    }
}

DispatchQueue.global(qos: .background).async {
    // 1. Find scratch pid.
    let pidDeadline = Date().addingTimeInterval(STARTUP_GRACE_S)
    var scratchPid: pid_t? = nil
    while scratchPid == nil && Date() < pidDeadline {
        scratchPid = findScratchPid()
        if scratchPid == nil { usleep(POLL_INTERVAL_US) }
    }
    guard let pid = scratchPid else {
        log("no scratch pid found within grace window — exiting")
        DispatchQueue.main.async { exit(1) }
        return
    }
    log("found scratch pid=\(pid)")

    // 2. Wait for scratch's NSWindow to appear so we can record its frame
    //    (used to cut a hole in each overlay) and exclude it from
    //    enumeration.
    let windowFound = waitForScratchWindow(pid: pid, deadline: Date().addingTimeInterval(WINDOW_GRACE_S))
    log("scratch window found within grace = \(windowFound)")

    let scratchCG = findScratchWindowFrame(pid: pid)
    if let s = scratchCG {
        log("scratch frame (CG): origin=(\(Int(s.origin.x)),\(Int(s.origin.y))) size=\(Int(s.size.width))x\(Int(s.size.height))")
    } else {
        log("scratch frame not found — overlays will not cut a hole, scratch may appear dimmed")
    }

    // 3. Snapshot all on-screen layer-0 windows EXCEPT scratch's, build
    //    one overlay per window. Wallpaper / Finder desktop / menu bar /
    //    dock are filtered by the layer-0 / desktop-elements rules.
    DispatchQueue.main.async {
        var made = 0
        for w in windowList() {
            let isScratch = (w[kCGWindowOwnerPID as String] as? pid_t) == pid
            guard let owner = w[kCGWindowOwnerPID as String] as? pid_t, owner != pid,
                  let layer = w[kCGWindowLayer    as String] as? Int32, layer == 0,
                  let alpha = w[kCGWindowAlpha    as String] as? Double, alpha > 0.05,
                  let cg    = boundsRect(from: w),
                  cg.size.width >= 80, cg.size.height >= 60
            else {
                if isScratch { log("skip (scratch): \(describeWindow(w))") }
                continue
            }
            _ = owner

            if let name = w[kCGWindowOwnerName as String] as? String,
               name == "Window Server" || name == "Wallpaper" || name == "WallpaperAgent" {
                log("skip (system): \(describeWindow(w))")
                continue
            }

            // Monitor scoping. When a target screen is set, skip windows
            // whose CG frame doesn't overlap it. This is the multi-monitor
            // gate: scratch only spawns on the focused monitor, so dimming
            // the others would hide the user's reference material on
            // unrelated displays for no reason.
            if let target = targetScreenCG, !target.intersects(cg) {
                log("skip (off-monitor): \(describeWindow(w))")
                continue
            }

            log("dim: \(describeWindow(w))")
            if let ov = makeOverlay(forCGFrame: cg, opacity: opacity, level: overlayLevel, scratchCG: scratchCG) {
                overlays.append(ov)
                made += 1
            }
        }
        log("created \(made) overlays")
    }

    // 4. Monitor scratch pid AND scratch's window frame.
    //    - pid gone → fade out and exit (covers SIGTERM, crash, force-quit)
    //    - frame moved/resized → rebuild every overlay's mask so the hole
    //      tracks scratch. Path swaps are cheap (no NSWindow recreation).
    var lastScratchCG: CGRect? = scratchCG
    while kill(pid, 0) == 0 {
        usleep(POLL_INTERVAL_US)
        let current = findScratchWindowFrame(pid: pid)
        if !cgFramesEqual(current, lastScratchCG) {
            lastScratchCG = current
            DispatchQueue.main.async {
                for o in overlays {
                    o.mask.path = buildMaskPath(overlayFrame: o.frame, scratchCG: current)
                }
                if let c = current {
                    log("scratch moved: origin=(\(Int(c.origin.x)),\(Int(c.origin.y))) size=\(Int(c.size.width))x\(Int(c.size.height)) — masks rebuilt")
                }
            }
        }
    }
    DispatchQueue.main.async { shutdown() }
}

// SIGTERM/SIGINT via DispatchSource: raw signal() handlers can't safely
// call AppKit (animator, NSAnimationContext) because they aren't
// async-signal-safe. DispatchSource fires on the main queue where
// AppKit is legal. signal(_, SIG_IGN) is required so the default
// terminator doesn't fire first.
let sigtermSrc = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
sigtermSrc.setEventHandler(handler: shutdown)
sigtermSrc.resume()
let sigintSrc = DispatchSource.makeSignalSource(signal: SIGINT, queue: .main)
sigintSrc.setEventHandler(handler: shutdown)
sigintSrc.resume()
signal(SIGTERM, SIG_IGN)
signal(SIGINT,  SIG_IGN)

app.run()
SWIFT

swiftc -O \
  -framework Cocoa \
  -framework CoreGraphics \
  -framework ApplicationServices \
  -o "$DEST" \
  "$TMP/scratch-dimmer.swift"

echo "scratch-dimmer: built → $DEST"
