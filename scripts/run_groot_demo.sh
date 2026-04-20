#!/usr/bin/env bash
# End-to-end: video → GVHMR → SMPL NPZ → GR00T WBC → MuJoCo mimic MP4.
#
# Wraps three separate codebases:
#   - GVHMR           (~/Projects/IL/GVHMR,           env: gvhmr)
#   - VideoToSMPL     (this repo,                     env: gvhmr for core.conversion)
#   - GR00T WBC       (~/Projects/GR00T-WholeBodyControl)
#   - SONIC launcher  (~/Projects/xr_teleoperate/teleop/versions/v_groot/run_test.py)
#
# Produces a screen-captured MP4 of the MuJoCo window while GR00T is
# tracking the input motion. Recording is trimmed to the "physics mimic"
# phase (i.e. after SONIC has activated the policy and the robot is
# released from the rubber band).
#
# Usage:
#   bash scripts/run_groot_demo.sh <video.mp4>           # defaults
#   bash scripts/run_groot_demo.sh <video.mp4> --duration 40
#   bash scripts/run_groot_demo.sh <video.mp4> --out /path/to/out.mp4
#   bash scripts/run_groot_demo.sh --pt <existing.pt>    # skip GVHMR

set -euo pipefail

# ── defaults ──────────────────────────────────────────────────────────
VIDEO=""
PT=""
OUT=""
DURATION=35     # seconds of MuJoCo recording after policy activation
DISPLAY_ID=":1" # SONIC mujoco viewer runs on :1 by convention
FPS=30

# ── paths (override via env if non-default) ───────────────────────────
GVHMR_DIR="${GVHMR_DIR:-$HOME/Projects/IL/GVHMR}"
GROOT_DIR="${GROOT_DIR:-$HOME/Projects/GR00T-WholeBodyControl}"
V_GROOT_DIR="${V_GROOT_DIR:-$HOME/Projects/xr_teleoperate/teleop/versions/v_groot}"
GVHMR_PY="${GVHMR_PYTHON:-$HOME/anaconda3/envs/gvhmr/bin/python3}"
ISAACLAB_PY="${ISAACLAB_PYTHON:-$HOME/env_isaaclab/bin/python3}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── parse args ────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --pt)        PT="$2"; shift 2 ;;
    --out)       OUT="$2"; shift 2 ;;
    --duration)  DURATION="$2"; shift 2 ;;
    --fps)       FPS="$2"; shift 2 ;;
    --display)   DISPLAY_ID="$2"; shift 2 ;;
    -h|--help)   grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)          echo "Unknown flag: $1" >&2; exit 1 ;;
    *)           VIDEO="$1"; shift ;;
  esac
done

