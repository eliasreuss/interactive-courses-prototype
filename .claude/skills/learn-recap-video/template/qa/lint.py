"""Lints the script and the on screen text against the Inact tone rules and
the script writing guide.

Usage:
  python3 qa/lint.py            lint (stdlib only)
  python3 qa/lint.py --table    also print the script as the guide's Start | Voiceover table

Checks script.json (tone, word budget, estimated runtime), checks that the
video.json section titles are the course's own section markers in course order,
then checks every text string in src/**/*.tsx. Writes all on screen strings to
out/onscreen.txt for the fidelity review. Exit code 1 when there are errors.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORDS_PER_SECOND = 3.5  # Kokoro af_heart at speed 1.2 with tightened pauses, measured on the Double ABC video

DASHES = re.compile(r"[‐-―⸺⸻-]")
BANNED_CHARS = {";": "semicolon", ":": "colon", "*": "asterisk"}
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")
FILLER = [
    "it's important to note", "it is important to note", "let's explore", "let us explore", "streamline", "game changer",
    "gamechanger", "game-changer", "not just", "not only", "dive into", "deep dive", "delve", "leverage", "unlock",
    "seamless", "robust", "in today's", "journey", "elevate", "empower", "cutting edge", "harness", "supercharge",
    "at the end of the day", "in a nutshell", "simply put", "whether you're", "look no further", "navigate the",
    "as we can see", "as you can see", "fast paced", "next, we will", "we will now", "moving on", "another important",
    "congratulations", "thank you for watching", "we hope you", "in this video",
]
CONDITIONAL = re.compile(r"\b(might|could|may|perhaps|possibly)\b", re.I)

errors, warnings = [], []


def check_text(where, text, spoken):
    # A hyphen inside a word ("Buy-to-order", "C-items") is course wording, not a dash.
    if DASHES.search(re.sub(r"(?<=\w)-(?=\w)", "", text)):
        errors.append(f"{where}: dash character in {text!r}")
    for ch, name in BANNED_CHARS.items():
        if ch in text:
            errors.append(f"{where}: {name} in {text!r}")
    if EMOJI.search(text):
        errors.append(f"{where}: emoji in {text!r}")
    low = text.lower()
    for f in FILLER:
        if f in low:
            errors.append(f"{where}: filler phrase {f!r}")
    if spoken:
        if re.search(r"\d", text):
            warnings.append(f"{where}: digits in narration. Spell numbers as words so Kokoro reads them right")
        if CONDITIONAL.search(text):
            warnings.append(f"{where}: conditional wording ({CONDITIONAL.search(text).group(0)}). Prefer a definitive statement")
        for sentence in re.split(r"(?<=[.?!])\s+", text):
            n = len(sentence.split())
            if n > 22:
                warnings.append(f"{where}: {n} word sentence. Split it for the ear")


video = json.loads((ROOT / "video.json").read_text())
script = [l for l in json.loads((ROOT / "script.json").read_text()) if not l.get("cut")]
keys = {s["key"] for s in video["sections"]} | {"intro"}
if any(s["key"] == "recap" for s in video["sections"][:-1]):
    errors.append("video.json: the recap section, when there is one, must be last")
for s in video["sections"]:
    check_text(f"video.json section {s['key']}", s["title"], spoken=False)

ids = [l["id"] for l in script]
if ids != sorted(set(ids)):
    errors.append("script.json: ids must be unique and ascending")
total_words = 0
for l in script:
    where = f"script {l['id']:02d}"
    if l["section"] not in keys:
        errors.append(f"{where}: section {l['section']!r} is not in video.json")
    check_text(where, l["text"], spoken=True)
    total_words += len(l["text"].split())
for required in ("opening", "agenda", "process", "close"):
    if required not in {l["scene"] for l in script}:
        warnings.append(f"script.json: no line uses the {required!r} scene")

# Runtime, simulated with the same gaps, holds and title cards as src/timeline.ts.
FPS, LEAD_IN, GAP_SAME, GAP_NEW, OUTRO, CARD = 30, 8, 9, 14, 75, 62
hold = {int(k): v for k, v in video.get("holdAfter", {}).items()}
cursor, starts = LEAD_IN, {}
for i, l in enumerate(script):
    prev = script[i - 1] if i else None
    if prev and l["section"] != prev["section"] and l["section"] != "intro":
        cursor += CARD + GAP_NEW
    starts[l["id"]] = cursor
    frames = round((len(l["text"].split()) / WORDS_PER_SECOND + 0.15) * FPS)
    nxt = script[i + 1] if i + 1 < len(script) else None
    cursor += frames + hold.get(l["id"], 0) + (GAP_SAME if nxt and nxt["scene"] == l["scene"] else GAP_NEW)
estimate = (cursor + OUTRO) / FPS
low, high = video["runtime"]
wlow, whigh = video.get("words", [0, 10 ** 6])
note = "" if low <= estimate <= high else f"  OUTSIDE runtime target {low} to {high}s"
print(f"script: {len(script)} lines, {total_words} words (target {wlow} to {whigh}), about {estimate:.0f}s{note}")
if not wlow <= total_words <= whigh:
    warnings.append(f"script.json: {total_words} words is outside the {wlow} to {whigh} word budget")

# Sections must be the course's own section markers, in course order.
MARKER = re.compile(r"^\[id:(\d+)/topic:\s*(.+?)\]\s*$", re.M)
norm = lambda t: re.sub(r"[^a-z0-9 ]", "", t.lower().replace("\u2019", "'")).strip()
markers = []
for src in video.get("sources", []):
    path = ROOT.parent.parent / src
    if path.exists():
        markers += [(src, int(m.group(1)), m.group(2).strip()) for m in MARKER.finditer(path.read_text())]
if markers and video.get("kind") == "course":
    order = []
    for s in video["sections"]:
        if s["key"] == "recap":
            continue
        topic = s.get("topic", s["title"])
        hit = next((m for m in markers if norm(m[2]) == norm(topic)), None)
        if hit is None:
            warnings.append(f"video.json section {s['key']}: {topic!r} is not a course section marker. Markers: {', '.join(m[2] for m in markers)}")
        else:
            order.append(hit[1])
            if norm(hit[2]) != norm(s["title"]):
                warnings.append(f"video.json section {s['key']}: title {s['title']!r} reworded from marker {hit[2]!r}. Keep the meaning")
    if order != sorted(order):
        warnings.append("video.json: sections are not in course order")

if "--table" in sys.argv:
    titles = {s["key"]: s["title"] for s in video["sections"]}
    numbers = {s["key"]: i + 1 for i, s in enumerate(video["sections"])}
    print("\n| Start | Voiceover |\n| --- | --- |")
    section = None
    for l in script:
        if l["section"] != section and l["section"] != "intro":
            heading = "FINAL RECAP" if l["section"] == "recap" else f"SECTION {numbers[l['section']]}. {titles[l['section']]}"
            print(f"| | **{heading}** |")
        section = l["section"]
        t = starts[l["id"]] / FPS
        print(f"| {int(t // 60)}:{int(t % 60):02d} | {l['text']} |")
    print()

# On screen text: JSX text nodes and string literals that read as words.
narration = {re.sub(r"\W+", " ", l["text"].lower()).strip() for l in script}
SKIP = re.compile(r"^(?:[./#@]|rgba?\(|https?:|\d|[a-z]+[A-Z]|[a-z-]+$)|\.(?:png|jpe?g|svg|mp4|wav|json|ts|tsx)$|px\b|\bsolid\b|\b(?:translate|rotate|scale|skew|matrix)[XYZ3d]*\(")
CSS_WORDS = {"left", "right", "top", "bottom", "center", "middle", "auto", "none", "solid", "dashed", "nowrap", "flex", "start", "end", "both", "hidden", "visible", "inherit", "contain", "cover"}
JSX_TEXT = re.compile(r">\s*([^<>{}]*[A-Za-z][^<>{}]*?)\s*<")
LITERAL = re.compile(r"(?<![\w$])(['\"`])((?:(?!\1)[^\\\n]|\\.)*)\1")
found = []
for path in sorted((ROOT / "src").rglob("*.tsx")):
    rel = path.relative_to(ROOT)
    source = path.read_text().splitlines()
    for n, raw in enumerate(source, 1):
        code = raw.split("//", 1)[0] if not raw.strip().startswith("*") else ""
        # JSX text alone on its own line, between a tag and its closing tag.
        if n > 1 and source[n - 2].rstrip().endswith(">") and re.fullmatch(r"\s*[A-Z][A-Za-z0-9 ,.?!'%&\u2212-]*", code):
            found.append((f"{rel}:{n}", code.strip()))
            continue
        if code.strip().startswith(("import ", "export type", "type ")):
            continue
        candidates = [(m.group(1), True) for m in JSX_TEXT.finditer(code)]
        candidates += [(m.group(2), False) for m in LITERAL.finditer(code)]
        for text, jsx in candidates:
            text = text.strip()
            if len(text) < 2 or not re.search(r"[A-Za-z]{2}", text) or SKIP.search(text) or "${" in text:
                continue
            if not jsx and " " not in text and not re.fullmatch(r"[A-Z][a-z]+[.!?]?|[A-Z]{2,}s?", text):
                continue  # keys, ids and CSS values, not words a viewer reads
            if not jsx and set(text.lower().split()) <= CSS_WORDS:
                continue
            found.append((f"{rel}:{n}", text))

out = ROOT / "out"
out.mkdir(exist_ok=True)
(out / "onscreen.txt").write_text("".join(f"{w}\t{t}\n" for w, t in found))
for where, text in found:
    check_text(where, text.replace("−", ""), spoken=False)
    if len(text) > 48:
        warnings.append(f"{where}: {len(text)} characters on screen. Anchors only, not sentences")
    if re.sub(r"\W+", " ", text.lower()).strip() in narration:
        errors.append(f"{where}: on screen text repeats a narration line word for word")
print(f"on screen: {len(found)} strings written to out/onscreen.txt")

for e in errors:
    print(f"ERROR {e}")
for w in warnings:
    print(f"WARN  {w}")
print("lint passed" if not errors else f"lint failed, {len(errors)} errors")
sys.exit(1 if errors else 0)
