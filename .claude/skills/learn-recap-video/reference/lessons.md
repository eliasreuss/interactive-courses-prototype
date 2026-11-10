# Lessons

Gotchas already paid for. Read this before building. Add new ones at the end after each video. Keep each entry to one line.

## Environment

- **Shared TTS venv.** `videos/.tts-venv` (Python 3.12 via uv) is shared by every video. Each project's `tts/.venv` is a symlink to it, created by `scripts/setup_tts.sh` and `scaffold.sh`. The system Python is 3.9, which has no PIL and is too old for Kokoro.
- **Kokoro install pins.** Unpinned `uv pip install kokoro` resolves transformers 4.12, and tokenizers then fails to build. Pin `transformers>=4.44 tokenizers>=0.19` and install `en_core_web_sm` from its wheel URL.
- **faster-whisper and PyAV.** Passing a file path can fail with `TypeError: open() got an unexpected keyword argument 'metadata_errors'`. `check_vo.py` avoids this by reading with soundfile and resampling with `np.interp`.
- **macOS shell.**
  - There is no `timeout` command.
  - zsh does not word split `$var`.
  - ffmpeg inside `while read` eats stdin, so pass `-nostdin`.
  - A file name with a colon needs the `file:` prefix in ffmpeg.
- **Deleting files.** `rm` on public/audio/vo was blocked by the safety check. Overwrite files instead of deleting them.
- **No ffmpeg `drawtext`.** This build lacks it, so contact sheet labels come from Pillow (`qa/sheet.py`).

## Remotion 4.0.533

- **Audio.** Use `Html5Audio`. Load fonts with `FontFace` and `delayRender`, as in `fonts.ts`.
- **Video render.** `--color-space=bt709` gives correct BT.709 tags with no remux. The video is rendered muted, and the mix is rendered separately as WAV. Loudnorm then runs as a single AAC encode.
- **Render times.** A full render takes about 90 s. The preview (`--scale=0.5 --image-format=jpeg --muted`) takes about 40 s.
- **Stable component identity.** Define scene components once at module level. Video.tsx builds its map once. A component created inside render remounts every frame.
- **Reading timeline values in node.** Use `esbuild --bundle --platform=node --packages=external`, which is what `qa/stills.mjs` does.
- **Template scenes and missing lines.** Template scenes must not throw when their scene has no lines yet, so use `linesOf()` and `?.` guards. The registry imports every scene at bundle time.

## Voice

- **"Freight in".** Kokoro read it as "Frayden". IPA markup, stress marks and respellings all failed. Commas worked: `"Freight, in, takes ten."` in `tts/phonetics.json`. Try commas first.
- **Whisper false differences.** Numerals, "towards" against "toward", "inn" against "in", British against American spelling. `check_vo.py` spells out numbers and uses an equivalents map. Add per video variants to `tts/equivalents.json` rather than changing the script.
- **Inact.** Kokoro says "Inact" right (`ɪnˈækt`), but Whisper hears "Enact". `check_vo.py` maps it by default. Check names and acronyms with `tts/phonemes.py "<text>"` rather than trusting Whisper. Kokoro reads AA, AC, CA, CB, CC and ABC as letters with no override needed.
- **A lone "A".** Before a noun ("are A products"), Kokoro reads it as the article `ɐ`, and Whisper hears "are products". Inline phonemes fix it: `{"written": "are A products", "spoken": "are [A](/ˈA/) products"}`. Kokoro's `[word](/phonemes/)` markup works for single letters. "A, B or C" with commas reads fine.
- **Whisper drops "-ed" before "the".** It heard "explain the" for "explained the" although the phonemes have the d. Add it to `tts/equivalents.json` after confirming with `phonemes.py`.
- **Speaking rate.** About 2.95 words per second for af_heart at 1.0, measured on Category Management, where 394 words took 132.7 s of speech and 162.4 s of video.

## Visual

- **`enter()` and transform.** `enter()` spread onto a transform positioned element (`translate(-50%)`) breaks centring. Wrap it in an inner div.
- **Nowrap widths.** Width needs margin. Close chips at 780 px still wrapped and needed 940 px. Measure the longest label.
- **Ghost numeral on section cards.** At 760 px it collided with the section track and long titles, and 480 px works. Long section titles (over about 34 characters) need checking on the card.
- **Long section titles in the card track.** "Your Analysis in Inact Now" wrapped with an orphan word on every section card. The kit now spans the track from 160 to 1800 and uses `textWrap: 'balance'`, which works in Remotion's Chrome. Use balance on any multi line title.
- **Hero PNGs.** They can have an opaque white background and art cut off at the image edge (Double ABC). Recolour them with an SVG filter (ink to forest green, white to transparent) and mask any hard cut edge.
- **Minis at four sections.** They render at about 0.72 scale. Thin outlines (alpha under 0.4), tiles under 30 px and dots under 10 px disappear, and they get worse when the process dims them.
- **Heading before cards.** If a heading waits for its spoken word, the cards under it must wait too. Otherwise cards sit under an empty slot. Use the `SectionOverview` `stagger` prop to fit four cards in before the first step.
- **Bubbles and chips near tiles.** Leave 24 px or more of clearance, and check the right edge against x 1800.

## Audio

