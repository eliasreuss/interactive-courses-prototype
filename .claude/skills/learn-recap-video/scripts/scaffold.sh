#!/usr/bin/env bash
# Creates videos/<slug>/ from the template.
#   scaffold.sh <slug> "<Title>" [course|path]
# Copies the template, fills the slug, title and composition id, links the
# shared TTS venv, installs node modules (cloned from a sibling video when one
# exists, which also brings Remotion's headless Chrome) and synthesises the SFX.
set -euo pipefail
SLUG="$1"; TITLE="$2"; KIND="${3:-course}"
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$SKILL/../../.." && pwd)"
DEST="$REPO/videos/$SLUG"
[ -e "$DEST" ] && { echo "$DEST already exists"; exit 1; }
COMPOSITION=$(echo "$SLUG" | perl -pe 's/(^|-)(\w)/\U$2/g')

"$SKILL/scripts/setup_tts.sh" >/dev/null
mkdir -p "$REPO/videos"
cp -R "$SKILL/template" "$DEST"
cd "$DEST"
UNIT=Section; [ "$KIND" = path ] && UNIT=Course
TITLE="$TITLE" SLUG="$SLUG" COMPOSITION="$COMPOSITION" KIND="$KIND" UNIT="$UNIT" node -e '
const fs = require("fs");
for (const f of ["package.json", "package-lock.json", "video.json"]) {
  let s = fs.readFileSync(f, "utf8");
  s = s.replaceAll("__SLUG__", process.env.SLUG).replaceAll("__COMPOSITION__", process.env.COMPOSITION).replaceAll("__TITLE__", process.env.TITLE);
  fs.writeFileSync(f, s);
}
const v = JSON.parse(fs.readFileSync("video.json", "utf8"));
v.kind = process.env.KIND; v.unit = process.env.UNIT;
if (v.kind === "path") { v.runtime = [200, 240]; v.words = [600, 700]; }
fs.writeFileSync("video.json", JSON.stringify(v, null, 2) + "\n");
'
ln -s ../../.tts-venv tts/.venv
mkdir -p public/audio/vo public/audio/sfx public/images out

SIBLING=$(ls -d "$REPO"/videos/*/node_modules/@remotion/renderer 2>/dev/null | head -1 || true)
if [ -n "$SIBLING" ]; then
  cp -cR "$(dirname "$(dirname "$(dirname "$SIBLING")")")/node_modules" node_modules 2>/dev/null || cp -R "$(dirname "$(dirname "$(dirname "$SIBLING")")")/node_modules" node_modules
else
  npm ci --no-audit --no-fund --loglevel=error
fi
tts/.venv/bin/python tts/sfx.py >/dev/null
echo "scaffolded $DEST (composition $COMPOSITION)"
