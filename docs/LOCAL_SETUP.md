# Local setup (BYO-GPU)

Run the entire pipeline on your own machine. Once installed, iteration is much faster than Colab and you can use larger/longer videos than the free tier tolerates.

## Requirements

| Component | Minimum | Tested on |
|-----------|---------|-----------|
| OS        | Ubuntu 22.04 | Ubuntu 22.04 |
| GPU       | NVIDIA, ≥ 8 GB VRAM | RTX A2000 12 GB |
| CUDA      | 12.1 | 12.1 |
| Disk      | 15 GB free | — |
| Conda     | Miniconda ≥ 24 | — |
| ffmpeg    | 4.x | 4.4 |

## One-shot install

```bash
git clone https://github.com/bhaveshbakshi633/VideoToSMPL.git
cd VideoToSMPL
bash scripts/install_local.sh
```

The installer:

1. Clones **GVHMR** and **GMR** next to this repo.
2. Creates two conda envs — `gvhmr` (GPU, extraction) and `gmr` (CPU/GPU, retargeting + GUI).
3. Installs PyTorch 2.3 + CUDA 12.1 into `gvhmr`.
4. Installs this repo's `core` package into `gmr` (editable).
5. Downloads ~2 GB of model weights from HuggingFace.
6. Runs `healthcheck.py`.

Flags:

| Flag | Effect |
|------|--------|
| `--yes` / `-y` | non-interactive, assume yes to prompts |
| `--skip-weights` | clone envs only, skip HuggingFace download |

## Directory layout after install

```
Projects/IL/          ← or wherever you cloned
├── VideoToSMPL/      (this repo)
├── GVHMR/
└── GMR/
```

Override with env vars if you placed them elsewhere:

```bash
export GVHMR_PATH=/path/to/GVHMR
export GMR_PATH=/path/to/GMR
```

## Run

### GUI (recommended for exploration)

```bash
bash scripts/run_local.sh          # http://localhost:7860
bash scripts/run_local.sh --port 8080
bash scripts/run_local.sh --share  # temporary Gradio public URL
```

### CLI (batch / scripting)

```python
from pathlib import Path
from core.extraction import extract_gvhmr
from core.retargeting import retarget_to_g1
from core.sanitize import sanitize_motion
from core.render import render_mujoco

pt  = extract_gvhmr("video.mp4", output_dir="out")
pkl = retarget_to_g1(pt, "out/raw.pkl")
clean = sanitize_motion(pkl, "out/clean.pkl")
mp4 = render_mujoco(clean, "out/preview.mp4")
```

### Notebook (local Jupyter)

Any of the notebooks in `notebooks/` can be run locally. Skip the cloning/install cells — those are for Colab.

## Updating

```bash
cd VideoToSMPL
git pull
# re-run install if requirements changed:
bash scripts/install_local.sh --skip-weights
```

## Uninstalling

```bash
conda env remove -n gvhmr
conda env remove -n gmr
rm -rf VideoToSMPL GVHMR GMR
```

## Something not working?

Run the healthcheck first — it tells you exactly what's missing.

```bash
conda activate gmr
python scripts/healthcheck.py
```

Then consult the [troubleshooting page](./TROUBLESHOOTING.md).
