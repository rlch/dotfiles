# Renders agent-chromium.png: Chromium's own icon with a robot badge, so the
# agents' browser never passes for one of the user's. Regenerate with
#   iconutil -c iconset /Applications/Chromium.app/Contents/Resources/app.icns -o /tmp/c.iconset
#   python3 -I make-icon.py /tmp/c.iconset/icon_128x128@2x.png /tmp/a.png && sips -z 512 512 /tmp/a.png --out agent-chromium.png
import sys
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
base = Image.open(src).convert("RGBA").resize((1024, 1024), Image.LANCZOS)
W = 1024
d = ImageDraw.Draw(base)
# badge: mauve disc with a dark ring, bottom-right
cx, cy, r = 730, 730, 215
d.ellipse((cx-r-18, cy-r-18, cx+r+18, cy+r+18), fill=(30, 30, 46, 255))
d.ellipse((cx-r, cy-r, cx+r, cy+r), fill=(203, 166, 247, 255))
ink = (30, 30, 46, 255)
# robot head
hw, hh = 260, 190
hx0, hy0 = cx - hw//2, cy - hh//2 + 30
d.rounded_rectangle((hx0, hy0, hx0+hw, hy0+hh), radius=60, fill=ink)
# antenna
d.line((cx, hy0, cx, hy0-70), fill=ink, width=26)
d.ellipse((cx-32, hy0-110, cx+32, hy0-46), fill=ink)
# ears
d.rounded_rectangle((hx0-40, cy-10, hx0+10, cy+90), radius=18, fill=ink)
d.rounded_rectangle((hx0+hw-10, cy-10, hx0+hw+40, cy+90), radius=18, fill=ink)
# eyes
ey = hy0 + 80
for ex in (cx-70, cx+70):
    d.ellipse((ex-36, ey-36, ex+36, ey+36), fill=(203, 166, 247, 255))
# mouth
d.rounded_rectangle((cx-70, hy0+150, cx+70, hy0+176), radius=12, fill=(203, 166, 247, 255))
base.save(out)
