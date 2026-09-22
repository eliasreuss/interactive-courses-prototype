"""Check a flow-script course the way course.html's parser will read it.

The renderer is forgiving in the worst way: a stray `---` or a body line that
looks like a directive does not raise, it silently produces a half-empty slide.
So this validator models parseFlowScript (course.html:2454) block for block and
reports what would go wrong, before anything is written to courses/.

It runs on rendered text, which makes it a check on the emitter as much as on
the model, and lets the 28 hand-authored courses serve as the regression suite:

    python3 tools/flowgen/validator.py courses/*/courses-for-local/*.txt
"""

import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMAGES_ROOT = os.path.join(REPO_ROOT, "images")

SIDEQUEST_MARKER = "[flow-specific-side-quests]"
TOPIC_RE = re.compile(r"^\[id:([^/]+)/topic:\s*(.+?)\]$")
NAV_RE = re.compile(r"^>\s*\[([^\]]+)\]\s*(.+?)\s*->\s*(.+)$")
MEDIA_RE = re.compile(r"!\[(.*?)\]\(([^)\s]+)\)")
# The renderer's own regex stops at whitespace, so a ref with a space silently
# truncates. Match loosely here so we can report it rather than miss it.
MEDIA_LOOSE_RE = re.compile(r"!\[(.*?)\]\(([^)]*)\)")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
NAMED_SIZES = {"x-small", "small", "medium", "large", "third", "fourth"}
PX_SIZE_RE = re.compile(r"^\d+px$")
HERO_KEYS = {"hero_image", "hero_subtitle", "hero_title", "hero_body"}
VALID_TYPES = {"hero", "main", "sidequest", "flip-cards"}
FORBIDDEN_IMAGE_DIRS = ("animations/", "legacy/")
# Banned in generated courses only: the hand-authored customers courses still
# point at placeholder-images/, so an --audit run must not flag them.
GENERATED_FORBIDDEN_IMAGE_DIRS = ("placeholder-images/",)
# Bare <br> is the one HTML the renderer documents; everything else reaching
# innerHTML unescaped is a hazard.
HTML_RE = re.compile(r"<(?!br\s*/?>)[a-zA-Z/]")
DROPPED_MARKDOWN_RE = re.compile(r"^(#{1,6}\s|\d+\.\s|\||```|>\s*[^[])")


class Issue:
    def __init__(self, level, code, message, slide=None, line=None):
        self.level = level
        self.code = code
        self.message = message
        self.slide = slide
        self.line = line

    def __str__(self):
        where = f"L{self.line}" if self.line else "-"
        slide = f" [{self.slide}]" if self.slide else ""
        return f"  {self.level:5} {self.code:26} {where:>6}{slide} {self.message}"


class Slide:
    """One parsed block, mirroring what parseFlowScript would build."""

    def __init__(self, raw_id, line_no, topic_id, is_sidequest):
        self.raw_id = raw_id
        self.line_no = line_no
        self.topic_id = topic_id
        self.is_sidequest = is_sidequest
        self.headers = {}
        self.header_lines = []   # (line_no, text)
        self.body_lines = []     # (line_no, text)
        self.nav = []            # (line_no, nav_type, label, target)
        self.fence_count = 0

    @property
    def label(self):
        return self.headers.get("index_title") or self.headers.get("title") or str(self.raw_id)

    @property
    def body(self):
        return "\n".join(text for _, text in self.body_lines)


def coerce_id(raw):
    """Mirror `parseInt(idValue) || idValue` from course.html:2564.

    JS parseInt reads a leading run of digits and ignores the rest, so the UUID
    `947edff7-...` becomes the number 947. Falsy results (0, NaN) fall back to
    the original string.
    """
    match = re.match(r"^[+-]?\d+", raw)
    if match:
        value = int(match.group())
        if value:
            return value
    return raw


