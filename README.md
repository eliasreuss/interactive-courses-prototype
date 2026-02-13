# Interactive Courses Prototype

Designed for usability and user testing. This prototype enables rapid prototyping of interactive learning flows in the browser. It includes a **Learning Path hub** (`hub.html`) with a hero header, course cards in a responsive grid, and progress tracking — plus an individual **course viewer** (`course.html`) with a flow map, embedded media, and interactive content. Create courses visually with the **Creator** (`creator.html`) — no manual formatting needed.

---

## Quick Start

```bash
cd interactive-courses-prototype
python3 -m http.server 8000
```

| Page | URL |
|------|-----|
| **Learning Path Hub** | `http://localhost:8000/hub.html` |
| **Course Viewer** | `http://localhost:8000/course.html?course=Intro.txt&from=hub` |
| **Course Creator** | `http://localhost:8000/creator.html` |

---

## Pages

### `hub.html` — Learning Path Hub

The main entry point. Shows all courses in a responsive card grid with:

- **Hero header** — dark card with glassmorphism tags, CTA button, decorative graphs image, subtle white grid background, and an animated progress bar at the bottom.
- **Course cards** — thumbnail, glass-style duration pill and icon, per-card progress bar, and hover micro-interactions (lift, zoom, arrow slide).
- **Responsive grid** — 1 column (< 700px) → 2 columns (≥ 700px) → 3 columns (≥ 1200px).
- **Progress tracking** — reads/writes `localStorage` per course. Determines CTA labels ("Start" / "Continue" / "Review") and highlights the next course to take.
- **Scroll-reveal** — cards animate in on scroll via `IntersectionObserver`.

### `course.html` — Course Viewer

Interactive course viewer with a left-hand flow map (nodes + edges), main path and branching side quests. Content pane supports YouTube embeds, images, flip-cards, and link buttons. Navigates back to `hub.html` on completion.

### `creator.html` — Course Creator

Visual editor for building course content files. Export as `.txt` and drop into `courses/`.

---

## Create Courses

1. Open `creator.html`
2. Add nodes, content, images, side quests, and links
3. Click **Generate & Preview Course Text** → **Download .txt File**
4. Save the file into `courses/` (e.g. `courses/MyCourse.txt`)
5. Preview: `http://localhost:8000/course.html?course=MyCourse.txt&from=hub`

---

## Current Learning Path

| # | Course | Duration | File |
|---|--------|----------|------|
| 1 | Intro to Inact - Inventory | 8 min | `Intro.txt` |
| 2 | Double ABC Analysis | 15 min | `Double-ABC-Analysis-4.txt` |
| 3 | Stock Policy | 10 min | `Stock-Policy.txt` |
| 4 | Safety Stock | 12 min | `Safety-Stock.txt` |
| 5 | Reorder Point | 10 min | `Reorder-Point.txt` |
| 6 | Reorder Quantity | 12 min | `Reorder-Quantity.txt` |

---

## Repo Layout

```
hub.html              # Learning Path hub (main entry)
course.html           # Individual course viewer
creator.html          # Visual course creator
courses/              # Exported .txt course files
images/               # Course content images + hero graphics
Course-thumbnails/          # Course card thumbnail images
SVGs/                 # Icon assets (Learning-Path, Bookmark, Share, etc.)
react-handoff/        # React component package (see below)
```

---

## React Handoff

The `react-handoff/` folder contains a complete React component package for rebuilding the hub page. Designed to be copied into an existing React project. Includes:

- **Global styles** — design tokens (`theme.css`) and glass utility (`glass.css`)
- **Components** — `TopNav`, `HeroHeader`, `CourseCard`, `CourseGrid`, `HubPage`
- **Assets** — all SVGs and images needed by the components
- **Data** — course array and helper functions
- **README** — full setup instructions, component props, and design system docs

See [`react-handoff/README.md`](react-handoff/README.md) for detailed integration instructions.

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#304642` | Dark green — hero, text, progress |
| `--color-primary-light` | `#3d5a54` | Hover states |
| `--color-accent` | `#FF5A00` | Orange — logo accent, focus rings |
| `--color-bg` | `#FAFAFA` | Page background |
| Font | Poppins | Weights: 300, 400, 500, 600, 700 |

### Responsive Breakpoints

**Grid layout:**
| Width | Columns |
|-------|---------|
| < 700px | 1 |
| ≥ 700px | 2 |
| ≥ 1200px | 3 |

**Page margins:**
| Width | Margin |
|-------|--------|
| Default | 40px |
| ≥ 1400px | 120px |
| ≥ 1600px | 180px |
| ≥ 1920px | 280px |
| ≥ 2200px | 380px |
| ≥ 2560px | 480px |

---

## License

MIT
