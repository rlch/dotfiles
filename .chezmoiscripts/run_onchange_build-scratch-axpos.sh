#!/usr/bin/env bash
# Build scratch-axpos: tiny native helper that sets a window's AX position by
# pid. Replaces `osascript -e 'tell application "System Events" to set position
# of window 1 ...'` on the scratchpad's hot path.
#
# Why: osascript loads the OSA framework on every cold invocation (~120ms),
# which dominates scratchpad toggle latency (measured ~260ms total, of which
# ~125ms is the osascript framework load alone). A pre-compiled Swift binary
# linking ApplicationServices skips that load — measured 10–25ms per call,
# i.e. ~5× faster on the hot path.
#
# Source is inlined (heredoc) so chezmoi's run_onchange hash captures the
# logic — edit the swift, the binary rebuilds. swiftc ships with macOS Xcode
# CLI tools (which the user has via Brewfile dependencies).
#
# AX permission: like osascript, this binary needs Accessibility permission
# the first time it runs. The Swift code uses AXIsProcessTrustedWithOptions
# with prompt=true, so macOS shows the standard grant dialog on first run.
# After the user grants and re-runs the toggle, position changes work.
set -euo pipefail

DEST="$HOME/.local/bin/scratch-axpos"

if ! command -v swiftc >/dev/null 2>&1; then
  echo "scratch-axpos: swiftc not found; skipping build (toggle will fall back to osascript)" >&2
  exit 0
fi

mkdir -p "$(dirname "$DEST")"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cat >"$TMP/scratch-axpos.swift" <<'SWIFT'
import Foundation
import ApplicationServices
import CoreGraphics
import AppKit
import CoreText

// scratch-axpos — set the front window of <pid> to a position computed
// against the bounds of a specific monitor (NSScreen index, 1-indexed to
// match aerospace's monitor-appkit-nsscreen-screens-id).
//
// Modes:
//   center     <w> <h> <screen-idx>          centred on screen with given size
//   center-pct <pw> <ph> <screen-idx>        centred + sized as a fraction
//                                            (0..1) of the screen's
//                                            visibleFrame; sets BOTH size
//                                            and position
//   park       <screen-idx>                  bottom-right "1px sliver" on
//                                            screen
//   abs        <x> <y>                       raw global AX coords (no
//                                            screen lookup)
//
// Pid-less compute mode (no AX permission needed; <pid> arg ignored):
//   cells-for  <pw> <ph> <screen-idx>        prints `<cells_w> <cells_h> <pos_x> <pos_y>`
//                                            tuned for ghostty's
//                                            JetBrainsMono Nerd Font 15pt
//                                            cell grid. Output goes
//                                            straight into
//                                            `--window-width / -height /
//                                            -position-x / -y` on the
//                                            ghostty CLI so scratch
//                                            spawns at final size + on
//                                            the focused monitor from
//                                            frame 1.
//
// CGDisplayBounds returns top-left-origin coords, the same coordinate space
// AX kAXPositionAttribute uses, so no AppKit↔AX conversion is needed.

func usage() {
    let msg = """
    usage:
      scratch-axpos <pid> center     <w> <h> <screen-idx>
      scratch-axpos <pid> center-pct <pw> <ph> <screen-idx>
      scratch-axpos <pid> park       <screen-idx>
      scratch-axpos <pid> abs        <x> <y>
      scratch-axpos cells-for        <pw> <ph> <screen-idx>
    """
    FileHandle.standardError.write(Data((msg + "\n").utf8))
}

let args = CommandLine.arguments

// Resolve the screen by aerospace's 1-indexed monitor-appkit-nsscreen-screens-id.
func screenForIdx(_ idx: Int) -> NSScreen? {
    let screens = NSScreen.screens
    let zero = max(0, idx - 1)
    return (zero < screens.count) ? screens[zero] : NSScreen.main
}