def parse(text):
    """Split into (main_slides, sidequest_slides, topics, issues_from_parsing)."""
    marker_idx = text.find(SIDEQUEST_MARKER)
    if marker_idx == -1:
        sections = [(text, False, 0)]
    else:
        head = text[:marker_idx]
        sections = [
            (head, False, 0),
            (text[marker_idx + len(SIDEQUEST_MARKER):], True, head.count("\n")),
        ]

    main, sidequests, topics = [], [], []
    for section_text, is_sidequest, line_offset in sections:
        if not section_text.strip():
            continue
        target = sidequests if is_sidequest else main
        current = None
        current_topic = None
        in_content = False

        for rel_no, line in enumerate(section_text.split("\n"), start=1):
            line_no = rel_no + line_offset
            stripped = line.strip()

            # Topic headers and slide_id are matched BEFORE the content guard in
            # the real parser, which is exactly why they are dangerous in a body.
            topic_match = TOPIC_RE.match(stripped)
            if topic_match:
                current_topic = topic_match.group(1).strip()
                topics.append((line_no, current_topic, topic_match.group(2).strip(), is_sidequest, in_content))
                current = None
                in_content = False
                continue

            if stripped.startswith("slide_id:") or stripped.startswith("id:"):
                raw_id = stripped.split(":", 1)[1].strip()
                was_in_content = in_content
                current = Slide(raw_id, line_no, current_topic, is_sidequest)
                current.opened_mid_content = was_in_content
                target.append(current)
                in_content = False
                continue

            if current is None:
                continue

            if stripped == "---":
                current.fence_count += 1
                in_content = not in_content
                continue

            if in_content:
                nav_match = NAV_RE.match(line) if line.startswith(">") else None
                if nav_match:
                    nav_type = nav_match.group(1).strip().lower()
                    # Only next / next:flow are consumed inside content;
                    # a [sidequest] here falls through and renders as text.
                    if nav_type in ("next", "next:flow"):
                        current.nav.append((line_no, nav_type, nav_match.group(2).strip(),
                                            nav_match.group(3).strip(), True))
                        continue
                current.body_lines.append((line_no, line))
            else:
                if line.startswith(">"):
                    nav_match = NAV_RE.match(line)
                    if nav_match:
                        current.nav.append((line_no, nav_match.group(1).strip().lower(),
                                            nav_match.group(2).strip(),
                                            nav_match.group(3).strip(), False))
                    continue
                colon_idx = line.find(":")
                if colon_idx > 0:
                    key = line[:colon_idx].strip()
                    current.headers[key] = line[colon_idx + 1:].strip()
                    current.header_lines.append((line_no, line))

    return main, sidequests, topics


def _check_media(slide, issues, image_refs):
    for line_no, line in slide.body_lines:
        for _, ref in MEDIA_LOOSE_RE.findall(line):
            if ref != ref.strip() or re.search(r"\s", ref):
                issues.append(Issue("error", "IMAGE_HAS_SPACE",
                                    f"media ref contains whitespace and will be truncated: {ref!r}",
                                    slide.label, line_no))
                continue
            image_refs.append((line_no, slide.label, ref))
        for attrs, _ in MEDIA_RE.findall(line):
            for part in attrs.split("/"):
                if part.startswith("size:"):
                    size = part[5:].strip()
                    if size not in NAMED_SIZES and not PX_SIZE_RE.match(size):
                        issues.append(Issue("error", "IMAGE_SIZE_INVALID",
                                            f"unknown size {size!r}", slide.label, line_no))


