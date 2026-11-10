#!/usr/bin/env bash
# One time: the shared Kokoro + Whisper environment for every recap video,
# at videos/.tts-venv (about 1 GB). Safe to rerun.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
VENV="$REPO/videos/.tts-venv"
if [ -x "$VENV/bin/python" ] && "$VENV/bin/python" -c "import kokoro, faster_whisper, pyloudnorm, PIL" 2>/dev/null; then
  echo "shared TTS venv ready: $VENV"; exit 0
fi
command -v uv >/dev/null || { echo "uv missing. Install: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
uv venv --python 3.12 "$VENV"
uv pip install --python "$VENV/bin/python" "kokoro>=0.9.4" soundfile numpy "transformers>=4.44" "tokenizers>=0.19" \
  faster-whisper pyloudnorm pillow \
  "en_core_web_sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl"
"$VENV/bin/python" -c "import kokoro, faster_whisper, pyloudnorm, PIL; print('shared TTS venv ready')"
