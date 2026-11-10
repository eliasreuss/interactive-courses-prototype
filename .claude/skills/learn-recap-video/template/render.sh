#!/usr/bin/env bash
# Renders <slug>.mp4: video and mix from Remotion, then a two pass loudnorm to
# -16 LUFS so the audio is only AAC encoded once.
#   ./render.sh               full render
#   ./render.sh --audio-only  remix only, reuses out/video.mp4
#   ./render.sh --preview     half scale, muted, out/preview.mp4 (about 40 s)
#   ./render.sh --stems       voice and effect stems, then tts/check_mix.py
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
ID=$(node -p "require('./video.json').compositionId")
SLUG=$(node -p "require('./video.json').slug")

case "${1:-}" in
  --preview)
    npx remotion render src/index.ts "$ID" out/preview.mp4 --codec=h264 --scale=0.5 --image-format=jpeg --muted --log=error
    echo "out/preview.mp4"
    exit 0
    ;;
  --stems)
    for s in voice sfx; do
      npx remotion render src/index.ts "$ID" "out/stem-$s.wav" --codec=wav --props="{\"stem\":\"$s\"}" --log=error
    done
    npx remotion render src/index.ts "$ID" out/mix.wav --codec=wav --log=error
    tts/.venv/bin/python tts/check_mix.py mix.wav
    exit 0
    ;;
  --audio-only) ;;
  "")
    npx remotion render src/index.ts "$ID" out/video.mp4 --codec=h264 --crf=16 --color-space=bt709 --muted --log=error
    ;;
  *) echo "unknown option $1"; exit 1 ;;
esac

npx remotion render src/index.ts "$ID" out/mix.wav --codec=wav --log=error

measure=$(ffmpeg -hide_banner -nostdin -i out/mix.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$measure" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }

ffmpeg -v error -nostdin -y -i out/video.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 320k -movflags +faststart -shortest "$SLUG.mp4"

echo "$SLUG.mp4"
