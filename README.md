# Interactive courses prototype

Static HTML prototype for **Inact** learning paths: hubs with course cards, a slide-style **course viewer**, and a **visual creator** for authoring `.txt` course files. Used for usability testing and as a reference for production builds.

---

## Quick start

From the repository root:

```bash
python3 -m http.server 8765
```

Then open [http://localhost:8765/index.html](http://localhost:8765/index.html) for the landing page, or any hub URL below.

---

## Main pages

| Page | Purpose |
|------|---------|
| **`index.html`** | Simple home: links to the three learning paths. |
| **`hub.html`** | Inventory management learning path. |
| **`supplier-hub.html`** | Supplier management learning path. |
| **`now-hub.html`** | Inact Now Fundamentals learning path. |
| **`course.html`** | Course viewer (flow map, slides, media). Query params vary by hub; see each hub’s “open course” links. |
| **`creator.html`** | Visual editor to build courses and export `.txt` files. |

---

## Course content

Course definitions live under `courses/` as plain text (markdown-like syntax):

- `courses/inventory/` — inventory path modules  
- `courses/supplier/` — supplier path modules  
- `courses/now/` — Inact Now path modules  

Thumbnails for hub cards: `Course-thumbnails/`. Learning-path hero images: `LP-thumbnails/` (e.g. Now fundamentals). Slide assets: `images/`.

Empty course files show a **“Coming soon”** state in the viewer instead of an error.

---

## Video and media

The viewer distinguishes **YouTube** URLs (embedded iframe with controls) from **direct video URLs** such as Cloudflare R2 `.mp4` links (native `<video>`, muted autoplay loop). Syntax and edge cases are documented in **`DEVELOPER_SPECIFICATION.md`**.

---

## Developer docs

| Document | Contents |
|----------|----------|
| **`DEVELOPER_SPECIFICATION.md`** | Layout, typography, colors, components, markdown/media syntax. |
| **`DEVELOPER_PROGRESS_GUIDE.md`** | Progress and hub behaviour notes. |
| **`react-handoff/README.md`** | React package for rebuilding the hub experience. |

---

## Repository layout (high level)

```
index.html
hub.html
supplier-hub.html
now-hub.html
course.html
creator.html
courses/              # Per-path .txt course files
images/                 # Slide and hero imagery
Course-thumbnails/      # Hub course card images
LP-thumbnails/          # Learning-path hero thumbnails
SVGs/                   # Icons and small graphics
react-handoff/          # Optional React port of hub UI
```

---

## License

MIT
