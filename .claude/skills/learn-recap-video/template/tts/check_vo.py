"""Transcribes each voice line with Whisper and compares it with the script.

Usage:
  .venv/bin/python tts/check_vo.py            # every line
  .venv/bin/python tts/check_vo.py 4 17       # selected lines

Prints OK or DIFF per line, and a summary. Numerals Whisper writes as digits
are spelled out before comparing. Spelling variants that are not misreads go in
tts/equivalents.json as {"heard": "scripted"} (words or phrases, lower case).
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
# Heard text (lower case) to scripted text. Whisper knows "enact", not "Inact",
# although Kokoro says Inact right (phonemes ɪnˈækt, check with tts/phonemes.py).
EQUIVALENT = {
    "enactnow": "inact now", "enact": "inact", "towards": "toward", "inn": "in", "ok": "okay",
    "categorise": "categorize", "prioritise": "prioritize", "analyse": "analyze", "optimise": "optimize",
    "organisation": "organization", "behaviour": "behavior", "colour": "color", "centre": "center",
}
EQUIVALENT.update(json.loads((ROOT / "tts" / "equivalents.json").read_text()) if (ROOT / "tts" / "equivalents.json").exists() else {})

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def spell(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    for size, name in ((10 ** 9, "billion"), (10 ** 6, "million"), (1000, "thousand"), (100, "hundred")):
        if n >= size:
            rest = n % size
            return spell(n // size) + " " + name + ("" if rest == 0 else " " + spell(rest))
    return str(n)


def number_words(match):
    digits = match.group(0).replace(",", "").replace(".", "")
    return " " + spell(int(digits)) + " "


def words(text):
    text = text.lower().replace("’", "'").replace("%", " percent ")
    for heard, scripted in sorted(EQUIVALENT.items(), key=lambda kv: -len(kv[0])):
        text = re.sub(rf"\b{re.escape(heard)}\b", scripted, text)
    text = re.sub(r"\d+(?:[.,]\d{3})*", number_words, text)
    text = re.sub(r"[^a-z' ]", " ", text.replace("-", " ").replace("$", ""))
    return [w for w in text.split() if w != "and"]


selected = {int(i) for i in sys.argv[1:]}
model = WhisperModel("small.en", device="cpu", compute_type="int8")
diffs = []
for line in json.loads((ROOT / "script.json").read_text()):
    if line.get("cut") or (selected and line["id"] not in selected):
        continue
    audio, rate = sf.read(ROOT / "public" / "audio" / "vo" / f"{line['id']:02d}.wav", dtype="float32")
    audio = np.interp(np.arange(0, len(audio), rate / 16000), np.arange(len(audio)), audio).astype(np.float32)
    segments, _ = model.transcribe(audio, beam_size=5)
    heard = " ".join(s.text.strip() for s in segments)
    ok = words(heard) == words(line["text"])
    if not ok:
        diffs.append(line["id"])
    print(f"{line['id']:02d} {'OK  ' if ok else 'DIFF'} {heard}")
print(f"\n{'all lines OK' if not diffs else 'DIFF on lines ' + ' '.join(map(str, diffs))}")
