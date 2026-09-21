"""Index knowledge/ by frontmatter and rank chunks against a user prompt.

490 English chunks is ~150K tokens, too much to send whole, and a plain
keyword match misses too much: the corpus is translated from Danish and says
*dead items*, *phase out*, *slow movers* and *excess inventory* for the same
idea. So this is a recall net, not a decision — BM25 takes a generous top-N
and the model picks the chunks it actually wants from their frontmatter.

    python3 tools/flowgen/knowledge_index.py "reduce dead stock in spare parts"
"""

import json
import math
import os
import re
import sys
import threading
import unicodedata

from . import config

CACHE_PATH = os.path.join(config.CACHE_DIR, "knowledge-index.json")
_LOCK = threading.Lock()
_MEMO = {"fingerprint": None, "records": None}

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "for", "with",
    "at", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being", "it",
    "its", "this", "that", "these", "those", "i", "we", "you", "they", "he", "she",
    "how", "what", "when", "where", "which", "who", "why", "can", "do", "does", "did",
    "my", "our", "your", "their", "me", "us", "them", "about", "into", "over", "than",
    "then", "so", "not", "no", "yes", "all", "any", "some", "more", "most", "want",
    "learn", "teach", "course", "understand", "explain", "help",
}

# Glossary frontmatter is keyword-dense and over-ranks on raw score; tutorials
# and courses are what a learner actually needs.
SOURCE_PRIOR = {"tutorial": 1.15, "course": 1.10, "article": 1.0, "glossary": 0.85}


def normalise(text):
    text = unicodedata.normalize("NFKD", (text or "").lower())
    return "".join(c for c in text if not unicodedata.combining(c))


def tokenise(text):
    tokens = []
    for raw in re.split(r"[^a-z0-9]+", normalise(text)):
        if len(raw) < 2 or raw in STOPWORDS:
            continue
        tokens.append(stem(raw))
    return tokens


def stem(word):
    """Cheap suffix strip — enough to match plural/gerund forms, no dependency."""
    for suffix in ("ing", "ed", "es", "s"):
        if len(word) > len(suffix) + 3 and word.endswith(suffix):
            return word[: -len(suffix)]
    return word


def parse_frontmatter(text):
    """Return (fields, body). Handles both keyword shapes in the corpus."""
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return {}, text
    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
    except StopIteration:
        return {}, text

    fields = {}
    key = None
    for line in lines[1:end]:
        if not line.strip():
            continue
        # knowledge/courses/english/* uses a YAML block list under keywords:,
        # the other three directories use an inline comma-separated string.
        if line.lstrip().startswith("- ") and key:
            fields.setdefault(key, [])
            if isinstance(fields[key], str):
                fields[key] = [fields[key]] if fields[key] else []
            fields[key].append(line.lstrip()[2:].strip())
            continue
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            fields[key] = value.strip()

    for field in ("keywords", "tags"):
        value = fields.get(field)
        if isinstance(value, str):
            fields[field] = [v.strip() for v in value.split(",") if v.strip()]
        elif value is None:
            fields[field] = []

    return fields, "\n".join(lines[end + 1:]).strip()


def iter_chunk_paths(root=None):
    root = root or config.KNOWLEDGE_ROOT
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d != "danish" and not d.startswith(".")]
        for name in sorted(filenames):
            if name.endswith(".txt") and not name.startswith("."):
                yield os.path.join(dirpath, name)


def fingerprint(root=None):
    count = total_size = total_mtime = 0
    for path in iter_chunk_paths(root):
        stat = os.stat(path)
        count += 1
        total_size += stat.st_size
        total_mtime += int(stat.st_mtime)
    return f"{count}:{total_size}:{total_mtime}"


