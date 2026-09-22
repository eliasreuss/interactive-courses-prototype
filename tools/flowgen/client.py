"""Thin wrapper over the Anthropic SDK.

Imported lazily and only from inside a request handler, so the dev server
still starts and serves the whole prototype with the SDK uninstalled and no
API key set — only the Generate button reports it is unavailable.
"""

import json

from . import config

# $ per million tokens for claude-opus-5. Cache writes bill at 1.25x input,
# cache reads at 0.1x.
INPUT_PER_MTOK = 5.00
OUTPUT_PER_MTOK = 25.00


def get_client():
    try:
        import anthropic
    except ImportError as exc:
        raise config.FlowgenUnavailable(
            "Course generation needs the Anthropic SDK. Install it with: pip install anthropic"
        ) from exc

    key = config.api_key()
    if not key:
        raise config.FlowgenUnavailable(
            "ANTHROPIC_API_KEY is not set. Export it, or put it in a .env file at the repo root."
        )

    # An org-scoped key has to name the workspace to bill against; a key made
    # inside a workspace already carries one and needs no header.
    headers = {}
    workspace = config.workspace_id()
    if workspace:
        headers["anthropic-workspace-id"] = workspace

    return anthropic.Anthropic(api_key=key, default_headers=headers or None)


def cost_usd(usage):
    """Dollar cost of one call from a usage object or dict."""
    def field(name):
        if isinstance(usage, dict):
            return usage.get(name) or 0
        return getattr(usage, name, 0) or 0

    fresh = field("input_tokens")
    cache_write = field("cache_creation_input_tokens")
    cache_read = field("cache_read_input_tokens")
    output = field("output_tokens")
    return round(
        (fresh * INPUT_PER_MTOK
         + cache_write * INPUT_PER_MTOK * 1.25
         + cache_read * INPUT_PER_MTOK * 0.10
         + output * OUTPUT_PER_MTOK) / 1_000_000,
        4,
    )


def usage_dict(usage):
    keys = ("input_tokens", "output_tokens",
            "cache_creation_input_tokens", "cache_read_input_tokens")
    out = {}
    for key in keys:
        out[key] = (usage.get(key) if isinstance(usage, dict) else getattr(usage, key, None)) or 0
    out["cost_usd"] = cost_usd(usage)
    return out


def generate_json(client, *, system_prefix, volatile, messages, schema,
                  effort, on_delta=None, cancel=None):
    """One structured-output call. Returns (parsed_object, usage_dict).

    Streams because max_tokens is high enough that a blocking request would
    risk an HTTP timeout, and because the browser wants live progress.
    """
    system = [
        # The breakpoint sits at the end of the stable prefix. Nothing volatile
        # may appear above it or the cache is thrown away every run.
        {"type": "text", "text": system_prefix, "cache_control": {"type": "ephemeral"}},
    ]
    # An empty text block is a 400, and both calls currently carry their
    # per-request context in the user turn rather than here.
    if volatile and volatile.strip():
        system.append({"type": "text", "text": volatile})

    buffer = []
    with client.messages.stream(
        model=config.MODEL,
        max_tokens=config.MAX_TOKENS,
        system=system,
        thinking={"type": "adaptive"},
        output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema}},
        messages=messages,
    ) as stream:
        for event in stream:
            if cancel is not None and cancel.is_set():
                stream.close()
                raise Cancelled()
            if getattr(event, "type", "") == "text":
                buffer.append(event.text)
                if on_delta:
                    on_delta("".join(buffer))
        message = stream.get_final_message()

    if getattr(message, "stop_reason", None) == "refusal":
        details = getattr(message, "stop_details", None)
        category = getattr(details, "category", None) if details else None
        raise Refused(f"the request was declined{f' ({category})' if category else ''}")

    text = "".join(block.text for block in message.content if block.type == "text")
    try:
        parsed = json.loads(text)
    except ValueError as exc:
        raise MalformedOutput(f"model did not return valid JSON: {exc}") from exc

    return parsed, usage_dict(message.usage)


class Cancelled(Exception):
    """The job was cancelled from the browser."""


class Refused(Exception):
    """The model declined the request."""


class MalformedOutput(Exception):
    """Structured output did not parse."""
