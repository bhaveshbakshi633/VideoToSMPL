# Quickstart

Five minutes from a video file to SMPL parameters, using Google Colab's free T4 GPU. No install, no login, no data ever leaves Colab's sandbox.

## Step 1 — open the notebook

Click the button on the [landing page](https://bhaveshbakshi633.github.io/VideoToSMPL) or open this link:

[Notebook 01 · Video → SMPL (Colab)](https://colab.research.google.com/github/bhaveshbakshi633/VideoToSMPL/blob/main/notebooks/01_video_to_smpl.ipynb)

## Step 2 — enable the GPU

**Runtime → Change runtime type → T4 GPU → Save.** Colab's free tier hands out T4s on demand; occasionally you'll get `Busy`. If so, wait 1–2 minutes and try again.

## Step 3 — run all cells

**Runtime → Run all.**

The notebook will:

1. Check the GPU and torch install.
2. Clone the public [GVHMR](https://github.com/zju3dv/GVHMR) repo.
3. Download model weights (~2 GB, one-time).
4. Prompt you to upload a video.
5. Run GVHMR extraction (~1–2 minutes for a 10-second video).
6. Export `hmr4d_results.pt` and a `smpl_params.json` summary.
7. Trigger downloads to your machine.

## What you get

- `hmr4d_results.pt` — full GVHMR output with SMPL global/incam params, camera, and keypoints.
- `smpl_params.json` — summary with frame count, shapes, dtype.

Feed the `.pt` into [Notebook 02](https://colab.research.google.com/github/bhaveshbakshi633/VideoToSMPL/blob/main/notebooks/02_smpl_to_g1.ipynb) to retarget to Unitree G1, or use [Notebook 03](https://colab.research.google.com/github/bhaveshbakshi633/VideoToSMPL/blob/main/notebooks/03_full_pipeline.ipynb) for the full pipeline in one pass.

## Tips for better results

- **Single person, full body visible.** Both GVHMR and the retargeter assume a single subject.
- **Static camera.** GVHMR's `-s` flag is enabled by default; camera motion estimation (DPVO) costs extra RAM and isn't needed for most short clips.
- **Side profile** for gait/locomotion; **front** for upper-body motions.
- **10–60 seconds** is the sweet spot for free Colab.
- **≥ 720p** for reliable person detection; upscale with `ffmpeg` if needed.

## Troubleshooting

Hit a wall? Start with the [troubleshooting page](./TROUBLESHOOTING.md) — the top 12 failure modes plus exact copy-paste fixes.

## Want to run locally?

If you have an NVIDIA GPU with ≥ 8 GB VRAM, see the [local setup guide](./LOCAL_SETUP.md). A local install takes ~30 minutes the first time and gives you a Gradio UI plus a CLI.