def build(root=None):
    records = []
    for path in iter_chunk_paths(root):
        try:
            with open(path, encoding="utf-8") as handle:
                fields, body = parse_frontmatter(handle.read())
        except (OSError, UnicodeDecodeError):
            continue
        rel = os.path.relpath(path, config.REPO_ROOT)
        stem_name = os.path.splitext(os.path.basename(path))[0]
        source_type = fields.get("source_type") or rel.split(os.sep)[1] if os.sep in rel else ""
        record = {
            "path": rel,
            "topic": fields.get("topic", ""),
            "source_type": source_type,
            "product_area": fields.get("product_area", ""),
            "question_type": fields.get("question_type", ""),
            "term_en": fields.get("term_en", ""),
            "term_da": fields.get("term_da", ""),
            "keywords": fields.get("keywords", []),
            "words": len(body.split()),
        }
        bag = " ".join([
            (record["topic"] + " ") * 3,
            (" ".join(record["keywords"]) + " ") * 2,
            record["product_area"], record["question_type"],
            record["term_en"], record["term_da"],
            stem_name.replace("-", " ").replace("_", " "),
        ])
        record["tokens"] = tokenise(bag)
        records.append(record)
    return records


def load(force=False):
    """Build on first use, reuse while knowledge/ is unchanged."""
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


def expand_query(query):
    lowered = normalise(query)
    terms = list(tokenise(query))
    for phrase, expansions in config.SYNONYMS.items():
        if phrase in lowered:
            for expansion in expansions:
                terms.extend(tokenise(expansion))
    return terms


def score(query, records=None, top_k=None):
    """Okapi BM25 over the frontmatter bags. Returns [(score, record), ...]."""
    records = records if records is not None else load()
    top_k = top_k or config.SHORTLIST_SIZE
    if not records:
        return []

    k1, b = 1.5, 0.75
    lengths = [len(r["tokens"]) or 1 for r in records]
    avg_len = sum(lengths) / len(lengths)

    doc_freq = {}
    for record in records:
        for token in set(record["tokens"]):
            doc_freq[token] = doc_freq.get(token, 0) + 1

    terms = expand_query(query)
    if not terms:
        return []
    total = len(records)

    scored = []
    for record, length in zip(records, lengths):
        counts = {}
        for token in record["tokens"]:
            counts[token] = counts.get(token, 0) + 1
        value = 0.0
        for term in terms:
            freq = counts.get(term)
            if not freq:
                continue
            idf = math.log(1 + (total - doc_freq[term] + 0.5) / (doc_freq[term] + 0.5))
            value += idf * (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * length / avg_len))
        if value > 0:
            value *= SOURCE_PRIOR.get(record["source_type"], 1.0)
            scored.append((value, record))

    scored.sort(key=lambda pair: (-pair[0], pair[1]["path"]))
    return scored[:top_k]


def shortlist_for_prompt(scored):
    """One compact line per candidate, for the outline call."""
    lines = []
    for _, record in scored:
        bits = [record["path"], record["topic"] or "(untitled)"]
        if record["product_area"]:
            bits.append(record["product_area"])
        if record["keywords"]:
            bits.append(", ".join(record["keywords"][:8]))
        lines.append(" | ".join(bits))
    return "\n".join(lines)


def read_chunks(paths, max_chars=None):
    """Load chunk bodies for the expand call, capped at a total budget."""
    max_chars = max_chars or config.MAX_CHUNK_CHARS
    out, used = [], 0
    for rel in paths:
        abs_path = os.path.join(config.REPO_ROOT, rel)
        # Never trust a model-supplied path to stay inside knowledge/.
        if not os.path.abspath(abs_path).startswith(config.KNOWLEDGE_ROOT):
            continue
        if not os.path.isfile(abs_path):
            continue
        try:
            with open(abs_path, encoding="utf-8") as handle:
                fields, body = parse_frontmatter(handle.read())
        except (OSError, UnicodeDecodeError):
            continue
        remaining = max_chars - used
        if remaining <= 200:
            break
        if len(body) > remaining:
            body = body[:remaining].rsplit(" ", 1)[0] + " […]"
        used += len(body)
        out.append({"path": rel, "topic": fields.get("topic", ""), "body": body})
    return out


def chunks_for_prompt(chunks):
    return "\n\n".join(f"### {c['topic'] or c['path']}\n{c['body']}" for c in chunks)


if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) or "reduce dead stock in a spare parts business"
    records = load()
    print(f"{len(records)} chunks indexed\n")
    print(f"Query: {query!r}\n")
    for rank, (value, record) in enumerate(score(query, records, top_k=20), start=1):
        area = f" · {record['product_area']}" if record["product_area"] else ""
        print(f"{rank:2}. {value:6.2f}  [{record['source_type']}{area}]  {record['topic'][:70]}")
        print(f"              {record['path']}")
