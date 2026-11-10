---
name: learn-recap-video
description: Build an animated, narrated recap video (Remotion + Kokoro TTS) for an Inact Learn course or learning path from a script the user supplies, in the house style of the Category Management recap. Use when the user asks for a "recap video", "course video", "video for <course>", or "another one like the Category Management video". Lean flow: script in, voice, scenes built directly, user reviews in Remotion Studio on localhost, render on request.
---

# Learn recap video

**References.** `videos/category-management-recap/` and `videos/double-abc-analysis-recap/` set the look. Match them.

**The user's role.**
- **Script.** The user writes it. Use it verbatim; never rewrite or critique it.
- **Review.** The user reviews and iterates in Remotion Studio on localhost. Do the first build well, then follow their feedback.

**Fast and cheap first.**
- **No agent loops.** Do not run critic agents, reviewer agents, QA loops or self-review rounds. Write the scenes yourself.
- **Images stay mostly out of context.** Look at a course image only when you rebuild it, and look at your own output as one overview sheet at most.
- **Subagents only when asked**, or for a learning path long enough to need them.

## Fixed decisions (do not re-ask)

- **Voice.** Kokoro 82M, `af_heart`, speed 1.2. Pauses inside a line follow the punctuation (`tts/generate.py`): 0.22 s plain, 0.32 s after a comma, 0.45 s between sentences (short sentence breaks are padded). The user found 1.0 too slow, 1.3 too fast, and lists rushed without a beat between points.
- **Standalone.** The video must work without the course. No "recap", "in this course" or "we started with" in narration or on screen. If the user's script has them, point them out and propose neutral wording. Set `label` in `video.json` to the learning path name for the opening.
- **Captions.** Burned in by `src/components/Captions.tsx`, timed from the word timestamps.
- **Pacing.** Section cards hold about 1.9 s (`CARD_FRAMES` 52), line gaps 12 and 16 frames, short holds. Aim under 2 minutes for a course; a learning path follows its script. A beat between points matters more than the runtime.
- **Course art first.** If the course has an illustration for the same idea, use it: crop it into `public/images/` (background-difference bbox, the course PNGs have black frame corners) and show it with the `Art` primitive on an artworkPanel card. Draw your own only when it has to move or build.
- **Course terms on screen.** Grep the course files for every on-screen label and use their wording, even where the script says it differently (e.g. "Cost of inventory", "Average daily sales", "Variance", "Buy-to-order"). Hyphens inside words are fine.
- **Agenda minis** take the concept of each course's card thumbnail in `Course-thumbnails/<area>/`.
- **Fill the frame.** Content spans the band y 300 to 930; no icon cards in the top half with empty space below, and no empty frames while a line is spoken.
- **Sound.** No music bed. Synthesised SFX only, 12 to 15 dB under the voice.
- **Video.** 1920x1080 at 30 fps, H.264 BT.709, −16 LUFS.
- **Design.** Inact Learn tokens and Poppins, per `reference/style-guide.md`.
- **Length follows the course.** There is no fixed runtime. A short course gets a short recap and a long course or learning path gets a longer one. The user's script sets the length, so never trim or pad it to hit a number.
- **Output.** A self contained `videos/<slug>/`. `videos/` is untracked: never commit or push it unless asked.

## Kit

| Path | What it is |
|---|---|
| `template/` | The Remotion and TTS project the scaffold copies: the timeline built from voice timings, the section system (title cards, header, progress bar), bookend scenes (Opening, Agenda, Process, Close), mix, render and QA tools. |
| `scripts/scaffold.sh <slug> "<Title>" [course\|path]` | Creates the project in about 12 s. It links the shared venv `videos/.tts-venv`, clones `node_modules` and synthesises the SFX. |
| `reference/style-guide.md` | Look, layout, motion, sound and scene craft. |
| `reference/lessons.md` | Gotchas already paid for. Skim it before building. |
| `reference/examples/` | Category Management scene code that sets the craft bar. |

### Project tools (run inside `videos/<slug>/`)

| Command | What it does |
|---|---|
| `tts/.venv/bin/python tts/generate.py all\|lines <ids>` | Generates the voice and `src/timing.json`. |
| `tts/.venv/bin/python tts/check_vo.py [ids]` | Compares a Whisper transcript with the script. |
| `tts/.venv/bin/python tts/check_prosody.py [ids]` | Flags odd stress on small words, pauses with no punctuation and rising statement endings. Reword flagged lines and measure again. |
| `tts/.venv/bin/python tts/phonemes.py "<text>"` | Shows the phonemes Kokoro will speak, for names and acronyms. |
| `npx tsc --noEmit` | Typechecks the project. |
| `python3 qa/lint.py` | Checks for dashes, colons and narration copied onto the screen, and writes `out/onscreen.txt`. |
| `node qa/stills.mjs --overview 25` | Renders one contact sheet across the whole video. Use `--frames f1,f2` for exact frames. |
| `npm run studio` | Remotion Studio on localhost:3000, for the user's review. It hot reloads on edits. |
| `./render.sh` | Renders the final video. |
| `./render.sh --stems` | Measures effects against the voice. |
| `python3 qa/final_check.py` | Checks codec, BT.709 tags, runtime, loudness, peak and tangerine. |

