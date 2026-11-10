# {TITLE} recap video

An animated recap of the Inact Learn {KIND} **{TITLE}**. It was built with the `learn-recap-video` skill (`.claude/skills/learn-recap-video`).

- **Output.** `{SLUG}.mp4`, 1920x1080 at 30 fps, H.264 (BT.709) with AAC 320k audio.
- **Runtime.** {RUNTIME} s, in {N} parts: {SECTIONS}.
- **Loudness.** {LUFS} LUFS integrated, {PEAK} dBTP.

The narration is `script.json` ({LINES} lines, approved {DATE}). On screen text, numbers and artwork come from {SOURCES}.

## Narrator voice

The narrator is **Kokoro 82M, voice `af_heart`, speed 1.2**, the Inact Learn narrator. The model and its voices are Apache 2.0. Pronunciation overrides are in `tts/phonetics.json`: {PHONETICS}.

## How to rerender

You need Node 18 or newer and ffmpeg. The Python environment is shared at `videos/.tts-venv`. If it is missing, create it with `.claude/skills/learn-recap-video/scripts/setup_tts.sh`.

```bash
tts/.venv/bin/python tts/generate.py all          # voice: public/audio/vo/NN.wav + src/timing.json
tts/.venv/bin/python tts/generate.py lines 7      # one line only; everything after it moves on its own
tts/.venv/bin/python tts/check_vo.py              # Whisper transcript against the script
./render.sh                                       # {SLUG}.mp4
./render.sh --audio-only                          # remix only
./render.sh --stems                               # effect levels against the voice
python3 qa/lint.py && node qa/stills.mjs          # tone lint, QA stills and contact sheets
python3 qa/final_check.py                         # delivery spec
npm run studio                                    # interactive preview
```

The timeline comes entirely from `src/timing.json`, which holds the real voice lengths and word timestamps. Each scene ties its visuals and ticks to spoken words in its `beats`. Holds and hard cuts are set in `video.json`.

## Illustrative graphics

These carry no data. They show the shape of a view, not figures from the course: {ILLUSTRATIVE}.

## Assets and licences

| Asset | Source | Licence |
|---|---|---|
| `public/images/*` | Copied from {IMAGE_DIRS} | Inact course artwork |
| `public/fonts/Poppins-*.ttf` | google/fonts | SIL Open Font License 1.1 (`public/fonts/OFL.txt`) |
| `public/audio/vo/*.wav` | Kokoro 82M, `af_heart` | Apache 2.0 model. The output is ours |
| `public/audio/sfx/*.wav` | Synthesised by `tts/sfx.py` | Original work. No third party rights |
| Line icons in `src/components/icons.tsx` | Lucide style paths | ISC |

**Remotion licence.** Remotion is free for individuals and for companies with up to 3 employees. Larger companies need a company licence.