def validate(text, repo_root=REPO_ROOT, check_files=True, generated=True):
    """generated=False audits hand-authored courses, which may embed Supademos."""
    images_root = os.path.join(repo_root, "images")
    issues = []
    main, sidequests, topics = parse(text)

    if not main:
        issues.append(Issue("error", "NO_SLIDES", "no parsable slides — viewer shows 'Coming soon'"))
        return issues

    # --- whole-file content checks ------------------------------------------
    if generated and re.search(r"\[supademo:", text, re.I):
        line_no = next(i for i, l in enumerate(text.split("\n"), 1) if "[supademo:" in l.lower())
        issues.append(Issue("error", "SUPADEMO_FORBIDDEN",
                            "generated courses must not embed Supademo walkthroughs", None, line_no))

    # --- ids ----------------------------------------------------------------
    seen_raw, seen_coerced = {}, {}
    for slide in main:
        if getattr(slide, "opened_mid_content", False):
            issues.append(Issue("error", "DIRECTIVE_IN_BODY",
                                "slide_id: appeared inside a content block and silently started a new slide",
                                slide.label, slide.line_no))
        if not UUID_RE.match(slide.raw_id):
            issues.append(Issue("error", "SLIDE_ID_INVALID",
                                f"main-path slide_id is not a UUID v4: {slide.raw_id!r}",
                                slide.label, slide.line_no))
        if slide.raw_id in seen_raw:
            issues.append(Issue("error", "SLIDE_ID_DUPLICATE",
                                f"slide_id {slide.raw_id!r} already used at line {seen_raw[slide.raw_id]}",
                                slide.label, slide.line_no))
        seen_raw[slide.raw_id] = slide.line_no

        coerced = coerce_id(slide.raw_id)
        if isinstance(coerced, int):
            if coerced in seen_coerced and seen_coerced[coerced] != slide.raw_id:
                issues.append(Issue("error", "SLIDE_ID_NUMERIC_COLLISION",
                                    f"{slide.raw_id!r} and {seen_coerced[coerced]!r} both collapse to "
                                    f"{coerced} under the parser's parseInt — they are the same node",
                                    slide.label, slide.line_no))
            seen_coerced[coerced] = slide.raw_id

    # --- per-slide ----------------------------------------------------------
    image_refs = []
    for idx, slide in enumerate(main):
        if slide.fence_count != 2:
            # The usual cause is a line in the body that is exactly '---': the
            # fence branch consumes it before the content guard runs, so it
            # never shows up as body text, it just flips the toggle.
            issues.append(Issue("error", "FENCE_UNBALANCED",
                                f"expected exactly 2 '---' fences, found {slide.fence_count} — "
                                f"a stray '---' in the body is the usual cause",
                                slide.label, slide.line_no))
        for line_no, line in slide.body_lines:
            # No '---' or topic-header check here: both are matched by earlier
            # parser branches and so can never reach body_lines. A stray one
            # surfaces as FENCE_UNBALANCED above, which is the real signal.
            if HTML_RE.search(line):
                issues.append(Issue("error", "HTML_IN_BODY",
                                    "body reaches innerHTML unescaped — HTML is not allowed",
                                    slide.label, line_no))
            if DROPPED_MARKDOWN_RE.match(line.strip()):
                issues.append(Issue("error", "MARKDOWN_DROPPED",
                                    f"the renderer drops this construct: {line.strip()[:40]!r}",
                                    slide.label, line_no))

        for key in ("slide_id", "index_title", "type"):
            present = key in slide.headers or key == "slide_id"
            if not present:
                issues.append(Issue("error", "HEADER_MISSING",
                                    f"missing {key}:", slide.label, slide.line_no))

        slide_type = slide.headers.get("type", "main")
        if slide_type not in VALID_TYPES:
            issues.append(Issue("error", "TYPE_INVALID",
                                f"unknown type {slide_type!r}", slide.label, slide.line_no))

        if slide_type == "hero":
            if idx != 0:
                issues.append(Issue("error", "HERO_FIRST",
                                    "a hero slide must be the first slide", slide.label, slide.line_no))
            body_keys = {line.split(":", 1)[0].strip()
                         for _, line in slide.body_lines if ":" in line and line.strip()}
            hero_keys_found = body_keys & HERO_KEYS
            for required in ("hero_title", "hero_body"):
                if required not in hero_keys_found:
                    issues.append(Issue("error", "HERO_KEYS",
                                        f"hero slide is missing {required}:", slide.label, slide.line_no))
        elif idx == 0:
            issues.append(Issue("warn", "HERO_FIRST",
                                "first slide is not type: hero", slide.label, slide.line_no))

        # Nav
        labels = {}
        for line_no, nav_type, label, target, in_body in slide.nav:
            if nav_type not in ("next", "next:flow", "sidequest"):
                issues.append(Issue("error", "NAV_TYPE_UNKNOWN",
                                    f"unknown nav type {nav_type!r}", slide.label, line_no))
            if in_body and nav_type == "sidequest":
                issues.append(Issue("error", "NAV_IN_BODY",
                                    "[sidequest] inside a content block renders as literal text",
                                    slide.label, line_no))
            if label in labels:
                issues.append(Issue("error", "NAV_LABEL_DUPLICATE",
                                    f"button label {label!r} reused on this slide — connections is an "
                                    f"object, so the earlier one is overwritten", slide.label, line_no))
            labels[label] = line_no

        if idx == len(main) - 1:
            if any(n[1] == "next" for n in slide.nav):
                issues.append(Issue("warn", "LAST_SLIDE_HAS_NEXT",
                                    "last slide carries a > [next]; the renderer ignores it and shows Finish",
                                    slide.label, slide.line_no))

        _check_media(slide, issues, image_refs)

        # Layout consistency
        has_right = "align:right" in slide.body
        declares_2col = slide.headers.get("layout", "").lower() == "standard-2-col"
        if has_right and not declares_2col:
            issues.append(Issue("warn", "LAYOUT_MISMATCH",
                                "content has align:right but layout: standard-2-col is not declared",
                                slide.label, slide.line_no))
        if declares_2col and not has_right:
            issues.append(Issue("warn", "LAYOUT_MISMATCH",
                                "layout: standard-2-col declared but no align:right image",
                                slide.label, slide.line_no))

        # No INDEX_TITLE_LONG rule: .toc-child-title has no text-overflow, so long
        # titles wrap rather than truncate, and 32 hand-authored slides exceed 40
        # chars quite happily.

        if slide_type != "hero":
            stripped_body = re.sub(r"!\[.*?\]\(.*?\)", "", slide.body)
            words = len(stripped_body.split())
            has_media = bool(MEDIA_LOOSE_RE.search(slide.body))
            if words > 140:
                issues.append(Issue("warn", "SLIDE_TOO_LONG", f"{words} words", slide.label, slide.line_no))
            elif words < 10 and not has_media:
                # A short slide carrying a diagram is a normal pattern; a short
                # slide with nothing on it is not.
                issues.append(Issue("warn", "SLIDE_TOO_SHORT",
                                    f"{words} words and no media", slide.label, slide.line_no))

        # Columns
        opens = slide.body.count("{columns}")
        closes = slide.body.count("{/columns}")
        if opens != closes:
            issues.append(Issue("warn", "COLUMNS_UNBALANCED",
                                f"{opens} {{columns}} vs {closes} {{/columns}}", slide.label, slide.line_no))

    # --- hero image refs ----------------------------------------------------
    for slide in main:
        for line_no, line in slide.body_lines:
            if line.strip().startswith("hero_image:"):
                image_refs.append((line_no, slide.label, line.split(":", 1)[1].strip()))

    for line_no, slide_label, ref in image_refs:
        if ref.startswith(("http://", "https://")) or ref.startswith("learn/"):
            continue
        if ref.startswith(FORBIDDEN_IMAGE_DIRS):
            issues.append(Issue("error", "IMAGE_FORBIDDEN_DIR",
                                f"{ref} is under a gitignored or deprecated folder", slide_label, line_no))
            continue
        if generated and ref.startswith(GENERATED_FORBIDDEN_IMAGE_DIRS):
            issues.append(Issue("error", "IMAGE_PLACEHOLDER",
                                f"{ref} is a placeholder, not real artwork — "
                                "use an image from the course's own solution folder",
                                slide_label, line_no))
            continue
        if check_files and not os.path.isfile(os.path.join(images_root, ref)):
            issues.append(Issue("error", "IMAGE_MISSING",
                                f"images/{ref} does not exist", slide_label, line_no))

    # --- nav targets --------------------------------------------------------
    known = set()
    for slide in main:
        known.add(slide.raw_id)
        known.add(str(coerce_id(slide.raw_id)))
    sidequest_topics = {t[1] for t in topics if t[3]}

    for slide in main:
        for line_no, nav_type, label, target, _ in slide.nav:
            if nav_type == "next:flow":
                if not target.startswith(("http://", "https://")):
                    issues.append(Issue("error", "NAV_DANGLING",
                                        f"[next:flow] target is not a URL: {target!r}", slide.label, line_no))
            elif nav_type == "next":
                if target not in known and str(coerce_id(target)) not in known:
                    issues.append(Issue("error", "NAV_DANGLING",
                                        f"[next] target {target!r} matches no slide_id", slide.label, line_no))
            elif nav_type == "sidequest":
                if target not in sidequest_topics:
                    issues.append(Issue("error", "SIDEQUEST_DANGLING",
                                        f"[sidequest] target {target!r} has no matching "
                                        f"[id:{target}/topic: ...] section", slide.label, line_no))

    # Sidequest slide_id goes through `parseInt(idValue) || 1` (course.html:2565),
    # so integers and UUIDs both work — but two slides in the same topic that
    # collapse to the same number become the same node id (sq-<topic>-<n>).
    sq_seen = {}
    for slide in sidequests:
        step = coerce_id(slide.raw_id)
        step = step if isinstance(step, int) else 1
        key = (slide.topic_id, step)
        if key in sq_seen:
            issues.append(Issue("error", "SIDEQUEST_SLIDE_ID",
                                f"sidequest slide_id {slide.raw_id!r} collapses to step {step} in topic "
                                f"{slide.topic_id!r}, colliding with line {sq_seen[key]}",
                                slide.label, slide.line_no))
        sq_seen[key] = slide.line_no

    # --- topic ids ----------------------------------------------------------
    main_topic_ids = [t[1] for t in topics if not t[3]]
    if main_topic_ids:
        if len(set(main_topic_ids)) != len(main_topic_ids):
            issues.append(Issue("error", "TOPIC_ID_NONMONOTONIC",
                                f"duplicate topic ids create duplicate TOC sections: {main_topic_ids}"))
        first_slide_line = main[0].line_no
        for line_no, topic_id, _, is_sq, _ in topics:
            if not is_sq and line_no > first_slide_line and topic_id == main_topic_ids[0]:
                issues.append(Issue("warn", "TOPIC_BEFORE_FIRST_SLIDE",
                                    "first topic header appears after the first slide", None, line_no))
                break

    # --- course shape -------------------------------------------------------
    # The hand-authored corpus spans 2-17 slides; flag only outside that range.
    if len(main) < 3:
        issues.append(Issue("warn", "SLIDE_COUNT", f"only {len(main)} slides"))
    elif len(main) > 17:
        issues.append(Issue("warn", "SLIDE_COUNT",
                            f"{len(main)} slides is longer than any hand-authored course"))

    return issues


def main(argv):
    audit = "--audit" in argv
    paths = [a for a in argv[1:] if not a.startswith("--")]
    if not paths:
        print(__doc__)
        return 2

    errors_total = warns_total = clean = 0
    for path in paths:
        with open(path, encoding="utf-8") as handle:
            issues = validate(handle.read(), generated=not audit)
        errors = [i for i in issues if i.level == "error"]
        warns = [i for i in issues if i.level == "warn"]
        errors_total += len(errors)
        warns_total += len(warns)
        rel = os.path.relpath(path, REPO_ROOT)
        if not issues:
            clean += 1
            continue
        print(f"{rel}  ({len(errors)} error, {len(warns)} warn)")
        for issue in errors + warns:
            print(issue)
    print(f"\n{len(paths)} files · {clean} clean · {errors_total} errors · {warns_total} warnings")
    return 1 if errors_total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
