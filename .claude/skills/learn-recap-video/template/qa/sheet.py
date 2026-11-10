"""Tiles QA stills into labelled contact sheets. Called by qa/stills.mjs.

Usage: python qa/sheet.py <sheets.json> <out dir>
Scene sheets are 2 columns x up to 3 rows of half size frames (960 x 540), so
text at 24px stays readable. The overview sheet is 5 columns of 384 x 216.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ImageFont.truetype(str(ROOT / "public" / "fonts" / "Poppins-Medium.ttf"), 22)
LABEL_H = 34
GAP = 6

groups = json.loads(Path(sys.argv[1]).read_text())
out_dir = Path(sys.argv[2])
for old in out_dir.glob("*.png"):
    if any(old.stem.split("-", 1)[-1].rsplit("-", 1)[0] == g["name"] for g in groups):
        old.unlink()

for g in groups:
    cols = g["cols"]
    tile_w = 1920 // cols
    tile_h = tile_w * 9 // 16
    rows_per_sheet = 3 if cols == 2 else 6
    per_sheet = cols * rows_per_sheet
    for page in range(0, len(g["tiles"]), per_sheet):
        chunk = g["tiles"][page:page + per_sheet]
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tile_w + (cols - 1) * GAP, rows * (tile_h + LABEL_H) + (rows - 1) * GAP), "#c9cfce")
        draw = ImageDraw.Draw(sheet)
        for i, t in enumerate(chunk):
            x = (i % cols) * (tile_w + GAP)
            y = (i // cols) * (tile_h + LABEL_H + GAP)
            sheet.paste(Image.open(t["file"]).convert("RGB").resize((tile_w, tile_h), Image.LANCZOS), (x, y))
            draw.rectangle([x, y + tile_h, x + tile_w, y + tile_h + LABEL_H], fill="#304642")
            draw.text((x + 10, y + tile_h + 4), t["label"], font=FONT, fill="white")
        name = f"{max(g['index'], 0):03d}-{g['name']}-{page // per_sheet + 1}.png"
        sheet.save(out_dir / name)
        print(out_dir / name)