// Pid-less compute mode: print integer cell counts + pixel position so
// scratchpad.sh can hand them to ghostty's --window-* CLI overrides.
// No AX permission needed — we only read NSScreen + Core Text metrics.
//
// Calibration: ghostty draws each cell as ceil(advance * font-size /
// unitsPerEm) wide and ceil((ascent+descent+leading) * font-size /
// unitsPerEm) tall. JetBrainsMono Nerd Font @ 15pt comes out to roughly
// 9 × 33 px on retina, plus 2*(window-padding-x|y) outer chrome from
// ~/.config/ghostty/config (6 / 4 px). Using Core Text instead of
// hardcoding makes the calibration self-correct if the user bumps
// font-size or swaps fonts.
if args.count >= 2, args[1] == "cells-for" {
    guard args.count == 5,
          let pw = Double(args[2]), let ph = Double(args[3]), let idx = Int(args[4])
    else { usage(); exit(64) }
    let cpw = min(max(pw, 0.10), 1.0)
    let cph = min(max(ph, 0.10), 1.0)

    // Match ~/.config/ghostty/config exactly. If those values change,
    // bump these too — there's no CLI hook to query the resolved values
    // without spawning a ghostty.
    let fontName: String     = "JetBrainsMono Nerd Font"
    let fontSize: CGFloat    = 15
    let paddingX: CGFloat    = 6   // window-padding-x
    let paddingY: CGFloat    = 4   // window-padding-y

    let font = CTFontCreateWithName(fontName as CFString, fontSize, nil)
    // Advance of 'M' is the canonical monospace cell-width measurement.
    var glyph: CGGlyph = 0
    var ch: UniChar = 77   // 'M'
    CTFontGetGlyphsForCharacters(font, &ch, &glyph, 1)
    var advance = CGSize.zero
    CTFontGetAdvancesForGlyphs(font, .horizontal, &glyph, &advance, 1)
    let cellW = ceil(advance.width)
    let cellH = ceil(CTFontGetAscent(font) + CTFontGetDescent(font) + CTFontGetLeading(font))

    // Use NSScreen.visibleFrame (excludes menu bar / dock) so scratch
    // never overlaps system chrome. The AX coord conversion (top-left
    // origin) is what ghostty's --window-position-x/y expects.
    let mainHeight = NSScreen.screens.first?.frame.height ?? 0
    let scr = screenForIdx(idx) ?? NSScreen.main!
    let vf = scr.visibleFrame
    let visAX = CGRect(
        x: vf.minX,
        y: mainHeight - vf.maxY,
        width:  vf.width,
        height: vf.height
    )

    // Strip outer ghostty chrome before quantising to the cell grid so
    // the resulting window (cells * cellPx + 2*padding) is what we
    // intended, not "intended size minus chrome".
    let targetPxW = visAX.width  * cpw
    let targetPxH = visAX.height * cph
    let cellsW = max(20, Int(floor((targetPxW - 2 * paddingX) / cellW)))
    let cellsH = max(8,  Int(floor((targetPxH - 2 * paddingY) / cellH)))
    let actualPxW = CGFloat(cellsW) * cellW + 2 * paddingX
    let actualPxH = CGFloat(cellsH) * cellH + 2 * paddingY

    let posX = Int((visAX.minX + (visAX.width  - actualPxW) / 2.0).rounded())
    let posY = Int((visAX.minY + (visAX.height - actualPxH) / 2.0).rounded())

    print("\(cellsW) \(cellsH) \(posX) \(posY)")
    exit(0)
}

guard args.count >= 3, let pid = pid_t(args[1]) else { usage(); exit(64) }

let opts = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
guard AXIsProcessTrustedWithOptions(opts) else {
    FileHandle.standardError.write(Data("scratch-axpos: needs Accessibility permission (System Settings → Privacy & Security → Accessibility)\n".utf8))
    exit(77)
}

// Full screen bounds in AX top-left-origin coords (matches kAXPositionAttribute).
func boundsForScreen(_ idx: Int) -> CGRect {
    guard let scr = screenForIdx(idx),
          let n = scr.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber
    else {
        return CGDisplayBounds(CGMainDisplayID())
    }
    return CGDisplayBounds(n.uint32Value)
}

// Visible bounds (excludes menu bar + dock) in AX top-left-origin coords.
// AeroSpace's hideInCorner targets `visibleRect.bottomRightCorner - (1,1)` —
// that point is INSIDE the unclamped region (the clamp boundary is at the
// edge of the visible area), so the AX position write lands exactly where
// asked, leaving only a 1×1 pixel sliver visible. Targeting full screen
// bounds (e.g. (screen_w - 1, screen_h - 1)) crosses into the dock zone
// and macOS clamps it back to the visible boundary, exposing ~40px of the
// window's top edge.
//
// AppKit's visibleFrame is bottom-left origin; flip Y against the main
// screen's frame height to convert. (Aerospace uses the same trick:
// see `monitorFrameNormalized` in Sources/AppBundle/model/Rect.swift.)
func visibleBoundsForScreen(_ idx: Int) -> CGRect {
    guard let scr = screenForIdx(idx) else {
        return CGDisplayBounds(CGMainDisplayID())
    }
    let mainHeight = NSScreen.screens.first?.frame.height ?? scr.frame.height
    let vf = scr.visibleFrame
    return CGRect(
        x: vf.minX,
        y: mainHeight - vf.maxY,
        width:  vf.width,
        height: vf.height
    )
}

