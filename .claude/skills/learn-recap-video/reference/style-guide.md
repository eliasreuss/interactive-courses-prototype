# Style guide

The bar is the Category Management recap (`videos/category-management-recap/category-management-recap.mp4`). A new video should look like the next episode of the same series: the same system and motion, with new ideas drawn in it.

## Canvas

- 1920 x 1080, 30 fps, background `color.offWhite` (#F9F7F5).
- **Header band (y 0 to 110) belongs to the section system.** The current section title sits at (120, 44) and the progress bar at right 120, top 61. Never put scene content there once section 1 has started.
- **Safe area** is x 120 to 1800 and y 120 to 980. Keep text at least 160 from the left edge when it is left aligned.
- **Scene heading** is centred at top 170 to 200: an optional `labelStyle` label (22 px, uppercase, sage), then a 52 to 64 px bold title.
- **Main content band** is y 330 to 950.
- Centre groups mathematically: `X0 = (1920 - (n * W + (n - 1) * GAP)) / 2`.

### Typical sizes

| Element | Size |
|---|---|
| Card row | 3 cards, 440 to 500 wide, gaps 60 to 90 |
| Card | 300 to 430 tall, padding 40 to 44 |
| Chip | 140 tall |
| Tile grid | 2 x 2 tiles, 620 x 310 |

## Type

- Poppins only, colour `forestGreen`, from the `type` scale in theme.ts:
  - hero 104
  - title 64
  - heading 52
  - subheading 40 to 44
  - body 30
  - small 24
- **Nothing on screen is under 24 px.**
- Big numbers are 150 to 260 px bold, and count up with `count()`.
- Weights: 700 for titles and numbers, 600 for labels and emphasis, 400 to 500 for body.
- Line height is 1.1 to 1.35.
- Single line labels get `whiteSpace: 'nowrap'`, and their box must be wide enough. The Close chips needed two QA rounds because of this.
- On screen text is anchors only, using the course's wording:
  - labels of 1 to 5 words
  - phrases of up to about 7 words
  - numbers
- Never transcribe the narration.

## Colour

- **Forest green** is used for text, data marks and badges.
- **Muted sage** is used for secondary text, dimmed states, arrows and dashed guides (`rgba(48, 70, 66, 0.3)` for dashed lines).
- **Text on course colours.** Course art often puts white text on pastel fills. White on #B2E0A9 or #F2DE50 is about 1.5:1, which is unreadable. Use forest green text on light fills and white only on strong ones (red #EA3B2E).
- **Tangerine is the progress bar's colour.** In content, use it once per scene at most, for the single thing the viewer must look at, or not at all. Category Management used none in content.
- **Course artwork colours** (category bars, 80/20 green and red) are sampled from the course PNGs with their hex values. They go in `theme.artwork` with the source file noted.
- **Surfaces:**
  - White cards, `radius.lg` 20, `shadow.ambient`.
  - Focus raises a card with `shadow.lifted` and 8 to 10 px of lift.
  - Out of focus items dim to about 0.45 opacity.
  - Chips use `radius.md` 14.
  - Icon discs are `tagGray` circles with a line icon inside.
  - A dashed outline means missing or unknown, as in the "?" card.

## Icons and artwork

- **Line icons** in the Lucide style (ISC) live in `components/icons.tsx`: stroke 2, round caps, forest green, inside tagGray discs. Add Lucide paths there, copied exactly, and credit Lucide in the README.
- **Course icons** come from the course artwork when it has them. Crop and recolour them with ffmpeg. Filenames with a colon need the `file:` prefix in ffmpeg. Copy into public/ with safe names, with no colons or spaces.
- **Rebuild anything that builds up.** Course images that show a process, a grid, axes, a breakdown or a before and after must be rebuilt as components, so each part lands on its word. Examples are the 80:20 cubes, the revenue and margin axes, the four tiles, the 50 to 20 countdown and the profit tables.
- **Finished illustrations** (hero art) may be shown as images, entering with restraint.
- **Insight walkthroughs** (Supademo slides) become an "Insight" label plus the insight name, with schematic cards that show the shape of the view. Examples are KPI Benchmark: Portfolio, then Categories, then Products, and the Category Management Insight split. **Illustrative sketches carry no numbers.** List them in the README as illustrative.

## Motion

From `motion.ts`, critically damped:

| Helper | Use |
|---|---|
| `settle` | Base spring |
| `enter(frame, start, distance=24, duration=24)` | Default entrance: a 24 px rise, fully opaque by 60 % |
| `enterExit` | Entrance that also leaves |
| `tween` | Morphing a value between states |
| `count` | Counting a number into place |

- Nothing linear, bouncy, spinning, flying or zoom punched.
- **Tie every visual event to a spoken word** with `cue(lineId, 'word')`, which fires 3 frames early, or with `lineStart` / `lineEnd`.
  - Beats live in the scene module's `beats`.
  - Ticks come from the same beats, so sound and picture can never drift.
  - If the word you need is not in the line, `at()` throws and lists the words that are.
- **Stagger** lists by 3 to 9 frames.
- **Transform in place rather than cut.** A title shrinks into a heading, tiles collapse into labels, a number counts down while chips subtract from it.
- **Focus walk.** When the narration steps through items, lift the current one and dim the rest. Release everything at the end.
- **Hold.** A key visual needs time to be read. Half a second of air after a point lands beats cramming. Use `video.json` `holdAfter: {"<line id>": 12 to 30}`.
- **Continuity.** When consecutive scenes share a layout (Category Management: axes, then fourCategories, then actions), keep shared elements at identical coordinates. Put them in a shared component and list the later scenes in `video.json` `continuous` so they hard cut instead of crossfading.
- **Never spread `enter()` (or any style with `transform`) onto an element that is itself positioned with `transform`.** It overrides the centring. Wrap it in an inner div. This caused off centre bubbles in Category Management.

## Scene craft

- **One idea per scene.** A scene usually covers 1 to 4 lines, giving 10 to 18 scenes for a course. Each scene has a build: something assembles, splits, counts, fills or transforms on the words.
- **Variety.** Do not run three consecutive scenes with the same layout. Rotate through:
  - a row of cards
  - a big number
  - a 2 x 2 grid
  - a table or list
  - a split before and after
  - a diagram on axes
  - a single statement ("Where to focus?")
- **Questions and statements.** A short spoken question ("Where to focus?") can stand alone in 52 to 64 px for a beat, then give way to the answer.
- **Bookends.** The agenda (after the opening) and the process (final recap) show the same section cards with the same mini sketches. The process lights them one by one. The close returns to the course's own payoff (Category Management: the four categories with "What to protect, improve, grow, reconsider").
- **Minis** (`src/minis.tsx`) are tiny drawings of each section's key visual, about 420 x 160, with no text beyond a number.
- **Section system.** Title cards, the header title and the progress bar are automatic (`SectionCard`, `SectionHeader`). Do not restyle them per video.
  - **Card titles** are the course's section markers, so their number follows the course, usually 3 or 4.
  - **With 4 sections,** the agenda and process cards narrow on their own. Check the minis and the title wraps in QA.
  - **A section with only one or two lines** (Double ABC: "Your Analysis in Inact Now") still gets a full scene with a build. It also gets a hold, so the card does not feel longer than the content.
- **What separates the reference from a slide deck:**
  - visuals that explain the idea (the cubes physically split 2 and 8)
  - numbers that move
  - a consistent focus treatment
  - generous space
  - nothing on screen before it is spoken

## Sound

- **Sound effects** come from `tts/sfx.py`. They are synthesised originals, so there is no licence question.
  - A whoosh is added automatically before every crossfaded scene and every card.
  - Use a `tick` when a number, tile, card or data point lands. One tick per reveal, never three within 18 frames, and keep ticks at least 12 frames apart.
  - Use a `rise` once, for the biggest assembly moment.
  - Use a `resolve` at the end (the Close template adds it).
- **Mix.**
  - Gains live in `mix.ts`. Effects sit 12 to 15 dB under the voice. If a viewer notices an effect, it is too loud.
  - There is no music bed. The user dropped it.
  - Loudness is −16 LUFS integrated with −1.5 dBTP peaks (`render.sh`).

## Learning path mode

- **Sections.** `kind: "path"` and `unit: "Course"`. Each course is a section titled with the course name, and the title cards read "Course 2 of 5".
- **Agenda.** It shows the courses. With 4 or more, `SectionOverview` narrows the cards and scales the minis on its own. Check this in QA.
- **Per course.** 3 to 5 scenes on that course's single strongest visual idea.
- **Runtime.** It depends on how many courses the path has and how long they are. About 5 minutes is typical.
- **Opening.** Use the path title and the hero of the first course, or no hero.
