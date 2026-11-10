"""Checks the finished mp4 against the delivery spec. Stdlib plus ffmpeg.

Usage: python3 qa/final_check.py

  - H.264 video tagged BT.709 (matrix, primaries, transfer), 1920x1080, 30 fps
  - AAC 48 kHz audio, audio and video the same length
  - runtime inside video.json "runtime"
  - integrated loudness -16 LUFS (+-0.5), true peak at or under -1.0 dBTP
  - tangerine in the progress bar decodes close to #FF5A00
Exit code 1 on any failure.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
video = json.loads((ROOT / "video.json").read_text())
mp4 = ROOT / f"{video['slug']}.mp4"
results = []


def check(name, ok, detail):
    results.append(ok)
    print(f"{'PASS' if ok else 'FAIL'}  {name}: {detail}")


if not mp4.exists():
    sys.exit(f"FAIL  {mp4.name} not found. Run ./render.sh")

probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(mp4)], capture_output=True, text=True).stdout)
v = next(s for s in probe["streams"] if s["codec_type"] == "video")
a = next(s for s in probe["streams"] if s["codec_type"] == "audio")
tags = (v.get("color_space"), v.get("color_primaries"), v.get("color_transfer"))
check("video", v["codec_name"] == "h264" and v["width"] == 1920 and v["height"] == 1080 and v["r_frame_rate"] == "30/1", f"{v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']}")
check("colour tags", tags == ("bt709", "bt709", "bt709"), f"matrix {tags[0]}, primaries {tags[1]}, transfer {tags[2]}")
check("audio", a["codec_name"] == "aac" and a["sample_rate"] == "48000", f"{a['codec_name']} {a['sample_rate']} Hz")
vd, ad = float(v["duration"]), float(a["duration"])
check("lengths", abs(vd - ad) < 0.1, f"video {vd:.2f}s, audio {ad:.2f}s")
low, high = video["runtime"]
check("runtime", low <= vd <= high, f"{vd:.1f}s, target {low} to {high}s")

ebu = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-i", str(mp4), "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
summary = ebu[ebu.rfind("Summary:"):]
i_lufs = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1))
peak = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary).group(1))
check("loudness", abs(i_lufs + 16) <= 0.5, f"{i_lufs:.1f} LUFS")
check("true peak", peak <= -1.0, f"{peak:.1f} dBTP")

# Tangerine: the current segment of the progress bar, decoded with the BT.709 matrix.
n = len(video["sections"])
x0 = 1920 - 120 - (n * 88 + (n - 1) * 8)
w, y, h = 1800 - x0, 60, 8
t = vd * 0.5
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-nostdin", "-ss", f"{t:.2f}", "-i", str(mp4), "-frames:v", "1",
     "-vf", f"scale=in_color_matrix=bt709:in_range=tv,format=rgb24,crop={w}:{h}:{x0}:{y}", "-f", "rawvideo", "-"],
    capture_output=True,
).stdout
pixels = [tuple(raw[i:i + 3]) for i in range(0, len(raw) - 2, 3)]
best = min(pixels, key=lambda p: (p[0] - 255) ** 2 + (p[1] - 90) ** 2 + p[2] ** 2) if pixels else (0, 0, 0)
dist = ((best[0] - 255) ** 2 + (best[1] - 90) ** 2 + best[2] ** 2) ** 0.5
check("tangerine", dist < 12, f"#{best[0]:02X}{best[1]:02X}{best[2]:02X} at {t:.1f}s, distance {dist:.1f} from #FF5A00")

print("final check passed" if all(results) else "final check FAILED")
sys.exit(0 if all(results) else 1)