let mode = args[2]

if mode == "getpos" {
    // Read-only mode for diagnostics — just print current position.
    let app = AXUIElementCreateApplication(pid)
    var rawWindows: CFTypeRef?
    guard AXUIElementCopyAttributeValue(app, kAXWindowsAttribute as CFString, &rawWindows) == .success,
          let windows = rawWindows as? [AXUIElement],
          let frontWin = windows.first
    else { exit(2) }
    var posOut: CFTypeRef?
    if AXUIElementCopyAttributeValue(frontWin, kAXPositionAttribute as CFString, &posOut) == .success,
       let axVal = posOut, CFGetTypeID(axVal) == AXValueGetTypeID() {
        var got = CGPoint.zero
        AXValueGetValue(axVal as! AXValue, .cgPoint, &got)
        FileHandle.standardError.write(Data("axpos: getpos pid=\(pid) → (\(got.x),\(got.y))\n".utf8))
    } else {
        FileHandle.standardError.write(Data("axpos: getpos failed for pid=\(pid)\n".utf8))
    }
    exit(0)
}

// We need the front window early for park/center-pct (querying its size,
// or because center-pct can be invoked the instant after `open -na` while
// the AX window is still being constructed). Poll up to 3s; long-running
// callers (e.g. autoquit's `park` against an already-open window) get an
// immediate hit on the first iteration.
let app = AXUIElementCreateApplication(pid)
let windowDeadline = Date().addingTimeInterval(3.0)
var resolvedFrontWin: AXUIElement? = nil
while Date() < windowDeadline {
    var rawWindows: CFTypeRef?
    if AXUIElementCopyAttributeValue(app, kAXWindowsAttribute as CFString, &rawWindows) == .success,
       let windows = rawWindows as? [AXUIElement],
       let f = windows.first {
        resolvedFrontWin = f
        break
    }
    usleep(30_000)  // 30ms
}
guard let frontWin = resolvedFrontWin else {
    FileHandle.standardError.write(Data("axpos: no front window for pid=\(pid)\n".utf8))
    exit(2)
}

func currentSize(_ w: AXUIElement) -> CGSize {
    var raw: CFTypeRef?
    if AXUIElementCopyAttributeValue(w, kAXSizeAttribute as CFString, &raw) == .success,
       let v = raw, CFGetTypeID(v) == AXValueGetTypeID() {
        var s = CGSize.zero
        AXValueGetValue(v as! AXValue, .cgSize, &s)
        return s
    }
    return CGSize(width: 1056, height: 624)  // sensible default
}

let target: CGPoint
// When non-nil, set this size after the EUI guard but before writing
// position. Only `center-pct` populates it; other modes leave the
// existing window size intact.
var targetSize: CGSize? = nil
switch mode {
case "center":
    guard args.count == 6,
          let w = Double(args[3]), let h = Double(args[4]), let idx = Int(args[5])
    else { usage(); exit(64) }
    let b = visibleBoundsForScreen(idx)
    target = CGPoint(
        x: b.origin.x + (b.width  - w) / 2.0,
        y: b.origin.y + (b.height - h) / 2.0
    )
case "center-pct":
    guard args.count == 6,
          let pw = Double(args[3]), let ph = Double(args[4]), let idx = Int(args[5])
    else { usage(); exit(64) }
    // Clamp percentages to a sane band so a bad caller can't size the
    // window down to nothing or off-screen.
    let cpw = min(max(pw, 0.10), 1.0)
    let cph = min(max(ph, 0.10), 1.0)
    let b = visibleBoundsForScreen(idx)
    let w = (b.width  * cpw).rounded()
    let h = (b.height * cph).rounded()
    targetSize = CGSize(width: w, height: h)
    target = CGPoint(
        x: b.origin.x + ((b.width  - w) / 2.0).rounded(),
        y: b.origin.y + ((b.height - h) / 2.0).rounded()
    )
case "park":
    guard args.count == 4, let idx = Int(args[3]) else { usage(); exit(64) }
    let b = visibleBoundsForScreen(idx)
    // Aerospace's hideInCorner approach (Sources/AppBundle/tree/MacWindow.swift):
    //   p = nodeMonitor.visibleRect.bottomRightCorner - (1, 1)
    // The (1, 1) offset puts the window's top-left INSIDE the visible
    // area by 1px, so on apps with AXEnhancedUserInterface=true the EUI
    // toggle in disableAnimations bypasses macOS's window-on-screen clamp
    // and a true 1×1 sliver is left visible at the corner.
    //
    // Ghostty has EUI=false already, so the toggle is a no-op and macOS
    // clamps the Y back to the dock-zone boundary. Result: 1×40 sliver on
    // Ghostty. We accept this — it matches aerospace's exact behaviour
    // for any EUI=false app on this macOS version.
    target = CGPoint(x: b.origin.x + b.width - 1, y: b.origin.y + b.height - 1)
case "abs":
    guard args.count == 5, let x = Double(args[3]), let y = Double(args[4])
    else { usage(); exit(64) }
    target = CGPoint(x: x, y: y)
default:
    usage(); exit(64)
}

