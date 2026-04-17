"""Minimal Gradio GUI entrypoint — delegates to core.* for actual work.

Kept small on purpose: the GUI should be a thin UI layer. All business logic
lives in `core/`. Full 7-tab GUI (with training + policy replay) stays in the
separate VideoToRLPolicy repo; this one ships the three stages needed for the
WBC drop: video → SMPL → G1.
"""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

import gradio as gr

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core import MotionData, PipelineConfig
from core.extraction import extract_gvhmr
from core.render import render_mujoco
from core.retargeting import retarget_to_g1
from core.sanitize import sanitize_motion

GVHMR_ROOT = Path(os.environ.get("GVHMR_PATH", "~/Projects/IL/GVHMR")).expanduser()
GMR_ROOT = Path(os.environ.get("GMR_PATH", "~/Projects/IL/GMR")).expanduser()
PORT = int(os.environ.get("VIDEOTOSMPL_PORT", "7860"))
SHARE = os.environ.get("VIDEOTOSMPL_SHARE", "0") == "1"


def run_pipeline(video_file: str, do_sanitize: bool, progress=gr.Progress()):
    if not video_file:
        raise gr.Error("Upload a video first.")

    workdir = Path(tempfile.mkdtemp(prefix="v2smpl_"))
    video = Path(video_file)

    progress(0.05, desc="Extracting SMPL (GVHMR)")
    pt = extract_gvhmr(video, gvhmr_root=GVHMR_ROOT, output_dir=workdir)

    progress(0.50, desc="Retargeting to G1")
    raw_pkl = workdir / "raw.pkl"
    retarget_to_g1(pt, raw_pkl, gmr_root=GMR_ROOT)

    if do_sanitize:
        progress(0.70, desc="Sanitizing motion")
        clean = sanitize_motion(raw_pkl, workdir / "clean.pkl", PipelineConfig())
    else:
        clean = MotionData.load(raw_pkl)

    progress(0.85, desc="Rendering preview")
    mp4 = render_mujoco(clean, workdir / "preview.mp4")

    progress(1.0, desc="Done")
    return str(pt), str(clean.meta.get("path") or (workdir / "clean.pkl")), str(mp4)


with gr.Blocks(title="VideoToSMPL — local", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# VideoToSMPL — local Gradio\nVideo → SMPL → Unitree G1, end-to-end.")

    with gr.Row():
        video_in = gr.Video(label="Input video")
        with gr.Column():
            sanitize_cb = gr.Checkbox(value=True, label="Run sanitizer")
            run_btn = gr.Button("Run pipeline", variant="primary")

    with gr.Row():
        out_pt = gr.File(label="SMPL params (.pt)")
        out_pkl = gr.File(label="G1 motion (.pkl)")
        out_mp4 = gr.Video(label="MuJoCo preview")

    run_btn.click(run_pipeline, inputs=[video_in, sanitize_cb], outputs=[out_pt, out_pkl, out_mp4])


if __name__ == "__main__":
    demo.queue().launch(server_port=PORT, share=SHARE)
