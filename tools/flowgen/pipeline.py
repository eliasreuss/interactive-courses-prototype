"""Retrieve, outline, expand, validate, write.

The two model calls share a cached system prefix; only the context below the
breakpoint changes between them, so the second call reads the prefix from
cache rather than paying for it again.
"""

import datetime
import json
import os
import re
import time

from . import client, config, emitter, image_catalog, knowledge_index, prompts, validator

# Filenames that would collide with a hand-authored course's progress record.
# courseFileToId in course.html is keyed by basename, so a generated
# "Admin-Intro.txt" would silently share progress with the real one.
RESERVED_BASENAMES = None


def _reserved_basenames():
    """Read the courseFileToId keys out of course.html rather than copying them."""
    global RESERVED_BASENAMES
    if RESERVED_BASENAMES is not None:
        return RESERVED_BASENAMES
    names = set()
    path = os.path.join(config.REPO_ROOT, "course.html")
    try:
        with open(path, encoding="utf-8") as handle:
            text = handle.read()
        block = re.search(r"courseFileToId\s*=\s*\{(.*?)\}", text, re.S)
        if block:
            for match in re.finditer(r"['\"]([^'\"]+\.txt)['\"]", block.group(1)):
                names.add(match.group(1).split("/")[-1].lower())
    except OSError:
        pass
    RESERVED_BASENAMES = names
    return names


def safe_slug(raw, fallback="course"):
    slug = emitter.slugify(raw or fallback)
    slug = re.sub(r"^gen-+", "", slug) or fallback
    return f"gen-{slug}"


def unique_path(directory, basename):
    """Never clobber. Mirrors unique_path in tools/dev-server.py."""
    stem, ext = os.path.splitext(basename)
    candidate, n = basename, 1
    while os.path.exists(os.path.join(directory, candidate)):
        candidate = f"{stem}-{n}{ext}"
        n += 1
    return candidate


def _progress(job, status, label, fraction):
    if job is None:
        return
    job.update(status=status, phase_label=label, progress=fraction)


