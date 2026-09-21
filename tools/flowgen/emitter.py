"""Render a course JSON object into flow-script text.

The model returns structure and prose; everything mechanical is derived here.
That is the whole point of the JSON intermediate: slide ids, the nav graph,
`---` fences, `layout: standard-2-col`, topic numbering and the last slide's
missing `> [next]` are all consequences of slide order, so the model never gets
a chance to get them wrong.

This is a port of courseDataToMarkdown (creator.html:4173), which is the
canonical emitter the hand-authored courses were written with.

Course JSON shape:

    {
      "course_title": "Reducing Dead Stock",
      "description": "One sentence for the card.",
      "topic": "inventory",
      "topics": [
        {"name": "Introduction", "slides": [
          {"type": "hero", "index_title": "Welcome",
           "hero": {"subtitle": "...", "title": "...", "body": "..."},
           "image": {"ref": "intro/Hero.png"},
           "next_label": "Let's do it!"},
          {"type": "main", "index_title": "...", "title": "...",
           "body": "...", "image": {"ref": "...", "size": "500px", "align": "right"},
           "next_label": "Continue"}
        ]}
      ]
    }
"""

import re
import uuid

DEFAULT_NEXT_LABEL = "Continue"
DEFAULT_HERO_LABEL = "Let's do it!"


def new_slide_id():
    """A UUID v4 whose first character is a letter.

    course.html:2564 does `parseInt(idValue) || idValue`, so a UUID starting
    with digits collapses to its leading digit-run: `947edff7-...` becomes 947.
    Two such ids sharing that run would silently become the same node. Forcing
    a leading hex letter makes parseInt return NaN every time.
    """
    while True:
        candidate = str(uuid.uuid4())
        if candidate[0] in "abcdef":
            return candidate


def slugify(text, max_length=48):
    slug = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    if len(slug) > max_length:
        slug = slug[:max_length].rstrip("-")
    return slug or "course"


VIDEO_EXT = (".mp4", ".webm", ".mov", ".ogg")


def _media(ref, size=None, align=None, label=None):
    # The label is the alt text and the renderer's type hint. Derive it from the
    # extension rather than trusting the caller — renderMediaItem
    # (course.html:1958) keys off it and a wrong one renders a video as an img.
    if label is None:
        lowered = ref.lower().split("?")[0]
        if lowered.endswith(VIDEO_EXT):
            label = "video"
        elif lowered.endswith(".json"):
            label = "lottie"
        else:
            label = "image"
    size = size or "large"
    align = align or "center"
    return f"![{label}/size:{size}/align:{align}/frame:none]({ref})"


def _hero_body(slide):
    hero = slide.get("hero") or {}
    parts = []
    image = (slide.get("image") or {}).get("ref")
    if image:
        parts.append(f"hero_image: {image}")
    if hero.get("subtitle"):
        parts.append(f"hero_subtitle: {hero['subtitle']}")
    if hero.get("title"):
        parts.append(f"hero_title: {hero['title']}")
    if hero.get("body"):
        # hero_body swallows everything to the next hero_ key, so it can be
        # multi-line, but it must come last.
        parts.append(f"hero_body: {hero['body'].strip()}")
    return "\n".join(parts)


def _main_body(slide):
    body = (slide.get("body") or "").strip()
    row = slide.get("image_row") or []
    image = slide.get("image") or {}

    if row:
        cells = []
        for idx, item in enumerate(row, start=1):
            cells.append("{column}")
            cells.append(_media(item["ref"], size="third", align="center", label=f"image {idx}"))
            cells.append("{/column}")
        block = "{columns}\n" + "\n".join(cells) + "\n{/columns}"
        return f"{body}\n{block}" if body else block

    if image.get("ref"):
        return f"{body}\n{_media(image['ref'], image.get('size'), image.get('align'))}" if body \
            else _media(image["ref"], image.get("size"), image.get("align"))

    return body


