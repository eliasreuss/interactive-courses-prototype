"""Assemble the system prompt and the JSON schemas the model fills in.

Order matters: everything byte-stable goes first, then one cache breakpoint,
then the per-request context. Anything volatile above the breakpoint would
throw away the cache on every generation.
"""

import json
import os

from . import config, image_catalog

EXEMPLARS = [
    "courses/customers/courses-for-local/Linked-Revenue-IN-UUID.txt",
    "courses/now/courses-for-local/Now-Intro-IN-UUID.txt",
]

ROLE = """\
You write short, self-paced courses for Inact Learn, the learning app used by \
customers of Inact Now.

Inact Now is a supply chain analytics platform. Its users are supply chain \
managers, purchasers, category managers and business owners at mid-sized \
distribution and manufacturing companies. They are practitioners, not analysts: \
they know their own business well and want to know what to do differently on \
Monday morning. The product is always called "Inact Now", never "Inact" alone \
and never "the platform".

A course is 4-14 slides, read in one sitting. It teaches one idea properly and \
then stops.\
"""

TONE = """\
# Voice

You are a colleague sitting next to the learner, doing the analysis with them. \
Not a manual, not a product marketer, not a teacher at a whiteboard.

**Pronouns.** "We" and "our" carry the body — we look, we filter, our suppliers, \
our portfolio. The data belongs to the reader's company, and the possessive is \
deliberate: it makes the numbers personal. "Let's" invites the next move. "You" \
is reserved for two jobs only: the closing takeaway, and asides about what the \
learner can do later. Never "the user". Never a passive construction written to \
dodge a pronoun.

**Plain and unhurried.** Short declarative sentences. Present tense. Contractions \
throughout — we're, let's, that's, isn't. Nothing that would read oddly aloud.

**Curious rather than authoritative.** Ask, then find out. "But what if we sort by \
lowest margin?" "In fact, let's check." Prefer a question as a slide title over a \
statement where it fits naturally.

**Understated before the punch.** Set the fact down flatly and let the number do \
the shouting. "Right now we're ordering 5000 units. This gives us inventory for \
4562 days. **That's stock for over 12 years!**"

**Never salesy.** No superlatives about the software. Never "powerful", "seamless", \
"unlock", "revolutionize", "game-changing", "empower". Inact Now earns credit only \
through the number it calculated.

**No hollow encouragement.** Do not tell the learner they are doing great. Do not \
pad with "In today's fast-paced business environment". Start where the value is.

# Shape of a course

1. **Hero.** Sets up what the learner will be able to do. One or two sentences, \
ending on a line like "**Let's get started!**" in bold.
2. **Problem or motivation.** One to three slides on why this matters — what goes \
wrong today, what it costs. A rhetorical question makes a good title here.
3. **The concept.** The substance. Diagram-led where a diagram exists, two or \
three short paragraphs beside it.
4. **In Inact Now.** Where this lives in the product and what the learner would \
actually click. Name the real Insight, Dashboard or Action if the knowledge \
supports it. Never invent a feature.
5. **Outro.** Title in the shape "Congratulations! You've Completed <Course Name>". \
What they learned, what it lets them do now, ending on a bold line.

Aim for 60-110 words of body copy per slide. A slide that only restates its own \
title is worse than no slide. Use **bold** once per slide at most, on the payoff \
sentence or a term being introduced — never a whole paragraph.\
"""

FORMAT_RULES = """\
# Writing the body text

Body copy is a restricted format. The renderer supports:

- Plain paragraphs, separated by a blank line.
- `**bold**` for emphasis inside a paragraph.
- A line starting with `*` for a bullet.

Nothing else. The renderer silently drops or mangles all of the following, so \
never produce them: `#` headings of any level, numbered lists, tables, links of \
any kind, inline code or code fences, block quotes, and raw HTML including `<br>`.

Two absolute rules:

- **Never write a line that is exactly `---`.** It terminates the slide.
- **Never write a Supademo embed** — no `[supademo: ...]`, ever. Those are recorded \
product demos that exist only for hand-authored courses. Where a hand-authored \
course would drop in a walkthrough, describe what the learner should look for \
instead, in words.

Do not invent Inact Now features, Insight names, menu items, metrics or numbers. \
If the supplied knowledge does not support a claim, write around it or leave it \
out. A vaguer sentence that is true beats a specific one that is invented.\
"""

