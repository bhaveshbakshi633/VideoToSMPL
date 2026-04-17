#!/usr/bin/env bash
# Local BYO-GPU setup for VideoToSMPL.
#   - Creates the gvhmr + gmr conda envs (if missing)
#   - Clones GVHMR + GMR alongside this repo
#   - Downloads model weights from HuggingFace (idempotent, safe to re-run)
#
# Usage:
#   bash scripts/install_local.sh             # interactive
#   bash scripts/install_local.sh --yes       # assume yes, skip prompts
#   bash scripts/install_local.sh --skip-weights   # clone only
#
# Requires: conda, git, wget, ~15 GB free disk, NVIDIA GPU + CUDA 12.1.

set -euo pipefail

# ────────────────────────────────────────────────────────────────────────────
# styling + helpers
# ────────────────────────────────────────────────────────────────────────────
BLUE=$'\033[34m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; DIM=$'\033[2m'; RESET=$'\033[0m'
step()  { printf '\n%s▶%s %s\n' "$BLUE" "$RESET" "$*"; }
ok()    { printf '%s✓%s %s\n' "$GREEN" "$RESET" "$*"; }
warn()  { printf '%s!%s %s\n' "$YELLOW" "$RESET" "$*"; }
fail()  { printf '%s✗%s %s\n' "$RED" "$RESET" "$*"; exit 1; }

# ────────────────────────────────────────────────────────────────────────────
# parse flags
# ────────────────────────────────────────────────────────────────────────────
ASSUME_YES=0
SKIP_WEIGHTS=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes)          ASSUME_YES=1 ;;
    --skip-weights)    SKIP_WEIGHTS=1 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) fail "Unknown flag: $1" ;;
  esac
  shift
done

# ────────────────────────────────────────────────────────────────────────────
# preflight
# ────────────────────────────────────────────────────────────────────────────
step "Preflight checks"
command -v conda >/dev/null || fail "conda not found. Install Miniconda: https://docs.conda.io/"
command -v git   >/dev/null || fail "git not found"
command -v wget  >/dev/null || fail "wget not found (sudo apt install wget)"
command -v nvidia-smi >/dev/null || warn "No NVIDIA GPU detected — GVHMR will fall back to CPU (slow)"
ok "Tools OK"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PARENT="$(cd "$REPO_DIR/.." && pwd)"
echo "  repo:   $REPO_DIR"
echo "  parent: $PARENT  ${DIM}(GVHMR + GMR will be cloned here)${RESET}"

if [[ $ASSUME_YES -eq 0 ]]; then
  read -rp "Continue? [y/N] " yn
  [[ "$yn" =~ ^[Yy]$ ]] || fail "Aborted"
fi

# ────────────────────────────────────────────────────────────────────────────
# clone external repos
# ────────────────────────────────────────────────────────────────────────────
step "Cloning external repos into $PARENT"
clone_if_missing() {
  local url="$1" dir="$2"
  if [[ -d "$PARENT/$dir" ]]; then
    ok "$dir already cloned"
  else
    git -C "$PARENT" clone --depth 1 "$url" "$dir"
    ok "$dir cloned"
  fi
}
clone_if_missing https://github.com/zju3dv/GVHMR.git GVHMR
clone_if_missing https://github.com/generalroboticslab/GMR.git GMR

# ────────────────────────────────────────────────────────────────────────────
# conda envs
# ────────────────────────────────────────────────────────────────────────────
source "$(conda info --base)/etc/profile.d/conda.sh"

env_exists() { conda env list | awk '{print $1}' | grep -qx "$1"; }

make_env() {
  local name="$1" py="$2"
  if env_exists "$name"; then
    ok "conda env '$name' already exists"
  else
    step "Creating conda env '$name' (python $py)"
    conda create -y -n "$name" "python=$py"
  fi
}

make_env gvhmr 3.10
make_env gmr   3.10

step "Installing GVHMR into 'gvhmr' env"
conda activate gvhmr
pip install --upgrade pip >/dev/null
pip install torch==2.3.0 torchvision==0.18.0 --index-url https://download.pytorch.org/whl/cu121
pip install -r "$PARENT/GVHMR/requirements.txt"
pip install -e "$PARENT/GVHMR"
conda deactivate
ok "gvhmr env ready"

step "Installing GMR + core into 'gmr' env"
conda activate gmr
pip install --upgrade pip >/dev/null
pip install -e "$PARENT/GMR"
pip install "mujoco>=3.1" "imageio[ffmpeg]" scipy smplx gradio psutil tqdm
pip install -e "$REPO_DIR"      # installs the core package from this repo
conda deactivate
ok "gmr env ready"

# ────────────────────────────────────────────────────────────────────────────
# weights
# ────────────────────────────────────────────────────────────────────────────
if [[ $SKIP_WEIGHTS -eq 1 ]]; then
  warn "Skipping weight downloads (--skip-weights)"
else
  step "Downloading model weights (~2 GB, idempotent)"
  CKPT="$PARENT/GVHMR/inputs/checkpoints"
  mkdir -p "$CKPT"/{gvhmr,hmr2,vitpose,yolo,body_models/smpl,body_models/smplx}
  download_if_missing() {
    local dest="$1" url="$2"
    if [[ -s "$dest" ]]; then
      ok "cached $(basename "$dest")"
    else
      wget -q --show-progress -O "$dest" "$url"
      ok "downloaded $(basename "$dest")"
    fi
  }
  download_if_missing "$CKPT/gvhmr/gvhmr_siga24_release.ckpt" \
    "https://huggingface.co/camenduru/GVHMR/resolve/main/gvhmr/gvhmr_siga24_release.ckpt"
  download_if_missing "$CKPT/hmr2/epoch=10-step=25000.ckpt" \
    "https://huggingface.co/camenduru/GVHMR/resolve/main/hmr2/epoch%3D10-step%3D25000.ckpt"
  download_if_missing "$CKPT/vitpose/vitpose-h-multi-coco.pth" \
    "https://huggingface.co/camenduru/GVHMR/resolve/main/vitpose/vitpose-h-multi-coco.pth"
  download_if_missing "$CKPT/yolo/yolov8x.pt" \
    "https://huggingface.co/camenduru/GVHMR/resolve/main/yolo/yolov8x.pt"
  download_if_missing "$CKPT/body_models/smpl/SMPL_NEUTRAL.pkl" \
    "https://huggingface.co/camenduru/SMPLer-X/resolve/main/SMPL_NEUTRAL.pkl"

  if [[ -f "$PARENT/GMR/assets/body_models/smplx/SMPLX_NEUTRAL.npz" ]]; then
    ln -sf "$PARENT/GMR/assets/body_models/smplx/SMPLX_NEUTRAL.npz" "$CKPT/body_models/smplx/"
    ok "linked SMPLX_NEUTRAL from GMR"
  else
    warn "SMPLX_NEUTRAL.npz missing — download from https://smpl-x.is.tue.mpg.de/ and place under GMR/assets/body_models/smplx/"
  fi
fi

# ────────────────────────────────────────────────────────────────────────────
# healthcheck
# ────────────────────────────────────────────────────────────────────────────
step "Running healthcheck"
conda activate gmr
python "$REPO_DIR/scripts/healthcheck.py" || warn "Healthcheck reported warnings — see above"
conda deactivate

echo
ok "Install complete."
echo "  Next:  ${BLUE}bash scripts/run_local.sh${RESET}"
