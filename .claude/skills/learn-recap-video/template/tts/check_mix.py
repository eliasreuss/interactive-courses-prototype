"""Measures the rendered stems: voice level and effect levels against it."""
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

OUT = Path(__file__).resolve().parent.parent / "out"
voice, sr = sf.read(OUT / "stem-voice.wav")
sfx, _ = sf.read(OUT / "stem-sfx.wav")
n = min(len(voice), len(sfx))
voice, sfx = voice[:n], sfx[:n]
meter = pyln.Meter(sr)

def lufs(x):
    return meter.integrated_loudness(x) if len(x) >= int(0.4 * sr) else -np.inf

def momentary(x, hop=0.1):
    win, step = int(0.4 * sr), int(hop * sr)
    starts = range(0, len(x) - win, step)
    return np.array([s / sr for s in starts]), np.array([lufs(x[s:s + win]) for s in starts])

v_int = lufs(voice)
print(f"voice integrated      {v_int:6.1f} LUFS")

t, vm = momentary(voice)
_, sm = momentary(sfx)
events = sm > -70
peaks = []
i = 0
while i < len(sm):
    if events[i]:
        j = i
        while j < len(sm) and events[j]:
            j += 1
        k = i + int(np.argmax(sm[i:j]))
        peaks.append((t[k], sm[k], vm[k]))
        i = j
    else:
        i += 1
diffs = np.array([p[1] - v_int for p in peaks])
print(f"effects               {len(peaks)} events, momentary peak {diffs.max():+.1f} dB worst, {np.median(diffs):+.1f} dB median vs voice")
loud = [p for p in peaks if p[1] - v_int > -12]
for p in loud:
    print(f"  too loud at {p[0]:6.1f}s  {p[1] - v_int:+.1f} dB")

mix, _ = sf.read(OUT / sys.argv[1]) if len(sys.argv) > 1 else (None, None)
if mix is not None:
    print(f"mix integrated        {lufs(mix):6.1f} LUFS, true peak approx {20 * np.log10(np.abs(mix).max()):.1f} dBFS")
