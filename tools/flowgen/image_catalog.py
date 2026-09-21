"""Describe every usable image in images/ so the model can pick one.

Filenames alone are a weak signal — `Waiter.png` is a service-level metaphor
and `PC.png` is unguessable. But roughly half the library already sits next
to a paragraph of prose in a hand-authored course, so mine that: for each
image, the course and slide it appears on and the line of copy above it.

    python3 tools/flowgen/image_catalog.py [filter]
"""

import json
import os
import re
import sys
import threading

from . import config

CACHE_PATH = os.path.join(config.CACHE_DIR, "image-catalog.json")
_LOCK = threading.Lock()
_MEMO = {"fingerprint": None, "records": None}

MEDIA_EXT = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif", ".mp4", ".webm", ".mov")
MEDIA_RE = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)\)")
HERO_RE = re.compile(r"^hero_image:\s*(\S+)", re.M)
TITLE_RE = re.compile(r"^title:\s*(.*)$")
CAPTION_MAX = 110
# Lines that carry no descriptive value as a caption.
SKIP_LINE = re.compile(r"^(---|\{/?columns?\}|\{/?column\}|>\s*\[|hero_\w+:|slide_id:|index_title:|"
                       r"title:|type:|layout:|title-align:|backLabel:|\[id:|\[supademo:|!\[)")
# Sign-off boilerplate. It sits directly above the outro image in most courses,
# so it wins the "nearest line above" race while describing nothing.
BOILERPLATE = re.compile(r"^(let.s (get started|keep going|do it|dive in|go)|"
                         r"congratulations|well done|that.s it)\b", re.I)


def scan_images():
    records = {}
    if not os.path.isdir(config.IMAGES_ROOT):
        return records
    for entry in sorted(os.listdir(config.IMAGES_ROOT)):
        folder = os.path.join(config.IMAGES_ROOT, entry)
        if not os.path.isdir(folder) or entry.startswith(".") or entry in config.FORBIDDEN_IMAGE_DIRS:
            continue
        for name in sorted(os.listdir(folder)):
            if name.startswith(".") or not name.lower().endswith(MEDIA_EXT):
                continue
            ref = f"{entry}/{name}"
            records[ref] = {
                "ref": ref,
                "folder": entry,
                "stem": os.path.splitext(name)[0],
                "kind": "video" if name.lower().endswith((".mp4", ".webm", ".mov")) else "image",
                "courses": [],
                "slide_titles": [],
                "captions": [],
                "hero": False,
            }
    return records


def _course_files():
    for path, _, names in os.walk(config.COURSES_ROOT):
        # Skip generated output and archives — we want how humans used images.
        if "custom" in path.split(os.sep) or "archive" in path.split(os.sep):
            continue
        if not path.endswith("courses-for-local"):
            continue
        for name in sorted(names):
            if name.endswith(".txt"):
                yield os.path.join(path, name)


def _course_label(path):
    stem = os.path.splitext(os.path.basename(path))[0]
    return re.sub(r"-IN-UUID$", "", stem).replace("-", " ")


def mine_usage(records):
    for path in _course_files():
        try:
            with open(path, encoding="utf-8") as handle:
                text = handle.read()
        except (OSError, UnicodeDecodeError):
            continue
        course = _course_label(path)
        lines = text.split("\n")
        current_title = ""

        for idx, line in enumerate(lines):
            title_match = TITLE_RE.match(line)
            if title_match:
                current_title = title_match.group(1).strip()
                continue

            hero_match = HERO_RE.match(line.strip())
            refs = []
            if hero_match:
                refs = [(hero_match.group(1), True)]
            else:
                refs = [(ref, False) for _, ref in MEDIA_RE.findall(line)]

            for ref, is_hero in refs:
                record = records.get(ref)
                if record is None:
                    continue
                if course not in record["courses"]:
                    record["courses"].append(course)
                if is_hero:
                    record["hero"] = True
                if current_title and current_title not in record["slide_titles"]:
                    record["slide_titles"].append(current_title)
                caption = _caption_above(lines, idx)
                if caption and caption not in record["captions"]:
                    record["captions"].append(caption)
    return records