def run(prompt, job=None, dry_run=False):
    """Generate one course. Returns a result dict."""
    started = time.time()
    cancel = getattr(job, "cancel", None)

    # --- retrieve --------------------------------------------------------
    _progress(job, "retrieving", "Understanding your topic", 0.04)
    records = knowledge_index.load()
    scored = knowledge_index.score(prompt, records)

    # Nothing in the material is about this. Saying so here is both cheaper
    # and more honest than letting the model improvise a course out of
    # whatever the shortlist happened to return.
    top_score = scored[0][0] if scored else 0.0
    if top_score < config.MIN_COVERAGE_SCORE:
        raise NoCoverage(prompt, top_score)

    shortlist_text = knowledge_index.shortlist_for_prompt(scored)
    catalog_records = image_catalog.load()
    catalog_text = image_catalog.catalog_for_prompt(catalog_records)
    system_prefix = prompts.stable_prefix(catalog_text)

    if dry_run:
        return {
            "dry_run": True,
            "prefix_chars": len(system_prefix),
            "shortlist": [r["path"] for _, r in scored],
            "images": len(catalog_records),
            "outline_prompt": prompts.outline_user_message(prompt, shortlist_text),
        }

    api = client.get_client()

    # --- outline ---------------------------------------------------------
    _progress(job, "outlining", "Outlining the course", 0.10)
    outline, outline_usage = client.generate_json(
        api,
        system_prefix=system_prefix,
        volatile="",
        messages=[{"role": "user",
                   "content": prompts.outline_user_message(prompt, shortlist_text)}],
        schema=prompts.OUTLINE_SCHEMA,
        effort=config.OUTLINE_EFFORT,
        cancel=cancel,
    )
    # Structured outputs rejects maxItems, so the upper bounds live in the
    # field descriptions and are enforced here instead.
    outline["chosen_chunks"] = (outline.get("chosen_chunks") or [])[:16]
    outline["candidate_images"] = (outline.get("candidate_images") or [])[:40]
    outline["topics"] = (outline.get("topics") or [])[:6]
    for topic in outline["topics"]:
        topic["slide_briefs"] = (topic.get("slide_briefs") or [])[:5]

    planned_slides = sum(len(t.get("slide_briefs") or []) for t in outline.get("topics") or [])
    if job is not None:
        job.update(outline=outline)

    # --- expand ----------------------------------------------------------
    _progress(job, "writing", f"Writing {planned_slides} slides", 0.18)
    chunks = knowledge_index.read_chunks(outline.get("chosen_chunks") or [])
    chunk_text = knowledge_index.chunks_for_prompt(chunks)

    # Narrow the image field to what the outline shortlisted, plus the topic
    # fallback hero, so a path outside the catalog becomes impossible rather
    # than merely detectable.
    allowed = [ref for ref in (outline.get("candidate_images") or [])
               if image_catalog.exists(ref)]
    allowed.append(config.TOPIC_HERO.get(outline.get("topic"), config.TOPIC_HERO["general"]))
    if len(allowed) < 6:
        allowed.extend(image_catalog.all_refs(catalog_records)[:200])
    schema = prompts.expand_schema(allowed)

    def on_delta(text):
        # One str.count per delta: the number of slides written so far.
        written = text.count('"index_title"')
        if planned_slides:
            fraction = 0.18 + 0.62 * min(written / planned_slides, 1.0)
            _progress(job, "writing",
                      f"Writing slide {min(written + 1, planned_slides)} of {planned_slides}",
                      fraction)

    conversation = [
        {"role": "user", "content": prompts.expand_user_message(prompt, outline, chunk_text)},
    ]
    course, expand_usage = client.generate_json(
        api,
        system_prefix=system_prefix,
        volatile="",
        messages=conversation,
        schema=schema,
        effort=config.EXPAND_EFFORT,
        on_delta=on_delta,
        cancel=cancel,
    )

    course["topics"] = (course.get("topics") or [])[:6]
    for topic in course["topics"]:
        topic["slides"] = (topic.get("slides") or [])[:5]

    usages = [outline_usage, expand_usage]

    # --- validate, with up to two repair rounds --------------------------
    _progress(job, "validating", "Checking the course", 0.86)
    topic_hero = config.TOPIC_HERO.get(outline.get("topic"), config.TOPIC_HERO["general"])
    _bookend_hero_image(course, topic_hero)
    text = emitter.emit(course)
    issues = validator.validate(text)
    errors = [i for i in issues if i.level == "error"]

    rounds = 0
    while errors and rounds < config.MAX_REPAIR_ROUNDS:
        rounds += 1
        _progress(job, "validating", f"Fixing {len(errors)} issue(s)", 0.88)
        conversation = conversation + [
            {"role": "assistant", "content": json.dumps(course)},
            {"role": "user", "content": prompts.repair_user_message(errors)},
        ]
        course, repair_usage = client.generate_json(
            api,
            system_prefix=system_prefix,
            volatile="",
            messages=conversation,
            schema=schema,
            effort=config.EXPAND_EFFORT,
            cancel=cancel,
        )
        usages.append(repair_usage)
        _bookend_hero_image(course, topic_hero)
        text = emitter.emit(course)
        issues = validator.validate(text)
        errors = [i for i in issues if i.level == "error"]

    totals = {}
    for usage in usages:
        for key, value in usage.items():
            totals[key] = round(totals.get(key, 0) + value, 4)
    totals["calls"] = len(usages)
    totals["repair_rounds"] = rounds

    if errors:
        # Write nothing. A silently broken course in the repo is worse than a
        # visible failure, and the draft is still returned for inspection.
        raise GenerationFailed(
            f"the course still had {len(errors)} problem(s) after {rounds} repair attempt(s)",
            draft=text,
            issues=[_issue_dict(i) for i in issues],
            usage=totals,
        )

    # --- write -----------------------------------------------------------
    _progress(job, "assembling", "Assembling the course file", 0.94)
    slug = safe_slug(outline.get("slug") or course.get("course_title"))
    basename = f"{slug}.txt"
    if basename.lower() in _reserved_basenames():
        basename = f"{slug}-custom.txt"
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    basename = unique_path(config.OUTPUT_DIR, basename)
    target = os.path.join(config.OUTPUT_DIR, basename)

    tmp = target + ".tmp"
    with open(tmp, "w", encoding="utf-8") as handle:
        handle.write(text)
    os.replace(tmp, target)

    entry = {
        "id": os.path.splitext(basename)[0],
        "file": basename,
        "title": course.get("course_title") or "Untitled course",
        "description": course.get("description") or "",
        "prompt": prompt,
        "topic": course.get("topic") or outline.get("topic") or "general",
        "slideCount": emitter.count_slides(course),
        "duration": emitter.estimate_duration(course),
        "heroImage": None,
        "createdAt": datetime.datetime.now(datetime.timezone.utc)
                      .replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "status": "ready",
    }
    add_to_manifest(entry)
    write_sidecar(entry, prompt, outline, totals, issues, time.time() - started)

    return {
        "slug": entry["id"],
        "path": os.path.relpath(target, config.REPO_ROOT),
        "open_url": f"course.html?course={basename}&path=custom&hub=my-courses.html&from=hub",
        "entry": entry,
        "issues": [_issue_dict(i) for i in issues],
        "usage": totals,
        "elapsed_s": round(time.time() - started, 1),
    }


