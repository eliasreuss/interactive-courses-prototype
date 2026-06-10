import os
import re
import uuid
import glob

FOLDERS = [
    "/Users/eliaschristensen/flows-prototype_2/courses/inventory/",
    "/Users/eliaschristensen/flows-prototype_2/courses/now/",
    "/Users/eliaschristensen/flows-prototype_2/courses/supplier/",
]

for folder in FOLDERS:
    out_dir = os.path.join(folder, "with-UUID")
    os.makedirs(out_dir, exist_ok=True)

    for src_path in sorted(glob.glob(os.path.join(folder, "*-IN.txt"))):
        basename = os.path.basename(src_path)          # e.g. Foo-IN.txt
        stem = basename[:-4]                            # e.g. Foo-IN
        out_name = stem + "-UUID.txt"                  # e.g. Foo-IN-UUID.txt
        out_path = os.path.join(out_dir, out_name)

        with open(src_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Collect all slide_id values (strip surrounding whitespace)
        old_ids = re.findall(r"^slide_id:\s*(.+?)\s*$", content, re.MULTILINE)

        # Build old → new mapping (deduplicate while preserving order)
        seen = {}
        id_map = {}
        for old in old_ids:
            if old not in seen:
                seen[old] = True
                id_map[old] = str(uuid.uuid4())

        if not id_map:
            print(f"  SKIP (no slide_ids): {src_path}")
            continue

        # Sort by length descending so longer IDs are replaced before shorter
        # ones that might be substrings (e.g. "20" before "2").
        sorted_ids = sorted(id_map.keys(), key=len, reverse=True)

        new_content = content

        # 1. Replace slide_id lines
        for old, new in id_map.items():
            new_content = re.sub(
                r"(?m)^(slide_id:\s*)" + re.escape(old) + r"\s*$",
                r"\g<1>" + new,
                new_content,
            )

        # 2. Replace connection targets  -> old_id
        #    Anchor with \b or end-of-line / end-of-string to avoid partial matches.
        for old in sorted_ids:
            new = id_map[old]
            # Use word boundary after the id; UUIDs already contain word chars so
            # \b works.  For purely numeric ids we also add $ as a fallback anchor.
            pattern = r"(-> )" + re.escape(old) + r"(?=\b|$)"
            new_content = re.sub(pattern, r"\g<1>" + new, new_content)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"Created: {out_path}")