def _caption_above(lines, idx):
    """Nearest descriptive line above the ref, within the same slide body."""
    for back in range(idx - 1, max(idx - 8, -1), -1):
        candidate = lines[back].strip()
        if not candidate:
            continue
        if candidate == "---":
            break  # left the content block
        if SKIP_LINE.match(candidate):
            continue
        cleaned = re.sub(r"\*\*(.+?)\*\*", r"\1", candidate).lstrip("* ").strip()
        if len(cleaned) < 15 or BOILERPLATE.match(cleaned):
            continue
        if len(cleaned) > CAPTION_MAX:
            cleaned = cleaned[:CAPTION_MAX].rsplit(" ", 1)[0] + "…"
        return cleaned
    return ""


def fingerprint():
    count = total = 0
    for root in (config.IMAGES_ROOT, config.COURSES_ROOT):
        for path, dirnames, names in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in config.FORBIDDEN_IMAGE_DIRS
                           and d != "custom" and not d.startswith(".")]
            for name in names:
                if name.startswith("."):
                    continue
                try:
                    stat = os.stat(os.path.join(path, name))
                except OSError:
                    continue
                count += 1
                total += stat.st_size + int(stat.st_mtime)
    return f"{count}:{total}"


def build():
    return sorted(mine_usage(scan_images()).values(), key=lambda r: r["ref"])


def load(force=False):
    current = fingerprint()
    if not force and _MEMO["fingerprint"] == current and _MEMO["records"]:
        return _MEMO["records"]
    with _LOCK:
        if not force and _MEMO["fingerprint"] == current and _MEMO["records"]:
            return _MEMO["records"]
        if not force and os.path.isfile(CACHE_PATH):
            try:
                with open(CACHE_PATH, encoding="utf-8") as handle:
                    cached = json.load(handle)
                if cached.get("fingerprint") == current:
                    _MEMO.update(fingerprint=current, records=cached["records"])
                    return cached["records"]
            except (OSError, ValueError, KeyError):
                pass
        records = build()
        _MEMO.update(fingerprint=current, records=records)
        try:
            os.makedirs(config.CACHE_DIR, exist_ok=True)
            tmp = CACHE_PATH + ".tmp"
            with open(tmp, "w", encoding="utf-8") as handle:
                json.dump({"fingerprint": current, "records": records}, handle)
            os.replace(tmp, CACHE_PATH)
        except OSError:
            pass
        return records


def line_for(record):
    where = record["courses"][0] if record["courses"] else ""
    if record["hero"]:
        # A hero is cover art for its course. The course name describes it far
        # better than whichever sentence happens to sit above it, which on an
        # outro slide is a sign-off about the *next* course.
        return f'{record["ref"]} | hero image for {where} | course cover art'
    if record["captions"]:
        slide = f', slide "{record["slide_titles"][0]}"' if record["slide_titles"] else ""
        return f'{record["ref"]} | {where}{slide} | "{record["captions"][0]}"'
    if record["courses"]:
        return f'{record["ref"]} | used in {record["courses"][0]} | folder: {record["folder"]}'
    kind = " (video)" if record["kind"] == "video" else ""
    return f'{record["ref"]} | (unused){kind} | folder: {record["folder"]}'


def catalog_for_prompt(records=None):
    records = records if records is not None else load()
    return "\n".join(line_for(r) for r in records)


def all_refs(records=None):
    records = records if records is not None else load()
    return [r["ref"] for r in records]


def exists(ref):
    if not ref or ref.startswith(("http://", "https://", "learn/")):
        return True
    if ref.split("/")[0] in config.FORBIDDEN_IMAGE_DIRS:
        return False
    target = os.path.abspath(os.path.join(config.IMAGES_ROOT, ref))
    return target.startswith(config.IMAGES_ROOT) and os.path.isfile(target)


if __name__ == "__main__":
    needle = " ".join(sys.argv[1:]).lower()
    records = load()
    mined = [r for r in records if r["captions"]]
    used = [r for r in records if r["courses"]]
    print(f"{len(records)} images · {len(used)} used in a course · {len(mined)} with a mined caption")
    text = catalog_for_prompt(records)
    print(f"catalog is {len(text)} chars (~{len(text)//4} tokens)\n")
    shown = [r for r in records if needle in line_for(r).lower()] if needle else records[:40]
    for record in shown[:40]:
        print(line_for(record))
