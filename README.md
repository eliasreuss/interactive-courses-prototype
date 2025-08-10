# Interactive Courses Prototype

Designed for usability and user testing. This prototype enables rapid prototyping of interactive learning flows in the browser. The viewer shows a left-hand flow map of nodes and edges, with a main path and branching side quests; the content pane supports embedded YouTube videos, images, flip-cards, and external link buttons. Create courses visually with the Creator—no manual formatting needed.

## Quick start
- Serve locally:
  ```bash
  cd interactive-courses-prototype
  python3 -m http.server 8000
  ```
- Open the viewer: `http://localhost:8000/index.html`
- Open the creator: `http://localhost:8000/creator.html`

## Create courses (use the Creator)
1) Go to `creator.html`
2) Add nodes, content, images, side quests, and links
3) Click "Generate & Preview Course Text" → then "Download .txt File"
4) Save the file into `courses/` (e.g., `courses/MyCourse.txt`)
5) Preview it: `http://localhost:8000/index.html?course=MyCourse.txt`

## Navigate between courses
- Default course: `Intro.txt`
- Load a specific course with the `course` query param, e.g.
  - `http://localhost:8000/index.html?course=Double-ABC-Analysis.txt`

## Add images
- Place image files in `images/`
- Use the Creator’s "Add Image" to insert them
- Ensure filenames match the files in `images/`

## Repo layout
```
index.html        # Viewer
creator.html      # Visual course creator
courses/          # Export your .txt courses here
images/           # Assets used by your courses
```

## License
MIT 