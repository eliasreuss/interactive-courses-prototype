"""Prints the phonemes Kokoro will speak for each argument, so names and
acronyms can be checked without listening (Whisper often mishears names).

Usage: .venv/bin/python tts/phonemes.py "Inact Now" "AA" "Pareto"
"""
import json
import sys
from pathlib import Path

from kokoro import KPipeline

voice = json.loads((Path(__file__).resolve().parent / "voice.json").read_text())["voice"]
pipeline = KPipeline(lang_code=voice[0], repo_id="hexgrad/Kokoro-82M")
for text in sys.argv[1:]:
    print(f"{text!r:28} {' '.join(r.phonemes for r in pipeline(text, voice=voice))}")
