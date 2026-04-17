#!/usr/bin/env bash
# Launch the local control centre: FastAPI backend + Next.js frontend.
#
#   Backend  → http://127.0.0.1:8000   (uvicorn, gmr conda env)
#   Frontend → http://127.0.0.1:3000   (next dev)
#
# Usage:
#   bash scripts/run_local.sh
#   bash scripts/run_local.sh --prod          # next start instead of dev
#   bash scripts/run_local.sh --api-port 8001
#   bash scripts/run_local.sh --web-port 3001
#
# Requires: `bash scripts/install_local.sh` finished successfully + `npm` on PATH.

set -euo pipefail

API_PORT=8000
WEB_PORT=3000
PROD=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-port) API_PORT="$2"; shift 2 ;;
    --web-port) WEB_PORT="$2"; shift 2 ;;
    --prod)     PROD=1; shift ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PARENT="$(cd "$REPO_DIR/.." && pwd)"

# ────────────────────────────────────────────────────────────────────────────
# Pick a non-conflicting port if defaults taken
# ────────────────────────────────────────────────────────────────────────────
pick_free_port() {
  local p=$1
  while lsof -i ":$p" -sTCP:LISTEN >/dev/null 2>&1; do
    p=$((p + 1))
  done
  echo "$p"
}
command -v lsof >/dev/null 2>&1 || {
  echo "lsof not found — skipping port conflict check" >&2
}
if command -v lsof >/dev/null 2>&1; then
  ORIG_API=$API_PORT; ORIG_WEB=$WEB_PORT
  API_PORT=$(pick_free_port "$API_PORT")
  WEB_PORT=$(pick_free_port "$WEB_PORT")
  [[ "$API_PORT" != "$ORIG_API" ]] && echo "API port $ORIG_API busy → using $API_PORT"
  [[ "$WEB_PORT" != "$ORIG_WEB" ]] && echo "Web port $ORIG_WEB busy → using $WEB_PORT"
fi

# ────────────────────────────────────────────────────────────────────────────
# Conda env
# ────────────────────────────────────────────────────────────────────────────
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate gmr

export GVHMR_PATH="${GVHMR_PATH:-$PARENT/GVHMR}"
export GMR_PATH="${GMR_PATH:-$PARENT/GMR}"
export PYTHONPATH="$REPO_DIR${PYTHONPATH:+:$PYTHONPATH}"

# ────────────────────────────────────────────────────────────────────────────
# Check web deps installed
# ────────────────────────────────────────────────────────────────────────────
if [[ ! -d "$REPO_DIR/web/node_modules" ]]; then
  echo "Installing web deps (first-time)…"
  (cd "$REPO_DIR/web" && npm ci --silent 2>/dev/null || npm install --silent)
fi

# ────────────────────────────────────────────────────────────────────────────
# Start backend
# ────────────────────────────────────────────────────────────────────────────
BACKEND_LOG="$(mktemp -t videotosmpl-api.XXXXXX.log)"
echo "→ backend (uvicorn) on http://127.0.0.1:$API_PORT  (log: $BACKEND_LOG)"
(
  cd "$REPO_DIR"
  uvicorn server.main:app --host 127.0.0.1 --port "$API_PORT" --reload >>"$BACKEND_LOG" 2>&1
) &
API_PID=$!

trap 'echo; echo "stopping…"; kill 0 2>/dev/null || true; exit 0' INT TERM EXIT

# ────────────────────────────────────────────────────────────────────────────
# Start frontend
# ────────────────────────────────────────────────────────────────────────────
export BACKEND_URL="http://127.0.0.1:$API_PORT"
echo "→ frontend on http://127.0.0.1:$WEB_PORT  (proxying /api → :$API_PORT)"
cd "$REPO_DIR/web"
if [[ $PROD -eq 1 ]]; then
  npm run build
  npm run start -- -p "$WEB_PORT"
else
  npm run dev -- -p "$WEB_PORT"
fi