- **Tick clusters.** Four ticks 6 frames apart, or three within 0.6 s, read as one loud rattle. Use at most two, spaced 12 to 18 frames or more. `qa/stills.mjs` warns about clusters.
- **Matching RMS is misleading for long tails.** Whoosh and resolve measured only 3 to 6 dB under the voice at equal RMS, because their quiet tails pull the file RMS down. Their gains are lower in mix.ts for that reason. Always confirm with `./render.sh --stems`.
- **No music bed.** The user dropped it. Do not rebuild it.

## Process

- **What QA caught.** Self QA caught real problems through Whisper per line, contact sheets at beat frames and stem loudness. Pixel sampling retries and IPA experiments wasted turns.
- **The user's script ran long.** It came in at 162 s against an original 80 to 110 s brief, and the user preferred context to brevity.
- **Process cost (Double ABC, 2026-10-14 to 15).** Drafting the script, critic agents, parallel builders and 3 rounds of reviewer agents took hours and far too many tokens. Building Category Management directly was faster and cheaper. The skill is now lean: the user supplies the script and reviews in Studio.
- **Pacing feedback (2026-10-27).** Speed 1.0 with 2 s title cards felt slow and recap-like. Speed 1.3 was too fast and 1.1 s cards were unreadable. Settled on 1.2, 1.9 s cards, captions and standalone wording. Short words at line start ("Then you") can vanish at higher speeds, so add a comma in phonetics.json.
- **Learning path build (Inventory, 2026-10-27).** 43 lines and 27 scenes. Writing the shared parts first (theme, bookends, minis, stub scene files in the registry), then three forks on separate scene groups that touch only their own files, took about 5 minutes with no merge conflicts.
- **Curly apostrophes.** Scripts pasted from documents use ’. check_vo.py now normalises it, otherwise every "don’t" is flagged.
- **Pauses by punctuation (2026-10-28).** The user found lists rushed with every pause capped at 0.22 s. generate.py now caps pauses by the punctuation before them (0.22 s plain, 0.32 s comma, 0.45 s sentence) and pads short sentence breaks up to 0.45 s. Kokoro's word timestamps run through pauses, so the pause after a word is the longest silence between its start and the next word's start. Line gaps went to 12 and 16 frames.
- **Course art first (2026-10-28).** When the course already has an illustration for the same idea (the three questions, the pain points, variance and lead time, the cost of overbuying), crop it with a background-difference bbox (the course PNGs have black frame corners) and show it with the `Art` primitive on an artworkPanel card. Draw your own only when it needs to move. On-screen terms come from the course files, not the script (Cost of inventory, Average daily sales, Variance, Buy-to-order, Days on hand).
- **Agenda minis.** Model them on the course card thumbnails in Course-thumbnails/<area>/.

## Stock Policy (2026-10-27)

- Keep to the course. No lines or concepts the course does not have; a short course gives a short video (Stock Policy went 132 s to 124 s).
- Never draw what the viewer's policy should be. A Double ABC grid split into "Keep in stock" / "Buy-to-order" was rejected; show the course's own A item / C item contrast instead.
- Inact Now section: pull the course's Supademo with the Supademo MCP (`list_workspaces`, then `get_demo` with include steps; the response is large, read it with python). Download step images from `media.supademo.com`, narrate what the walkthrough shows, and frame them with a camera plus tangerine hotspot boxes and short labels. Pin table headers when the camera scrolls to a row. Example: reference/examples/Demo-supademo.tsx.
- An odd mid-sentence pause ("you need ... to answer") is easiest fixed by rewording the line to the course's phrasing, then scanning every wav for silences over 0.3 s that do not follow punctuation.
- `to: Infinity` in a beat throws "Frame -Infinity is not finite" in renderStill; make the end optional instead.
- **Unnatural stress and pauses (Stock Policy, round 2).** The user heard odd stress ("tryk") and pauses in many lines. Run `tts/check_prosody.py` after every voice pass. It uses Kokoro's word timestamps, flags a small word whose pitch peak beats both neighbours ("With**out a** clear", "Now **that** you know", "It's **the** best"), silences with no punctuation, and statements ending on a rise. Kokoro's stress markup (`[word](-1)`, `(+2)`) barely changes pitch, but rewording does: synthesise 2 or 3 variants, measure them and keep the clean one. Two sentences in one line made Kokoro over-stress the first ("is **often** the smartest move"), so give each sentence its own line. Mid-phrase pauses Kokoro adds are cut to 0.14 s (at 0.08 s the lengthened word before them sounded stressed) and logged by generate.py. A pipe in an Insight name ("Stock Policy | Non Stock Items") made Kokoro jump an octave, so speak it with a comma through phonetics.json. Pitch at the tracker's search edge (400 Hz) is a tracking error, not the voice.
- **Keep the Inact Now part short.** Two lines over the walkthrough (the Insight, then one example finding) was enough. Six lines going through a single product was "too deep".
- **Music bed as mp3 timed out (Learn intro, 2026-11-09).** Rendering the mix with an mp3 `Html5Audio` hit "Timeout (30000ms) exceeded" mid-render. Convert beds to 48 kHz WAV first. The intro bed sits about 13.5 dB under the voice (`MUSIC_GAIN` db(-25)).