## Steps

### 1. Script in

- Take the user's script exactly as given. Usually it is a table: Start | Voiceover, with section heading rows such as "SECTION 1. Title" and "FINAL RECAP".
- Find the course file in `courses/<area>/courses-for-local/` and the image folder in `images/<folder>/`. The image paths inside the course file name the folder.
- Run `.claude/skills/learn-recap-video/scripts/scaffold.sh <course-kebab>-recap "<Title>"`.
- **`script.json`.** One entry per voiceover row: `{id, section, scene, text}`.
  - Rows before the first heading have section `intro`, with scenes `opening` and then `agenda`.
  - Rows under "FINAL RECAP" have section `recap`, with scene `process`, and the last practical value line gets `close`.
  - Assign the other scene names yourself, one idea per scene, usually 1 to 4 lines each.
- **`video.json`.**
  - `sections`: one `{key, title}` per heading, in order, ending with `{key: "recap", title: "Final Recap"}`.
  - `hero`, `sources` and `imageDirs`.
  - Set `runtime` to fit the script, not the template default. Estimate it at about 3.5 words per second of speech plus roughly 20 % for cards and holds, then leave a margin either side.
- Copy the course images you will use into `public/images/` with safe names, meaning no colons or spaces.

### 2. Voice (run it in the background)

- Run `generate.py all && check_vo.py && check_prosody.py`. Reword any line with an odd stress or pause (see lessons.md), then check it again.
- **Fix real misreads only.**
  - Check names and acronyms with `phonemes.py`.
  - Put fixes in `tts/phonetics.json`. Try commas first, then `[word](/phonemes/)` markup.
  - Put Whisper's mishearings in `tts/equivalents.json`.
- **Never change the script text.**
- See lessons.md: Inact, a lone "A", and "-ed" before "the".

### 3. Build

- Plan the scenes briefly in your head or in a few lines. There is no storyboard file and no critic.
- **Tie every visual to a spoken word.**
  - Use `cue(line, 'word')`. Word lists are in `src/timing.json`.
  - Rebuild any course artwork that builds up. Use finished course illustrations as they are (`Art`).
  - On screen text is anchors only, in the course's wording.
- **Each scene module** exports `beats`, `sfx` and `Scene`, and is registered in `src/scenes/index.ts`. Adapt the template bookends: Agenda cue word, Process heading and steps, Close takeaways.
- **Shared layouts.** When consecutive scenes share a layout, use one shared component and list the later scenes in `video.json` `continuous`.
- **Breathing room.** Add `holdAfter` holds after key visuals.
- **Checks.**
  - `npx tsc --noEmit` and `python3 qa/lint.py` must be clean.
  - Run `node qa/stills.mjs --overview 25` and look at that one sheet. Fix anything clearly broken, such as overlaps, clipping, or text under 24 px.

### 4. User review in Studio

- Run `npm run studio` in the background and give the user the localhost URL.
- **Apply feedback exactly and keep turns short.** Studio hot reloads, so there is no re-render between rounds.
  - For a narration change the user makes, regenerate only that line with `generate.py lines <id>`. The timeline shifts on its own.

### 5. Render (when the user says so)

1. Run `./render.sh`, which takes about 90 s.
2. Run `./render.sh --stems` to check effect levels.
3. Run `python3 qa/final_check.py`.
4. Fill `README.md` from its placeholders: runtime, loudness, sections, phonetics, illustrative graphics and assets.
5. Report the file path, the runtime and the check results in a few lines.
6. **Publish to Learn.** Copy the final `<slug>.mp4` from the project folder (not `out/video.mp4`, which is the silent render) to `recaps/<course-id>.mp4` at the repo root, export a poster from the title card with `ffmpeg -ss 2.5 -i recaps/<course-id>.mp4 -frames:v 1 -vf scale=1280:-1 -q:v 3 recaps/<course-id>.jpg`, and add the course to `RECAPS` in `recap-review.js` (src, poster, length as m:ss, course file name, and `solution`: inventory, products, suppliers, customers, now or admin, which colours the card's Watch Recap pill). The course id is the one in the hub's `courses` array. Finished courses then offer the recap under Review course.
7. Add any new gotcha to `reference/lessons.md`, one line. If the fix belongs in the kit, also fix `template/`.
