"""Flags narration that is likely to sound unnatural: silences where the text has
no punctuation, drawn out words, a word whose pitch jumps well above the line
(odd stress, most telling on small words like "is", "that", "to") and
statements that end on a rise.

Usage:
  .venv/bin/python tts/check_prosody.py            # every line
  .venv/bin/python tts/check_prosody.py 4 17       # selected lines

Word spans come from Kokoro's own timestamps (NN.words.json), which match the
audio exactly. Pitch is a plain autocorrelation estimate on voiced frames, good
enough to spot a jump of several semitones, not for fine intonation. Treat the
flags as places to listen, not verdicts.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

from generate import apply_phonetics

ROOT = Path(__file__).resolve().parent.parent
VO_DIR = ROOT / "public" / "audio" / "vo"
HOP = 0.01

PAUSE_PLAIN = 0.16  # silence after a word with no punctuation after it
STRETCH = 2.0  # word length per letter against the line's median, not counting the last word
STRESS_ST = 9.0  # a content word's peak above the line's median pitch
SMALL_ST = 1.0  # a small word's peak above both neighbours' peaks, which pulls the stress off the word it belongs to
RISE_ST = 4.0  # last word against the one before it, on a statement
FUNCTION = set("a an the to of in on at for and or but is are was be by with your you it its that this as from".split())


def pitch_track(audio, sr, win=0.04, fmin=120, fmax=400):
    n, h = int(win * sr), int(HOP * sr)
    out = []
    for i in range(0, len(audio) - n, h):
        x = audio[i:i + n] - np.mean(audio[i:i + n])
        if np.sum(x * x) < 1e-4:
            out.append(np.nan)
            continue
        ac = np.correlate(x, x, "full")[n - 1:]
        lo, hi = sr // fmax, sr // fmin
        lag = lo + int(np.argmax(ac[lo:hi]))
        # A lag at either end of the search range is the tracker failing, not the voice.
        out.append(sr / lag if ac[lag] / ac[0] > 0.45 and lo < lag < hi - 1 else np.nan)
    return np.array(out)


def silences(audio, sr, threshold_db=-40.0):
    frame = int(HOP * sr)
    level = np.array([np.sqrt(np.mean(audio[i:i + frame] ** 2) + 1e-12) for i in range(0, len(audio), frame)])
    quiet = 20 * np.log10(level) < threshold_db
    runs, start = [], None
    for i, q in enumerate(list(quiet) + [False]):
        if q and start is None:
            start = i
        elif not q and start is not None:
            runs.append((start * HOP, i * HOP))
            start = None
    return runs


def check(line):
    stem = f"{line['id']:02d}"
    audio, sr = sf.read(VO_DIR / f"{stem}.wav")
    words = json.loads((VO_DIR / f"{stem}.words.json").read_text())
    written = [w for w in apply_phonetics(line["text"]).split() if any(c.isalnum() for c in w)]
    aligned = len(written) == len(words)
    f0 = pitch_track(audio, sr)
    voiced = f0[~np.isnan(f0)]
    if not len(voiced):
        return ["no voiced audio"]
    median = 12 * np.log2(np.median(voiced))
    runs = silences(audio, sr)
    letters = [max(1, len(re.sub(r"[^a-z0-9]", "", w["w"]))) for w in words]
    rate = np.median([(w["end"] - w["start"]) / n for w, n in zip(words, letters)])
    issues, pitch, peaks = [], [], []
    for w in words:
        seg = f0[int(w["start"] / HOP):int(w["end"] / HOP)]
        seg = seg[~np.isnan(seg)]
        pitch.append(12 * np.log2(np.median(seg)) - median if len(seg) >= 3 else np.nan)
        peaks.append(12 * np.log2(np.max(seg)) - median if len(seg) else np.nan)
    for i, w in enumerate(words):
        nxt = words[i + 1]["start"] if i + 1 < len(words) else w["end"]
        st = peaks[i]
        token = written[i] if aligned else w["w"]
        if i + 1 < len(words) and not (aligned and token[-1] in ",;:.?!"):
            gap = max([b - a for a, b in runs if w["start"] < a < nxt] or [0])
            if gap > PAUSE_PLAIN:
                issues.append(f"pause {gap:.2f}s after '{token}'")
        speech = min(w["end"], nxt) - w["start"]
        if i + 1 < len(words) and letters[i] >= 3 and speech / letters[i] > STRETCH * rate:
            issues.append(f"drawn out '{token}' ({speech:.2f}s)")
        around = [peaks[j] for j in (i - 1, i + 1) if 0 <= j < len(words) and not np.isnan(peaks[j])]
        if np.isnan(st):
            continue
        if w["w"] in FUNCTION and around and st > max(around) + SMALL_ST and st > 3:
            issues.append(f"stress on small word '{token}' ({st - max(around):+.1f} st over its neighbours)")
        elif w["w"] not in FUNCTION and st > STRESS_ST:
            issues.append(f"stress on '{token}' (+{st:.1f} st)")
    last = [p for p in pitch[-2:] if not np.isnan(p)]
    if line["text"].rstrip().endswith(".") and len(last) == 2 and last[1] - last[0] > RISE_ST:
        issues.append(f"ends on a rise (+{last[1] - last[0]:.1f} st)")
    return issues


def main():
    ids = {int(i) for i in sys.argv[1:]}
    lines = [l for l in json.loads((ROOT / "script.json").read_text()) if not l.get("cut") and (not ids or l["id"] in ids)]
    flagged = 0
    for line in lines:
        issues = check(line)
        flagged += bool(issues)
        print(f"{line['id']:02d} {'FLAG' if issues else 'OK  '} {line['text']}")
        for i in issues:
            print(f"     {i}")
    print(f"\n{flagged} of {len(lines)} lines flagged")


if __name__ == "__main__":
    main()
