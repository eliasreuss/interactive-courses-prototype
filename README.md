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
| **`my-courses.html`** | Describe a topic and have a course generated for it. See below. |

### Generating courses (optional)

`my-courses.html` turns a prompt into a real course file, written by Claude
Opus 5 and opened in the normal viewer. It needs two things beyond the quick
start:

```bash
pip install anthropic
export ANTHROPIC_API_KEY=sk-ant-...     # or put it in a .env file at the repo root
python3 tools/dev-server.py 8765
```

Without them the server still serves the whole prototype — only the prompt box
locks, and it says which of the two is missing. Generated courses land in
`courses/custom/courses-for-local/` with a `gen-` prefix, are listed in
`courses/custom/manifest.json`, and are gitignored: they are per-machine, not
shared. Roughly $0.40–0.60 and one to three minutes each.

They are ordinary `.txt` course files, so a good one can be moved into a real
learning path and edited in `creator.html` from then on.

The generator lives in `tools/flowgen/`. Two pieces are useful on their own:

```bash
# Check any course file the way the viewer's parser will read it.
# --audit allows Supademo embeds, which generated courses may not carry.
python3 tools/flowgen/validator.py --audit courses/*/courses-for-local/*.txt

# See what the knowledge base returns for a question.
python3 -m tools.flowgen.knowledge_index "reduce dead stock in spare parts"
```

`knowledge/` holds the chunked Inact AI material the generator draws on.

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