# ── styling ───────────────────────────────────────────────────────────
B=$'\033[34m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; D=$'\033[2m'; X=$'\033[0m'
step() { printf '\n%s▶%s %s\n' "$B" "$X" "$*"; }
ok()   { printf '%s✓%s %s\n' "$G" "$X" "$*"; }
warn() { printf '%s!%s %s\n' "$Y" "$X" "$*"; }
fail() { printf '%s✗%s %s\n' "$R" "$X" "$*"; exit 1; }

# ── preflight ─────────────────────────────────────────────────────────
step "Preflight"
[[ -n "$VIDEO" || -n "$PT" ]] || fail "Provide a video (positional) or --pt <file>"
[[ -d "$GVHMR_DIR" ]]   || fail "GVHMR missing at $GVHMR_DIR"
[[ -d "$GROOT_DIR" ]]   || fail "GR00T-WholeBodyControl missing at $GROOT_DIR"
[[ -d "$V_GROOT_DIR" ]] || fail "SONIC launcher dir missing at $V_GROOT_DIR"
[[ -x "$GVHMR_PY" ]]    || fail "gvhmr python missing at $GVHMR_PY"
[[ -x "$ISAACLAB_PY" ]] || fail "env_isaaclab python missing at $ISAACLAB_PY"
command -v ffmpeg   >/dev/null || fail "ffmpeg not on PATH"
command -v xdotool  >/dev/null || fail "xdotool not on PATH"
ok "Tools + paths OK"

WORK=$(mktemp -d -t groot_demo.XXXXXX)
trap 'cleanup' EXIT INT TERM
cleanup() {
  [[ -n "${FFMPEG_PID:-}" ]] && kill -INT "$FFMPEG_PID" 2>/dev/null || true
  [[ -n "${TEST_PID:-}" ]]   && kill -INT "$TEST_PID" 2>/dev/null   || true
  sleep 1
  pkill -9 -f 'run_sim_loop|g1_deploy_onnx_ref|run_test.py' 2>/dev/null || true
  for p in 5556 5557 8012 9012; do
    lsof -t -i:"$p" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
  done
  [[ "${_LEAVE_WORK:-0}" == "0" ]] && rm -rf "$WORK"
}

# ── 1. GVHMR extraction (optional if --pt given) ──────────────────────
if [[ -z "$PT" ]]; then
  [[ -f "$VIDEO" ]] || fail "Video not found: $VIDEO"
  VIDEO_ABS="$(realpath "$VIDEO")"
  STEM="$(basename "$VIDEO_ABS" .${VIDEO_ABS##*.})"
  step "GVHMR extraction — $(basename "$VIDEO_ABS")"
  (
    cd "$GVHMR_DIR"
    "$GVHMR_PY" tools/demo/demo.py --video "$VIDEO_ABS" -s 2>&1 | tail -5 || true
  )
  PT="$GVHMR_DIR/outputs/demo/$STEM/hmr4d_results.pt"
  [[ -f "$PT" ]] || fail "GVHMR output missing: $PT"
  ok "hmr4d_results.pt → $PT"
else
  PT="$(realpath "$PT")"
  STEM="$(basename "$(dirname "$PT")")"
  [[ -f "$PT" ]] || fail "--pt file missing: $PT"
  ok "Using existing .pt → $PT"
fi

# ── 2. .pt → SMPL .npz ────────────────────────────────────────────────
step "Converting .pt → SMPL .npz"
NPZ_NAME="${STEM}.npz"
NPZ_PATH="$V_GROOT_DIR/smpl_data/$NPZ_NAME"
mkdir -p "$V_GROOT_DIR/smpl_data"
(
  cd "$REPO_DIR"
  PYTHONPATH="$REPO_DIR" "$GVHMR_PY" -m core.conversion.to_smpl_npz \
    --pt "$PT" --out "$NPZ_PATH" --fps "$FPS"
)
ok "SMPL NPZ → $NPZ_PATH"

# ── 3. Launch SONIC + MuJoCo (run_test.py smpl) ───────────────────────
step "Launching GR00T WBC + MuJoCo (this takes ~20–30 s to initialise)"
pkill -9 -f 'run_sim_loop|g1_deploy_onnx_ref|run_test.py' 2>/dev/null || true
sleep 3

TEST_LOG="$WORK/run_test.log"
(
  cd "$V_GROOT_DIR"
  DISPLAY="$DISPLAY_ID" "$ISAACLAB_PY" run_test.py smpl \
    --npz "smpl_data/$NPZ_NAME" --loop --fps "$FPS" \
    </dev/null >"$TEST_LOG" 2>&1 &
  echo $! > "$WORK/test.pid"
)
TEST_PID=$(cat "$WORK/test.pid")
ok "run_test.py PID=$TEST_PID  (log: $TEST_LOG)"

# ── 4. Wait for the MuJoCo viewer window (title ≈ "MuJoCo : …") ───────
step "Waiting for MuJoCo window on DISPLAY=$DISPLAY_ID…"
WIN_ID=""
WIN_NAME=""
for i in $(seq 1 90); do
  WIN_ID="$(DISPLAY=$DISPLAY_ID xdotool search --name '^MuJoCo' 2>/dev/null | head -1 || true)"
  if [[ -n "$WIN_ID" ]]; then
    WIN_NAME="$(DISPLAY=$DISPLAY_ID xdotool getwindowname "$WIN_ID" 2>/dev/null || echo '?')"
    break
  fi
  sleep 1
  if ! kill -0 "$TEST_PID" 2>/dev/null; then
    fail "run_test.py died before MuJoCo opened — tail of log:
$(tail -30 "$TEST_LOG")"
  fi
done
[[ -n "$WIN_ID" ]] || fail "MuJoCo window never appeared; tail of log:
$(tail -30 "$TEST_LOG")"
ok "MuJoCo window id=$WIN_ID  ($WIN_NAME)"

# ── 5. Wait until SONIC has started tracking ─────────────────────────
step "Waiting for SONIC to begin tracking ('TEST RUNNING' / 'Start control')…"
ACTIVATED=0
for i in $(seq 1 180); do
  if grep -Eq 'TEST RUNNING|Start control|policy active|Loaded NPZ' "$TEST_LOG"; then
    ACTIVATED=1; break
  fi
  sleep 1
  if ! kill -0 "$TEST_PID" 2>/dev/null; then
    fail "run_test.py died before activation — tail of log:
$(tail -30 "$TEST_LOG")"
  fi
done
if [[ $ACTIVATED -eq 0 ]]; then
  warn "Didn't see activation marker after 180 s — recording anyway"
fi
sleep 3  # let initial frames settle + robot drop from rubber band

# ── 6. Screen-capture the MuJoCo window for DURATION seconds ──────────
mkdir -p "$REPO_DIR/web/public/demos" "$REPO_DIR/logs"
TS=$(date -u +%Y%m%dT%H%M%SZ)
[[ -z "$OUT" ]] && OUT="$REPO_DIR/logs/groot_mimic_${STEM}_${TS}.mp4"
mkdir -p "$(dirname "$OUT")"

# bring window on top + grab its exact geometry
DISPLAY=$DISPLAY_ID xdotool windowactivate "$WIN_ID" 2>/dev/null || true
DISPLAY=$DISPLAY_ID xdotool windowraise    "$WIN_ID" 2>/dev/null || true
sleep 1
GEO_RAW="$(DISPLAY=$DISPLAY_ID xdotool getwindowgeometry --shell "$WIN_ID")"
eval "$GEO_RAW"     # sets WIDTH/HEIGHT/X/Y
W=${WIDTH}; H=${HEIGHT}; PX=${X}; PY=${Y}
# ffmpeg x11grab requires even dimensions
W=$(( W - W % 2 )); H=$(( H - H % 2 ))

step "Recording ${W}x${H} @ ${FPS} fps for ${DURATION}s → $(basename "$OUT")"
ffmpeg -y -hide_banner -loglevel warning \
  -f x11grab -framerate "$FPS" -video_size "${W}x${H}" -i "${DISPLAY_ID}+${PX},${PY}" \
  -t "$DURATION" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p \
  "$OUT" &
FFMPEG_PID=$!

# wait for ffmpeg (bounded by DURATION+buffer)
wait "$FFMPEG_PID" || true
FFMPEG_PID=""

[[ -s "$OUT" ]] || fail "Recording empty — check $TEST_LOG"
ok "Recording: $(du -h "$OUT" | cut -f1)"

# ── 7. Summary ────────────────────────────────────────────────────────
printf '\n%s=====%s done %s=====%s\n' "$G" "$X" "$G" "$X"
printf '  input video  : %s\n' "${VIDEO:-<pt-only>}"
printf '  GVHMR .pt    : %s\n' "$PT"
printf '  SMPL .npz    : %s\n' "$NPZ_PATH"
printf '  MuJoCo demo  : %s\n' "$OUT"
printf '  run log      : %s\n' "$TEST_LOG"

_LEAVE_WORK=1  # keep log around for inspection