def _bookend_hero_image(course, fallback_ref):
    """Give the course a real hero and repeat it on the closing slide.

    Every hand-authored course opens and closes on the same artwork — the
    welcome slide and the "you have completed" slide share one hero_image —
    so a generated course that picks two unrelated images, or none, reads as
    unfinished. The model is told this in the prompt; this makes it true
    regardless, because the closing image is the one detail it drops most.

    The fallback only applies to the opening slide. If the model gave the
    course no hero at all, there is nothing to echo and the topic hero stands
    in for it.
    """
    flat = [slide
            for topic in (course.get("topics") or [])
            for slide in (topic.get("slides") or [])]
    if not flat:
        return

    first, last = flat[0], flat[-1]
    hero_ref = (first.get("image") or {}).get("ref") or fallback_ref
    if not hero_ref:
        return
    first["image"] = dict(first.get("image") or {}, ref=hero_ref)

    if last is first:
        return
    # A closing slide built from an image row would lose that row's meaning if
    # we dropped a single image on top of it, so leave those alone.
    if last.get("image_row"):
        return
    last["image"] = dict(last.get("image") or {}, ref=hero_ref)


def _issue_dict(issue):
    return {"level": issue.level, "code": issue.code, "message": issue.message,
            "slide": issue.slide, "line": issue.line}


def read_manifest():
    try:
        with open(config.MANIFEST_PATH, encoding="utf-8") as handle:
            data = json.load(handle)
        if isinstance(data, dict) and isinstance(data.get("courses"), list):
            return data
    except (OSError, ValueError):
        pass
    return {"version": 1, "generatedAt": None, "courses": []}


def write_manifest(data):
    os.makedirs(os.path.dirname(config.MANIFEST_PATH), exist_ok=True)
    tmp = config.MANIFEST_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    os.replace(tmp, config.MANIFEST_PATH)


def add_to_manifest(entry):
    data = read_manifest()
    data["courses"] = [entry] + [c for c in data["courses"] if c.get("file") != entry["file"]]
    data["generatedAt"] = entry["createdAt"]
    write_manifest(data)


def remove_from_manifest(filename):
    data = read_manifest()
    before = len(data["courses"])
    data["courses"] = [c for c in data["courses"] if c.get("file") != filename]
    write_manifest(data)
    return len(data["courses"]) != before


def write_sidecar(entry, prompt, outline, usage, issues, elapsed):
    os.makedirs(config.META_DIR, exist_ok=True)
    payload = {
        "entry": entry,
        "prompt": prompt,
        "model": config.MODEL,
        "outline": outline,
        "usage": usage,
        "warnings": [_issue_dict(i) for i in issues],
        "elapsed_s": round(elapsed, 1),
    }
    path = os.path.join(config.META_DIR, f"{entry['id']}.json")
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)


class NoCoverage(Exception):
    """The knowledge base has no material close enough to the prompt."""

    def __init__(self, prompt, top_score=0.0):
        super().__init__("no material covers this topic")
        self.prompt = prompt
        self.top_score = top_score


class GenerationFailed(Exception):
    def __init__(self, message, draft=None, issues=None, usage=None):
        super().__init__(message)
        self.draft = draft
        self.issues = issues or []
        self.usage = usage or {}