IMAGE_RULES = """\
# Choosing images

Below is every image available. One per line:

    <path> | where it is used | what it depicts

You may only use a path from this list, copied exactly. There is no way to add a \
new image, and a path that is not on this list will fail validation.

**Prefer no image.** Roughly half the slides in a good course carry no image at \
all. An image that does not depict the specific idea on its slide is worse than \
an empty slide — it reads as decoration and it makes the course look automated. \
Only attach an image when you can say which part of the slide's argument it shows.

Images described as "course cover art" are hero art for an existing course. Use \
them for your own hero or outro slide, not to illustrate a point mid-course.

**The course opens and closes on the same image.** Pick one piece of cover art \
from the solution area your course is about, put it on the hero slide, and put \
the same path on the final slide. Every real course does this, and a course that \
ends on a different image — or on none — reads as unfinished.

**Never use a placeholder.** Nothing under `placeholder-images/` is real \
artwork; it is grey filler that says "Illustration". Those paths are not in the \
list below and will fail validation. If no image in your solution area fits a \
slide, leave the slide without one.

When an image genuinely fits a concept slide, set `"align": "right"` and a pixel \
size around `"500px"` — that produces the text-left, image-right layout the real \
courses use. Use `"align": "center"` with `"size": "large"` for a diagram that \
should sit on its own under a short lede.\
"""


def load_exemplars():
    parts = []
    for rel in EXEMPLARS:
        path = os.path.join(config.REPO_ROOT, rel)
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8") as handle:
            parts.append(f"## {os.path.basename(rel)}\n\n{handle.read().strip()}")
    return "\n\n".join(parts)


WORKED_EXAMPLE = """\
# How the JSON maps to a course

You return JSON. The server renders it into the file format above, so you never \
write slide ids, `---` fences, `> [next]` buttons, `layout:` or topic numbering — \
those are derived from the order of your slides. Concentrate on structure, prose \
and image choice.

The first two slides of the Linked Revenue course above correspond to:

```json
{
  "topics": [
    {
      "name": "Welcome to Linked Revenue",
      "slides": [
        {
          "type": "hero",
          "index_title": "Welcome to Linked Revenue",
          "image": {"ref": "customers-linked-revenue/Full-Chain.png"},
          "hero": {
            "subtitle": "Welcome to the course:",
            "title": "Linked revenue",
            "body": "In the previous courses, you segmented your customer portfolio and looked at the profitability of individual customer relationships.\\n\\nNow we will connect customers to the products they buy and see why those relationships can change the decisions we make.\\n\\n**Let's get started!**"
          },
          "next_label": "Let's do it!"
        },
        {
          "type": "main",
          "index_title": "Customers Do Not Exist in Isolation",
          "title": "Customers Do Not Exist in Isolation",
          "body": "So far, we have looked at customers on their own. Before that, we looked at products and suppliers on their own.\\n\\nBut these parts of the business are connected. Customers buy products, and those products depend on suppliers. **Now we bring those relationships together.**",
          "image": {"ref": "customers-linked-revenue/roadmap-3.png", "size": "large", "align": "center"}
        }
      ]
    }
  ]
}
```

Note that the hero slide has no `title` of its own — `hero.title` is the heading — \
and that the last slide of the course carries no `next_label`, because the viewer \
adds its own Finish button. The course's final slide repeats the hero's image, \
`customers-linked-revenue/Full-Chain.png`, the way the real courses close on the \
artwork they opened with.\
"""


def strip_unsupported(node):
    """Remove schema keywords structured outputs rejects.

    Probed against the API: `maxItems` on an array and `minimum` on an integer
    are refused outright, and `minItems` accepts only 0 or 1 — anything higher
    is a 400, so it is clamped rather than dropped. `enum`, `maxLength`,
    `default`, nullable type lists and nested objects are all fine.

    Every real bound therefore lives in the field descriptions and is enforced
    in Python after the call; the schema only guarantees shape.
    """
    if isinstance(node, dict):
        out = {}
        for key, value in node.items():
            if key in ("maxItems", "minimum", "maximum", "maxProperties"):
                continue
            if key == "minItems" and isinstance(value, int) and value > 1:
                out[key] = 1
                continue
            out[key] = strip_unsupported(value)
        return out
    if isinstance(node, list):
        return [strip_unsupported(v) for v in node]
    return node


def stable_prefix(catalog_text=None):
    """Everything byte-identical between runs. Cached."""
    catalog_text = catalog_text if catalog_text is not None else image_catalog.catalog_for_prompt()
    return "\n\n".join([
        ROLE,
        TONE,
        "# Two real courses, in the file format you are writing for\n\n" + load_exemplars(),
        WORKED_EXAMPLE,
        FORMAT_RULES,
        IMAGE_RULES + "\n\n" + catalog_text,
    ])


# --- schemas -------------------------------------------------------------

