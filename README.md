# Interactive courses prototype

Static HTML prototype for **Inact** learning paths: hubs with course cards, a slide-style **course viewer**, and a **visual creator** for authoring `.txt` course files. Used for usability testing and as a reference for production builds.

---

## Quick start

From the repository root:

```bash
python3 tools/dev-server.py 8765
```

Then open [http://localhost:8765/index.html](http://localhost:8765/index.html) for the landing page, or any hub URL below.

`tools/dev-server.py` serves the repo like `python3 -m http.server`, and adds the
asset API the creator uses to browse and upload images. Plain `python3 -m
http.server 8765` still works for everything except uploading — the creator falls
back to reading the directory listing, and says so when you try to upload.

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

### Adding images in the creator

Set **Assets folder** on the course first — it decides which folder under `images/`
new files land in and which folder the browser opens on.

- **Drag a file from Finder onto a content field.** It uploads into the assets
  folder and inserts the markdown where the cursor is. Works on the hero image
  field too, and multiple files at once.
- **Paste a screenshot** into a content field to upload it as `pasted-<timestamp>.png`.
- **Media ▸ Image** opens a thumbnail browser of the folder, with size, alignment
  and frame as controls rather than a chain of prompts. Double-click a thumbnail
  to insert it straight away. **Image row** works the same way — select 2 to 4 and
  the column width follows the count.

Uploads never overwrite: a name that already exists gets `-1`, `-2` appended.
Videos already in `images/` show up in the browser; YouTube and R2 links are still
pasted as URLs.

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
