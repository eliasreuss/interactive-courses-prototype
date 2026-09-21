"""Paths, limits, model settings and key resolution for course generation."""

import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMAGES_ROOT = os.path.join(REPO_ROOT, "images")
KNOWLEDGE_ROOT = os.path.join(REPO_ROOT, "knowledge")
COURSES_ROOT = os.path.join(REPO_ROOT, "courses")
OUTPUT_DIR = os.path.join(COURSES_ROOT, "custom", "courses-for-local")
META_DIR = os.path.join(COURSES_ROOT, "custom", ".meta")
MANIFEST_PATH = os.path.join(COURSES_ROOT, "custom", "manifest.json")
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache")

MODEL = "claude-opus-5"
MAX_TOKENS = 32000
OUTLINE_EFFORT = "medium"
EXPAND_EFFORT = "high"

# Retrieval
SHORTLIST_SIZE = 60          # frontmatter records sent to the outline call
MAX_CHUNK_CHARS = 40_000     # total retrieved body text sent to the expand call
MAX_REPAIR_ROUNDS = 2

# Request limits
MIN_PROMPT_CHARS = 12
MAX_PROMPT_CHARS = 2000

# Image folders a generated course must never reference: animations/ is
# gitignored so the file would 404 on another machine, legacy/ is deprecated.
FORBIDDEN_IMAGE_DIRS = ("animations", "legacy")

# When no specific image fits, the hero falls back to the matching intro
# course's hero. Verified against the hero_image: values actually in use.
TOPIC_HERO = {
    "inventory":     "intro/Intro-Path-Cover-2.png",
    "suppliers":     "suppliers-intro-2/Hero.png",
    "products":      "products-intro/Hero.png",
    "customers":     "placeholder-images/Illustration.png",
    "functionality": "now-intro/Now-Intro-Hero.png",
    "admin":         "admin-intro/Hero-Illu.png",
    "general":       "placeholder-images/Illustration.png",
}

# Matches the TOPIC_ICONS vocabulary in catalog.html so the card renderer can
# reuse the icon map unchanged.
TOPICS = tuple(TOPIC_HERO)

# Query-side only: expands what the user typed before scoring, never the
# documents. The corpus is translated from Danish and says the same thing
# several ways.
SYNONYMS = {
    "dead stock": ["deadstock", "dead item", "phase out", "slow mover", "obsolete", "excess"],
    "deadstock": ["dead stock", "dead item", "phase out", "obsolete"],
    "spare parts": ["spare part", "aftermarket", "service part"],
    "stockout": ["backorder", "out of stock", "shortage", "delivery failure"],
    "turnover": ["turnover rate", "itr", "inventory turnover", "omsaetningshastighed"],
    "tied up capital": ["capital binding", "kapitalbinding", "working capital"],
    "service level": ["sla", "delivery performance", "leveringssikkerhed", "otd"],
    "reorder": ["reorder point", "reorder quantity", "order size", "bestillingspunkt"],
    "safety stock": ["buffer stock", "minimum stock", "risikolager", "minimumslager"],
    "abc": ["abc analysis", "double abc", "categorisation", "categorization", "segmentation"],
    "supplier": ["vendor", "leverandor", "sourcing", "procurement"],
    "negotiation": ["negotiate", "forhandling", "leverage", "supplier negotiation"],
    "spend": ["spend analysis", "purchasing", "cost", "long tail"],
    "customer": ["kunde", "account", "customer segmentation", "customer profitability"],
    "profitability": ["margin", "contribution", "cost to serve", "profit"],
    "complexity": ["kompleksitet", "variety", "long tail", "assortment"],
    "forecast": ["demand planning", "prognose", "forecasting"],
    "lead time": ["leveringstid", "replenishment time"],
    "insight": ["insights", "view", "analysis"],
    "dashboard": ["dashboards", "kpi", "widget", "trend view"],
    "action": ["actions", "task", "action list"],
    "heatmap": ["heat map", "heatmaps", "matrix"],
    "assortment": ["product range", "catalogue", "sortiment", "category management"],
    "inventory": ["stock", "lager", "warehouse", "stock policy"],
    "warehouse": ["lager", "storage", "capacity"],
    "phase out": ["phase-out", "discontinue", "delist", "kill"],
    "new product": ["npi", "product introduction", "launch"],
    "admin": ["administrator", "super user", "permissions", "user management"],
    "erp": ["data source", "master data", "integration"],
}


class FlowgenUnavailable(RuntimeError):
    """Raised when generation cannot run — missing SDK or missing API key."""


def read_dotenv(path=None):
    """Minimal KEY=value reader. No dependency, no interpolation, no export."""
    path = path or os.path.join(REPO_ROOT, ".env")
    values = {}
    if not os.path.isfile(path):
        return values
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip("'\"")
    return values


def api_key():
    """Environment first, then .env. Returns None rather than raising."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key
    return read_dotenv().get("ANTHROPIC_API_KEY") or None


def redact(text):
    """Strip anything key-shaped before text reaches a log or the browser."""
    import re
    return re.sub(r"sk-ant-[A-Za-z0-9_\-]{8,}", "sk-ant-***", str(text))