def flatten(course):
    """Topics -> a flat list of (topic_index, topic_name, slide) in render order."""
    flat = []
    for topic_idx, topic in enumerate(course.get("topics") or [], start=1):
        name = topic.get("name")
        for slide_idx, slide in enumerate(topic.get("slides") or []):
            flat.append((topic_idx, name, slide, slide_idx == 0))
    return flat


def emit(course):
    """Render the course object to flow-script text."""
    flat = flatten(course)
    if not flat:
        raise ValueError("course has no slides")

    ids = [new_slide_id() for _ in flat]
    # Sidequests are numbered s1, s2... across the whole course.
    sidequests = []
    for _, _, slide, _ in flat:
        if slide.get("sidequest"):
            sidequests.append(slide["sidequest"])

    out = []
    sq_counter = 0
    for position, (topic_idx, topic_name, slide, is_topic_start) in enumerate(flat):
        if is_topic_start and topic_name:
            out.append(f"[id:{topic_idx}/topic: {topic_name}]")
            out.append("")

        slide_type = slide.get("type") or "main"
        is_hero = slide_type == "hero"
        body = _hero_body(slide) if is_hero else _main_body(slide)

        title = "" if is_hero else (slide.get("title") or "")
        index_title = slide.get("index_title") or title or "Slide"

        out.append(f"slide_id: {ids[position]}")
        out.append(f"index_title: {index_title}")
        out.append(f"title: {title}")
        if slide.get("title_align") == "center":
            out.append("title-align: center")
        out.append(f"type: {slide_type}")
        # Derived, never supplied: the stacked layout is exactly "there is a
        # right-aligned image in the body".
        if not is_hero and re.search(r"!\[[^\]]*/align:right[^\]]*\]\([^)]+\)", body):
            out.append("layout: standard-2-col")
        out.append("---")
        out.append(body)
        out.append("---")

        if slide.get("sidequest"):
            sq_counter += 1
            label = slide["sidequest"].get("button_label") or "Show me how"
            out.append(f"> [sidequest] {label} -> s{sq_counter}")

        # The last slide deliberately carries no > [next]; the renderer detects
        # it positionally and injects Finish (course.html:3452).
        if position < len(flat) - 1:
            default = DEFAULT_HERO_LABEL if is_hero else DEFAULT_NEXT_LABEL
            out.append(f"> [next] {slide.get('next_label') or default} -> {ids[position + 1]}")

        out.append("")

    if sidequests:
        out.append(SIDEQUEST_MARKER)
        out.append("")
        for idx, sidequest in enumerate(sidequests, start=1):
            out.append(f"[id:s{idx}/topic: {sidequest.get('topic') or 'More detail'}]")
            out.append("")
            out.append("slide_id: 1")
            out.append(f"title: {sidequest.get('topic') or 'More detail'}")
            out.append("type: sidequest")
            out.append(f"backLabel: {sidequest.get('back_label') or 'Return to course'}")
            out.append("---")
            out.append((sidequest.get("body") or "").strip())
            out.append("---")
            out.append("")

    return "\n".join(out).rstrip("\n") + "\n"


SIDEQUEST_MARKER = "[flow-specific-side-quests]"


def count_slides(course):
    return len(flatten(course))


def estimate_duration(course):
    """Minutes, rounded the way the hand-authored courses are labelled."""
    words = 0
    for _, _, slide, _ in flatten(course):
        hero = slide.get("hero") or {}
        words += len((slide.get("body") or "").split())
        words += len((hero.get("body") or "").split())
    # Reading pace plus a beat per slide to dwell on the diagram. Deliberately
    # lower than the hand-authored labels (Linked Revenue is 8 slides but marked
    # 15 min) because those budget for Supademo walkthroughs, which generated
    # courses never carry.
    minutes = max(2, round(words / 100 + count_slides(course) * 0.5))
    return f"{minutes} min"