_OUTLINE_SCHEMA_RAW = {
    "type": "object",
    "additionalProperties": False,
    "required": ["slug", "course_title", "description", "topic",
                 "chosen_chunks", "candidate_images", "topics"],
    "properties": {
        "slug": {"type": "string",
                 "description": "kebab-case, 2-5 words, no leading 'gen-'"},
        "course_title": {"type": "string", "description": "Title case, 2-6 words"},
        "description": {"type": "string",
                        "description": "One sentence for the course card, under 140 characters"},
        "topic": {"type": "string", "enum": list(config.TOPICS),
                  "description": "Closest existing subject area"},
        "chosen_chunks": {
            "type": "array", "minItems": 1, "maxItems": 16,
            "items": {"type": "string"},
            "description": "Paths copied exactly from the candidate knowledge list. "
                           "At most 16.",
        },
        "candidate_images": {
            "type": "array", "maxItems": 40,
            "items": {"type": "string"},
            "description": "Image paths from the catalog that might suit this course. "
                           "Be generous here; you narrow down later. At most 40.",
        },
        "topics": {
            "type": "array", "minItems": 2, "maxItems": 6,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["name", "slide_briefs"],
                "properties": {
                    "name": {"type": "string",
                             "description": "Short section name for the contents list. "
                                            "At most 6 sections in a course."},
                    "slide_briefs": {
                        "type": "array", "minItems": 1, "maxItems": 5,
                        "items": {"type": "string",
                                  "description": "One line on what this slide will say. "
                                                 "At most 5 slides per section, and 14 in "
                                                 "the whole course."},
                    },
                },
            },
        },
    },
}


OUTLINE_SCHEMA = strip_unsupported(_OUTLINE_SCHEMA_RAW)


def expand_schema(image_refs):
    """Slide schema with the image field constrained to the shortlist.

    Passing an enum is what makes a hallucinated path structurally impossible
    rather than merely detectable after the fact.
    """
    image_enum = sorted(set(image_refs))
    image_property = {
        "type": ["object", "null"],
        "additionalProperties": False,
        "required": ["ref"],
        "properties": {
            "ref": {"type": "string", "enum": image_enum} if image_enum else {"type": "string"},
            "size": {"type": "string", "description": "large, medium, 500px, ..."},
            "align": {"type": "string", "enum": ["left", "center", "right"]},
        },
        "description": "An image from the catalog, or null. Prefer null.",
    }

    schema = {
        "type": "object",
        "additionalProperties": False,
        "required": ["course_title", "description", "topic", "topics"],
        "properties": {
            "course_title": {"type": "string"},
            "description": {"type": "string"},
            "topic": {"type": "string", "enum": list(config.TOPICS)},
            "topics": {
                "type": "array", "minItems": 2, "maxItems": 6,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["name", "slides"],
                    "properties": {
                        "name": {"type": "string"},
                        "slides": {
                            "type": "array", "minItems": 1, "maxItems": 5,
                            "items": {
                                "type": "object",
                                "additionalProperties": False,
                                "required": ["type", "index_title"],
                                "properties": {
                                    "type": {"type": "string", "enum": ["hero", "main"]},
                                    "index_title": {
                                        "type": "string",
                                        "description": "Contents-list label, under 45 characters",
                                    },
                                    "title": {
                                        "type": ["string", "null"],
                                        "description": "Slide heading. Omit for the hero slide.",
                                    },
                                    "body": {
                                        "type": ["string", "null"],
                                        "description": "60-110 words. Paragraphs separated by a "
                                                       "blank line. Never a line that is '---'.",
                                    },
                                    "hero": {
                                        "type": ["object", "null"],
                                        "additionalProperties": False,
                                        "required": ["subtitle", "title", "body"],
                                        "properties": {
                                            "subtitle": {"type": "string",
                                                         "description": "'Welcome to the course:'"},
                                            "title": {"type": "string"},
                                            "body": {"type": "string"},
                                        },
                                    },
                                    "image": image_property,
                                    "next_label": {
                                        "type": ["string", "null"],
                                        "description": "Button text. Null means 'Continue'.",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }
    return strip_unsupported(schema)


def outline_user_message(prompt, shortlist_text):
    return (
        f"A learner asked for a course on:\n\n{prompt.strip()}\n\n"
        f"Plan it. Pick the knowledge chunks worth reading in full, and shortlist the images "
        f"that might suit it.\n\nLet the request decide the length: a narrow, specific question "
        f"deserves 4-6 slides, a broad topic 8-14. Do not pad.\n\n"
        f"# Candidate knowledge\n\nEach line is: path | topic | area | keywords\n\n{shortlist_text}"
    )


def expand_user_message(prompt, outline, chunk_text):
    return (
        f"A learner asked for a course on:\n\n{prompt.strip()}\n\n"
        f"# The outline you planned\n\n```json\n{json.dumps(outline, indent=2)}\n```\n\n"
        f"# The knowledge you selected\n\n{chunk_text}\n\n"
        f"Now write the course in full, following the outline. Write the body copy of every "
        f"slide in the voice described above. Use only images from the catalog, and prefer no "
        f"image over a loose fit."
    )


def repair_user_message(issues):
    lines = [f"- {i.code} on slide [{i.slide or '?'}]: {i.message}" for i in issues]
    return (
        "The course you produced failed validation:\n\n" + "\n".join(lines) +
        "\n\nReturn the corrected course in full, in the same JSON shape. Fix only these "
        "problems; leave everything else exactly as it was."
    )
