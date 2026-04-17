"""Thin wrapper around GVHMR demo script.

Why a wrapper?
    GVHMR's `tools/demo/demo.py` is the only maintained entry point. Re-implementing
    the loader duplicates upstream code that keeps drifting. We shell out to demo.py
    and just manage paths, logging, and failure modes.

Usage:
    from core.extraction import extract_gvhmr
    result_pt = extract_gvhmr("input.mp4", gvhmr_root="~/Projects/IL/GVHMR")
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


class GVHMRError(RuntimeError):
    """GVHMR extraction failed — see .stderr for diagnostics."""

    def __init__(self, msg: str, stderr: str = "", returncode: int = -1):
        super().__init__(msg)
        self.stderr = stderr
        self.returncode = returncode


def extract_gvhmr(
    video_path: str | Path,
    gvhmr_root: str | Path = "~/Projects/IL/GVHMR",
    *,
    static_camera: bool = True,
    output_dir: str | Path | None = None,
    python_executable: str | None = None,
    extra_args: list[str] | None = None,
    timeout_sec: int = 900,
) -> Path:
    """Run GVHMR on a single video and return the path to `hmr4d_results.pt`.

    Args:
        video_path: MP4 input.
        gvhmr_root: Cloned GVHMR repo root (must contain tools/demo/demo.py).
        static_camera: Pass `-s` flag (skip DPVO — required for moving cameras).
        output_dir: Copy result into this dir (default: leave at GVHMR/outputs/demo/<stem>/).
        python_executable: Python binary with GVHMR env activated; defaults to current.
        extra_args: Extra CLI args forwarded to demo.py.
        timeout_sec: Kill extraction if it exceeds this.

    Returns:
        Absolute path to the hmr4d_results.pt file.

    Raises:
        FileNotFoundError: video or GVHMR repo missing.
        GVHMRError: demo.py exited non-zero or produced no result.
    """
    video = Path(video_path).expanduser().resolve()
    if not video.exists():
        raise FileNotFoundError(f"Video not found: {video}")

    gvhmr_dir = Path(gvhmr_root).expanduser().resolve()
    demo_script = gvhmr_dir / "tools" / "demo" / "demo.py"
    if not demo_script.exists():
        raise FileNotFoundError(
            f"GVHMR demo script missing: {demo_script}\n"
            f"Clone with: git clone https://github.com/zju3dv/GVHMR.git {gvhmr_dir}"
        )

    py = python_executable or sys.executable
    cmd = [py, str(demo_script), "--video", str(video)]
    if static_camera:
        cmd.append("-s")
    if extra_args:
        cmd.extend(extra_args)

    env = os.environ.copy()
    env.setdefault("PYTHONUNBUFFERED", "1")

    try:
        proc = subprocess.run(
            cmd,
            cwd=str(gvhmr_dir),
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout_sec,
            check=False,
        )
    except subprocess.TimeoutExpired as e:
        raise GVHMRError(f"GVHMR timed out after {timeout_sec}s", stderr=str(e)) from e

    if proc.returncode != 0:
        raise GVHMRError(
            f"GVHMR exited with code {proc.returncode}. "
            f"Check CUDA availability, model weights, and stderr.",
            stderr=proc.stderr,
            returncode=proc.returncode,
        )

    result_pt = gvhmr_dir / "outputs" / "demo" / video.stem / "hmr4d_results.pt"
    if not result_pt.exists():
        raise GVHMRError(
            f"Extraction finished but result missing: {result_pt}",
            stderr=proc.stderr,
        )

    if output_dir is not None:
        out = Path(output_dir).expanduser().resolve()
        out.mkdir(parents=True, exist_ok=True)
        dest = out / f"{video.stem}.pt"
        shutil.copy2(result_pt, dest)
        return dest

    return result_pt


def load_gvhmr_result(pt_path: str | Path) -> dict:
    """Load and lightly validate a hmr4d_results.pt file."""
    import torch  # lazy

    path = Path(pt_path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(path)
    blob = torch.load(path, map_location="cpu", weights_only=False)

    required = ["smpl_params_global"]
    missing = [k for k in required if k not in blob]
    if missing:
        raise ValueError(f"GVHMR result missing keys {missing} in {path}")

    global_params = blob["smpl_params_global"]
    for sub in ("body_pose", "betas", "global_orient", "transl"):
        if sub not in global_params:
            raise ValueError(f"smpl_params_global missing '{sub}' in {path}")

    return blob
