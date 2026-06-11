---
name: show-image
description: Show an image to the user in a tmux split pane beside the conversation. Use whenever the user needs to SEE an image — a render, screenshot, golden/SSIM diff, plot, chart, generated asset, BRP/Blender capture, downloaded picture — rather than describing it in words. The split renders via chafa (pixel-perfect kitty-graphics passthrough to Ghostty), and the pane closes when the user presses Enter in it. NOT for images Claude itself needs to inspect — use the Read tool for that.
---

# show-image

Pop an image (or several) into a tmux split next to the pane Claude is
running in, so the user can look at it without leaving the conversation.

## Usage

```bash
~/.claude/skills/show-image/show-image.sh <image> [image...]
```

- One image → splits right of the current pane (50%), renders the image.
- Multiple images → pass all paths in ONE invocation. The first splits
  right; the rest stack vertically in that right-hand column, so the
  window stays tidy. Don't call the script once per image in a loop.
- Each viewer pane shows the filename in its border title and a dim
  `<name> — Enter closes` footer. Pressing **Enter inside the pane**
  closes it. Focus stays with the Claude pane when the splits open;
  the user clicks a viewer (mouse is on) or uses `Ctrl-s h/l` to focus
  it before pressing Enter.

## When to use

- After producing or finding a visual artifact the user should judge:
  renders, screenshots, golden-image diffs, plots, moodboard pulls,
  generated pixel art, video thumbnails.
- When comparing variants, show them together in one invocation so they
  stack side-by-side.

## When NOT to use

- Claude needs to *analyze* the image itself → use the Read tool
  (multimodal) instead; only show the user what they need to see.
- Not inside tmux (`$TMUX` unset) → the script exits 1; fall back to
  `open <image>` (macOS Preview).

## How it renders

`chafa` with `-f kitty --passthrough tmux` when the outer terminal is
Ghostty (tmux.conf sets `allow-passthrough on`, so real pixels reach the
terminal); otherwise chafa's auto-detected symbols output. Animated GIFs
show their first frame only.
