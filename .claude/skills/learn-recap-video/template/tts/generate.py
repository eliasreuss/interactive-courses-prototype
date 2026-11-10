"""Kokoro voice pipeline for an Inact Learn recap video.

Usage:
  .venv/bin/python tts/generate.py all            # every script line
  .venv/bin/python tts/generate.py lines 4 17     # regenerate selected lines only
  .venv/bin/python tts/generate.py timing         # rebuild src/timing.json only

Each line becomes public/audio/vo/NN.wav plus NN.words.json (word timestamps).
Durations are read back from the files and written to src/timing.json, which
the Remotion timeline is built from. Pronunciation fixes live in
tts/phonetics.json and only change the text sent to Kokoro, never the script.
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "script.json"
PHONETICS = ROOT / "tts" / "phonetics.json"
VO_DIR = ROOT / "public" / "audio" / "vo"
TIMING = ROOT / "src" / "timing.json"
VOICE_FILE = ROOT / "tts" / "voice.json"

SAMPLE_RATE = 24000
FPS = 30
TARGET_RMS_DB = -20.0
PEAK_CEILING_DB = -1.0
EDGE_PAD_S = 0.06
# Pauses inside a line are capped by the punctuation before them, so lists keep
# a beat between points without the narration dragging.
MAX_PAUSE_S = 0.14
COMMA_PAUSE_S = 0.28
SENTENCE_PAUSE_S = 0.45

_pipelines = {}


def pipeline_for(voice):
    lang = voice[0]
    if lang not in _pipelines:
        _pipelines[lang] = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
    return _pipelines[lang]


def apply_phonetics(text):
    if not PHONETICS.exists():
        return text
    for entry in json.loads(PHONETICS.read_text()):
        text = text.replace(entry["written"], entry["spoken"])
    return text


def synth(text, voice, speed):
    chunks, words, offset = [], [], 0.0
    for result in pipeline_for(voice)(text, voice=voice, speed=speed):
        audio = np.asarray(result.audio)
        for token in result.tokens or []:
            word = "".join(c for c in token.text.lower() if c.isalnum() or c == "'")
            if word and token.start_ts is not None:
                words.append({"w": word, "start": offset + token.start_ts, "end": offset + token.end_ts})
        chunks.append(audio)
        offset += len(audio) / SAMPLE_RATE
    return np.concatenate(chunks).astype(np.float32), words


def trim(audio, threshold_db=-45.0):
    """Returns the trimmed audio and the number of seconds cut from the start."""
    frame = int(0.01 * SAMPLE_RATE)
    level = np.array([np.sqrt(np.mean(audio[i:i + frame] ** 2) + 1e-12) for i in range(0, len(audio), frame)])
    voiced = np.where(20 * np.log10(level) > threshold_db)[0]
    if len(voiced) == 0:
        return audio, 0.0
    pad = int(EDGE_PAD_S * SAMPLE_RATE)
    start = max(0, voiced[0] * frame - pad)
    end = min(len(audio), (voiced[-1] + 1) * frame + pad)
    return audio[start:end], start / SAMPLE_RATE


def pause_caps(text, words):
    """Pause cap after each spoken word, from the punctuation that ends it in the text."""
    written = [w for w in text.split() if any(c.isalnum() for c in w)]
    if len(written) != len(words):
        print(f"  pause caps skipped: {len(written)} written words, {len(words)} spoken")
        return [MAX_PAUSE_S] * len(words)
    return [SENTENCE_PAUSE_S if w[-1] in ".?!" else COMMA_PAUSE_S if w[-1] in ",;" else MAX_PAUSE_S for w in written]


def tighten(audio, words, text="", threshold_db=-40.0):
    """Sets each pause inside a line from the punctuation before it: long pauses are
    cut to their cap, and sentence breaks shorter than SENTENCE_PAUSE_S are padded
    with silence. Word timestamps shift to match."""
    caps = pause_caps(text, words)
    frame = int(0.01 * SAMPLE_RATE)
    level = np.array([np.sqrt(np.mean(audio[i:i + frame] ** 2) + 1e-12) for i in range(0, len(audio), frame)])
    silent = 20 * np.log10(level) < threshold_db
    runs, run_start = [], None
    for i, s in enumerate(list(silent) + [False]):
        if s and run_start is None:
            run_start = i
        elif not s and run_start is not None:
            start, end = run_start * frame, min(len(audio), i * frame)
            run_start = None
            if 0 < start and end < len(audio):
                runs.append((start, end))
    # Kokoro's timestamps run through pauses, so the pause after a word is the
    # longest silence between its start and the next word's start.
    pause_after = {}
    for j in range(len(words) - 1):
        inside = [r for r in runs if words[j]["start"] * SAMPLE_RATE < r[0] < words[j + 1]["start"] * SAMPLE_RATE]
        if inside:
            run = max(inside, key=lambda r: r[1] - r[0])
            pause_after[run] = caps[j]
            # Kokoro sometimes stops mid-phrase where the text has no punctuation.
            # These are cut to MAX_PAUSE_S; log them so the line can be reworded.
            length = (run[1] - run[0]) / SAMPLE_RATE
            if caps[j] == MAX_PAUSE_S and length > 0.15:
                print(f"  unpunctuated pause {length:.2f}s after '{words[j]['w']}' (cut)")
    # (position, samples): negative removes samples from position on, positive inserts silence there.
    edits = []
    for start, end in runs:
        cap = pause_after.get((start, end), MAX_PAUSE_S)
        keep = int(cap * SAMPLE_RATE)
        length = end - start
        mid = start + min(length, keep) // 2
        if length > keep:
            edits.append((mid, -(length - keep)))
        elif cap == SENTENCE_PAUSE_S:
            edits.append((mid, keep - length))
    if not edits:
        return audio, words
    pieces, last = [], 0
    for pos, n in edits:
        pieces.append(audio[last:pos])
        if n > 0:
            pieces.append(np.zeros(n, dtype=audio.dtype))
            last = pos
        else:
            last = pos - n

    pieces.append(audio[last:])

    def shift(t):
        s = t * SAMPLE_RATE
        moved = 0
        for pos, n in edits:
            if n > 0 and s > pos:
                moved += n
            elif n < 0:
                moved -= min(-n, max(0, s - pos))
        return (s + moved) / SAMPLE_RATE

    return np.concatenate(pieces), [{**w, "start": shift(w["start"]), "end": shift(w["end"])} for w in words]


def normalise(audio):
    frame = int(0.02 * SAMPLE_RATE)
    rms = np.array([np.sqrt(np.mean(audio[i:i + frame] ** 2) + 1e-12) for i in range(0, len(audio), frame)])
    voiced = rms[20 * np.log10(rms) > -40]
    current_db = 20 * np.log10(np.sqrt(np.mean(voiced ** 2)))
    audio = audio * 10 ** ((TARGET_RMS_DB - current_db) / 20)
    peak = np.max(np.abs(audio))
    ceiling = 10 ** (PEAK_CEILING_DB / 20)
    if peak > ceiling:
        audio = audio * (ceiling / peak)
    return audio


def write_timing():
    lines = json.loads(SCRIPT.read_text())
    timing = []
    for line in lines:
        if line.get("cut"):
            continue
        path = VO_DIR / f"{line['id']:02d}.wav"
        info = sf.info(path)
        seconds = info.frames / info.samplerate
        timing.append({
            "id": line["id"],
            "scene": line["scene"],
            "file": f"vo/{path.name}",
            "seconds": round(seconds, 3),
            "frames": int(np.ceil(seconds * FPS)),
            "words": json.loads((VO_DIR / f"{path.stem}.words.json").read_text()),
        })
    TIMING.parent.mkdir(parents=True, exist_ok=True)
    TIMING.write_text(json.dumps(timing, indent=2) + "\n")
    total = sum(t["seconds"] for t in timing)
    print(f"timing.json written, {len(timing)} lines, {total:.1f}s of speech")


def generate(ids=None):
    cfg = json.loads(VOICE_FILE.read_text())
    VO_DIR.mkdir(parents=True, exist_ok=True)
    for line in json.loads(SCRIPT.read_text()):
        if line.get("cut"):
            continue
        if ids and line["id"] not in ids:
            continue
        spoken = apply_phonetics(line["text"])
        raw, words = synth(spoken, cfg["voice"], cfg["speed"])
        audio, cut = trim(raw)
        words = [{**w, "start": w["start"] - cut, "end": w["end"] - cut} for w in words]
        audio, words = tighten(audio, words, spoken)
        audio = normalise(audio)
        out = VO_DIR / f"{line['id']:02d}.wav"
        sf.write(out, audio, SAMPLE_RATE)
        length = len(audio) / SAMPLE_RATE
        words = [{"w": w["w"], "start": round(max(0.0, w["start"]), 3), "end": round(min(length, w["end"]), 3)} for w in words]
        (VO_DIR / f"{line['id']:02d}.words.json").write_text(json.dumps(words) + "\n")
        print(f"{out.name}  {length:.2f}s  {spoken}")
    write_timing()


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode == "lines":
        generate({int(i) for i in sys.argv[2:]})
    elif mode == "timing":
        write_timing()
    else:
        generate()
