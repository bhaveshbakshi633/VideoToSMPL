# Troubleshooting

Every error here has a root cause and a fix. Work top-down — the first section covers 80 % of what people hit.

## Colab-specific

### `RuntimeError: CUDA out of memory`

GVHMR needs ~6 GB VRAM. Free T4 sometimes lands with other tenants still using it, or your video is 4K.

```bash
# reset runtime
Runtime → Disconnect and delete runtime → Connect
# or downsample
ffmpeg -i input.mp4 -vf scale=-2:720 -c:v libx264 -crf 20 input_720p.mp4
```

### `AssertionError: No GPU detected`

Runtime → Change runtime type → **T4 GPU**. "None" is CPU and GVHMR will not complete in reasonable time.

### Downloads stall mid-way at a HuggingFace URL

Free T4 sometimes has patchy egress. Re-run the weights cell — it's idempotent (skips files already present).

### "This notebook is requesting access to your Google Drive"

Notebooks 01–03 do **not** use Drive. If Colab prompts anyway, deny — it's probably a pre-existing cell from a forked copy.

---

## Install / environment

### `conda: command not found`

Install Miniconda:

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```

### `ImportError: torchvision` or `CUDA version mismatch`

You mixed envs. Every env in this repo pins its own torch / torchvision / CUDA. Don't `pip install` across envs.

```bash
conda deactivate
conda activate gvhmr   # for extraction
conda activate gmr     # for retarget/render/GUI
```

### `FileNotFoundError: GVHMR/tools/demo/demo.py`

The wrapper resolves paths via `GVHMR_PATH` (default `~/Projects/IL/GVHMR`). Set it if you cloned elsewhere:

```bash
export GVHMR_PATH=/path/to/GVHMR
export GMR_PATH=/path/to/GMR
```

### `SMPLX_NEUTRAL.npz missing`

SMPL-X isn't on HuggingFace under a free license. Register at [smpl-x.is.tue.mpg.de](https://smpl-x.is.tue.mpg.de/), download `SMPLX_NEUTRAL.npz`, place under `GMR/assets/body_models/smplx/`, then re-run `install_local.sh --skip-weights`.

---

## Extraction (GVHMR)

### Person disappears mid-video / detection flickers

Both GVHMR and NLF track the **highest-confidence detection per frame**. Multiple people, heavy occlusion, or mirrors cause track switching.

```bash
# crop to the subject before running
ffmpeg -i multi.mp4 -filter:v "crop=in_w/2:in_h:0:0" -c:v libx264 cropped.mp4
```

### "Works fine, but the motion looks drifty"

GVHMR's root translation is world-grounded but not perfect for long clips. For short (< 30 s) clips this is usually acceptable; for longer clips, the sanitizer's per-frame grounding helps, but don't expect mm-accurate root trajectory.

### Want to use moving-camera videos

Re-run without `-s`. GVHMR falls back to DPVO for camera trajectory — slower, needs more RAM. Default is static-camera mode because it's robust and fast.

---

## Retargeting (GMR)

### Robot is upside-down or tilted 90°

Two different bugs with the same visual symptom.

- **GVHMR path:** do **not** manually rotate the result. GMR's loader already applies camera→world (`Rx+90°`). Applying it twice = upside-down.
- **NLF path:** must apply `Rx(-90°)` **after** SMPL-X FK, not before. Pre-FK rotation rotates the root orientation wrongly.

### Motion is jittery with velocity spikes

NLF produces per-frame noise; GVHMR is smoother. Run the sanitizer — it applies iterative SavGol until peak joint velocity fits under 300 °/s.

```bash
python -c "from core.sanitize import sanitize_motion; sanitize_motion('raw.pkl', 'clean.pkl')"
```

### Robot floats or clips through the floor

Root Z from SMPL is in camera coords, not world-grounded. The sanitizer does per-frame MuJoCo forward-kinematics and shifts the root so the lowest foot sits at `ground + 5 mm`.

---

## Render / MuJoCo

### Rendered MP4 is black

Off-screen MuJoCo rendering needs a GL backend. On headless servers use EGL; without a GPU use OSMesa (software, slow).

```bash
export MUJOCO_GL=egl     # headless with NVIDIA GPU
export MUJOCO_GL=osmesa  # no GPU
```

### `imageio: Could not find ffmpeg`

Install system `ffmpeg`. `imageio-ffmpeg` ships a binary, but some distros miss shared libs it depends on.

```bash
sudo apt install -y ffmpeg      # Ubuntu/Debian
brew install ffmpeg             # macOS
```

### Camera angle looks wrong

Pass overrides when rendering:

```python
render_mujoco(motion, "out.mp4", camera_azimuth=45.0, camera_elevation=-20.0, camera_distance=3.5)
```

---

## Performance

### Full pipeline > 5 minutes/video

GVHMR is ~70 % of the total. The rest (retarget + sanitize + render) is < 30 s combined. If you iterate on sanitization or retargeting, **cache the `.pt`** and skip re-extraction:

```python
# reuse existing GVHMR output
retarget_to_g1("cached.pt", "out.pkl")
```

### GPU idle during "retarget" stage

Retargeting is CPU-bound (mink IK solver). That's expected. Only extraction and rendering use the GPU.

---

## Still stuck?

Open a [setup help issue](https://github.com/bhaveshbakshi633/VideoToSMPL/issues/new?template=setup_help.md) with:

- `scripts/healthcheck.py` output (full)
- `nvidia-smi` output
- the exact command you ran and the stderr that came back
- your video's specs (`ffprobe input.mp4`)

The more context, the faster it resolves.
