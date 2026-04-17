#!/usr/bin/env bash
# Launch the local Gradio GUI on http://localhost:7860.
#
# Usage:
#   bash scripts/run_local.sh                # default
#   bash scripts/run_local.sh --port 8080    # custom port
#   bash scripts/run_local.sh --share        # Gradio public tunnel
#
# Requires: `bash scripts/install_local.sh` finished successfully.

set -euo pipefail

PORT=7860
SHARE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)   PORT="$2"; shift 2 ;;
    --share)  SHARE=1; shift ;;
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

source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate gmr

export GVHMR_PATH="$PARENT/GVHMR"
export GMR_PATH="$PARENT/GMR"
export VIDEOTOSMPL_PORT="$PORT"
export VIDEOTOSMPL_SHARE="$SHARE"

echo "Launching GUI on http://localhost:$PORT"
python "$REPO_DIR/scripts/_gui.py"
