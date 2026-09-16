#!/usr/bin/env python3
"""Local dev server for the prototype, with an asset API for the course creator.

Serves the repo exactly like `python3 -m http.server`, and adds two endpoints so
creator.html can browse and upload images without anyone typing a filename:

    GET  /__assets/folders               -> the subfolders of images/
    GET  /__assets/list?folder=intro/    -> the media files in images/intro/
    POST /__assets/upload?folder=intro/  -> write a dropped file into images/intro/
                                            (raw body, filename in X-Filename)

Run it from the repo root:

    python3 tools/dev-server.py 8000
"""

import json
import os
import posixpath
import re
import sys
import unicodedata
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_ROOT = os.path.join(REPO_ROOT, "images")

MEDIA_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif",
    ".mp4", ".webm", ".mov", ".json",
}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov"}

MAX_UPLOAD_BYTES = 200 * 1024 * 1024


def safe_folder(raw):
    """Turn a user-supplied folder into a path under images/, or None if unsafe."""
    value = (raw or "").strip().replace("\\", "/").strip("/")
    if not value:
        return ""
    value = re.sub(r"^images/", "", value, flags=re.I)
    parts = [p for p in value.split("/") if p not in ("", ".")]
    if any(p == ".." for p in parts):
        return None
    if not all(re.fullmatch(r"[A-Za-z0-9._-]+", p) for p in parts):
        return None
    return "/".join(parts)


def safe_filename(raw):
    """A filename that is recognisably the original but safe to write."""
    name = os.path.basename((raw or "").replace("\\", "/")).strip()
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    name = re.sub(r"[^A-Za-z0-9._ -]", "", name).strip(" .")
    name = re.sub(r"\s+", "-", name)
    if not name:
        return None
    stem, ext = os.path.splitext(name)
    if ext.lower() not in MEDIA_EXTENSIONS:
        return None
    return f"{stem[:80]}{ext.lower()}"


def kind_for(ext):
    if ext in IMAGE_EXTENSIONS:
        return "image"
    if ext in VIDEO_EXTENSIONS:
        return "video"
    return "other"


def unique_path(folder_abs, filename):
    """Never clobber an existing asset — Hero.png becomes Hero-1.png."""
    stem, ext = os.path.splitext(filename)
    candidate = filename
    counter = 1
    while os.path.exists(os.path.join(folder_abs, candidate)):
        candidate = f"{stem}-{counter}{ext}"
        counter += 1
    return candidate


class CreatorAssetHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPO_ROOT, **kwargs)

    def log_message(self, fmt, *args):
        if "/__assets/" in self.path or self.command == "POST":
            super().log_message(fmt, *args)

    # -- helpers ---------------------------------------------------------

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def query(self):
        return parse_qs(urlparse(self.path).query)

    def requested_folder(self):
        raw = self.query().get("folder", [""])[0]
        return safe_folder(raw)

    # -- routes ----------------------------------------------------------

    def do_GET(self):
        route = urlparse(self.path).path
        if route == "/__assets/folders":
            return self.list_folders()
        if route == "/__assets/list":
            return self.list_assets()
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path == "/__assets/upload":
            return self.upload_asset()
        self.send_error(404, "Not found")

    def list_folders(self):
        if not os.path.isdir(IMAGES_ROOT):
            return self.send_json({"folders": []})
        names = sorted(
            entry for entry in os.listdir(IMAGES_ROOT)
            if os.path.isdir(os.path.join(IMAGES_ROOT, entry)) and not entry.startswith(".")
        )
        self.send_json({"folders": names})

    def list_assets(self):
        folder = self.requested_folder()
        if folder is None:
            return self.send_json({"error": "Invalid folder"}, 400)

        folder_abs = os.path.join(IMAGES_ROOT, folder) if folder else IMAGES_ROOT
        if not os.path.isdir(folder_abs):
            return self.send_json({"folder": folder, "files": [], "missing": True})

        files = []
        for name in sorted(os.listdir(folder_abs), key=str.lower):
            path = os.path.join(folder_abs, name)
            if not os.path.isfile(path) or name.startswith("."):
                continue
            ext = os.path.splitext(name)[1].lower()
            if ext not in MEDIA_EXTENSIONS:
                continue
            ref = posixpath.join(folder, name) if folder else name
            files.append({
                "name": name,
                "ref": ref,
                "url": "/images/" + ref,
                "size": os.path.getsize(path),
                "kind": kind_for(ext),
            })
        self.send_json({"folder": folder, "files": files})

    def upload_asset(self):
        folder = self.requested_folder()
        if folder is None:
            return self.send_json({"error": "Invalid folder"}, 400)

        filename = safe_filename(self.headers.get("X-Filename", ""))
        if not filename:
            return self.send_json(
                {"error": "Unsupported or missing filename. Allowed: "
                          + ", ".join(sorted(MEDIA_EXTENSIONS))},
                400,
            )

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0:
            return self.send_json({"error": "Empty upload"}, 400)
        if length > MAX_UPLOAD_BYTES:
            return self.send_json({"error": "File is larger than 200 MB"}, 413)

        folder_abs = os.path.join(IMAGES_ROOT, folder) if folder else IMAGES_ROOT
        os.makedirs(folder_abs, exist_ok=True)
        final_name = unique_path(folder_abs, filename)
        target = os.path.join(folder_abs, final_name)

        remaining = length
        with open(target, "wb") as handle:
            while remaining > 0:
                chunk = self.rfile.read(min(1024 * 256, remaining))
                if not chunk:
                    break
                handle.write(chunk)
                remaining -= len(chunk)

        if remaining > 0:
            os.remove(target)
            return self.send_json({"error": "Upload was cut short"}, 400)

        ref = posixpath.join(folder, final_name) if folder else final_name
        self.send_json({
            "name": final_name,
            "ref": ref,
            "url": "/images/" + ref,
            "size": os.path.getsize(target),
            "kind": kind_for(os.path.splitext(final_name)[1].lower()),
            "renamed": final_name != filename,
        })


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    # Loopback only: this server writes files, so it must not be reachable
    # from the rest of the network.
    server = ThreadingHTTPServer(("127.0.0.1", port), CreatorAssetHandler)
    print(f"Serving {REPO_ROOT} on http://localhost:{port}")
    print(f"Creator:  http://localhost:{port}/creator.html")
    print("Uploads land in images/<assets folder>/. Ctrl-C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