FileHandle.standardError.write(Data(
    "axpos: pid=\(pid) mode=\(mode) target=(\(target.x),\(target.y))\n".utf8
))

// Aerospace's hideInCorner trick — toggle AXEnhancedUserInterface=false on
// the application element before writing position, then restore. This
// disables AppKit's "enhanced accessibility" mode, which is what enforces
// the "keep at least ~40px of the window visible" clamp on AX position
// writes. Without this, parking at (screen_w-1, screen_h-1) on a 2056×1329
// display gets clamped from y=1328 down to y=1289 — leaving a 1×40 sliver
// of window visible at the bottom-right edge instead of a 1×1 sliver.
//
// Reference: AeroSpace's MacApp.setAxFrame in
// Sources/AppBundle/tree/MacWindow.swift (disableAnimations wrapper).
let euiAttr = "AXEnhancedUserInterface" as CFString
var euiRaw: CFTypeRef?
let euiWasEnabled: Bool =
    (AXUIElementCopyAttributeValue(app, euiAttr, &euiRaw) == .success)
    && ((euiRaw as? Bool) ?? false)
if euiWasEnabled {
    AXUIElementSetAttributeValue(app, euiAttr, kCFBooleanFalse)
}
defer {
    if euiWasEnabled {
        AXUIElementSetAttributeValue(app, euiAttr, kCFBooleanTrue)
    }
}

// Apply size first (when requested), then position. Size-then-position is
// safer on multi-monitor: writing position alone with a too-large window
// can trigger macOS's on-screen clamp before the resize lands, which
// drifts the centre and produces a brief mis-aligned frame.
if var sz = targetSize, let szVal = AXValueCreate(.cgSize, &sz) {
    let szErr = AXUIElementSetAttributeValue(frontWin, kAXSizeAttribute as CFString, szVal)
    FileHandle.standardError.write(Data(
        "axpos: setSize=\(szErr.rawValue) → (\(sz.width),\(sz.height))\n".utf8
    ))
}

var pt = target
guard let val = AXValueCreate(.cgPoint, &pt) else { exit(3) }
let setErr = AXUIElementSetAttributeValue(frontWin, kAXPositionAttribute as CFString, val)

// Read back the position to confirm the AX call actually landed where we
// asked. macOS clamps positions for off-screen safety; if the result
// differs from target, that's the smoking gun.
var posOut: CFTypeRef?
if AXUIElementCopyAttributeValue(frontWin, kAXPositionAttribute as CFString, &posOut) == .success,
   let axVal = posOut, CFGetTypeID(axVal) == AXValueGetTypeID() {
    var got = CGPoint.zero
    AXValueGetValue(axVal as! AXValue, .cgPoint, &got)
    FileHandle.standardError.write(Data(
        "axpos: set=\(setErr.rawValue) → readback=(\(got.x),\(got.y))\n".utf8
    ))
} else {
    FileHandle.standardError.write(Data("axpos: set=\(setErr.rawValue) (readback failed)\n".utf8))
}
SWIFT

swiftc -O "$TMP/scratch-axpos.swift" -o "$DEST"
echo "scratch-axpos: built $DEST"
