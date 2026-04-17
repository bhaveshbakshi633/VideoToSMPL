"""GVHMR .pt → Unitree G1 PKL via GMR's IK solver.

Design note:
    GMR ships `scripts/gvhmr_to_robot.py` — we shell out to it rather than
    re-implementing the IK pipeline. Any upstream fix lands automatically
    the next time you `git pull GMR`.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


class RetargetError(RuntimeError):
    """GMR retargeting failed — see .stderr."""

    def __init__(self, msg: str, stderr: str = ""):
        super().__init__(msg)
        self.stderr = stderr


def retarget_to_g1(
    gvhmr_pt: str | Path,
    output_pkl: str | Path,
    *,
    gmr_root: str | Path = "~/Projects/IL/GMR",
    robot: str = "unitree_g1",
    python_executable: str | None = None,
    timeout_sec: int = 600,
) -> Path:
    """Run GMR IK retargeting on a GVHMR .pt and write robot PKL.

    The PKL schema matches `core.MotionData`:
        {fps, root_pos(N,3), root_rot(N,4 xyzw), dof_pos(N,29), ...}

    Raises:
        FileNotFoundError: .pt missing, or GMR repo not cloned.
        RetargetError: IK script exited non-zero.
    """
    pt_in = Path(gvhmr_pt).expanduser().resolve()
    if not pt_in.exists():
        raise FileNotFoundError(f"GVHMR .pt not found: {pt_in}")

    out_pkl = Path(output_pkl).expanduser().resolve()
    out_pkl.parent.mkdir(parents=True, exist_ok=True)

    gmr_dir = Path(gmr_root).expanduser().resolve()
    script = gmr_dir / "scripts" / "gvhmr_to_robot.py"
    if not script.exists():
        raise FileNotFoundError(
            f"GMR script missing: {script}\n"
            f"Clone: git clone https://github.com/YanjieZe/GMR.git {gmr_dir}"
        )

    py = python_executable or sys.executable
    cmd = [
        py,
        str(script),
        "--gvhmr_pt",
        str(pt_in),
        "--robot",
        robot,
        "--save_path",
        str(out_pkl),
    ]

    env = os.environ.copy()
    env.setdefault("PYTHONUNBUFFERED", "1")

    proc = subprocess.run(
        cmd,
        cwd=str(gmr_dir),
        env=env,
        capture_output=True,
        text=True,
        timeout=timeout_sec,
        check=False,
    )
    if proc.returncode != 0:
        raise RetargetError(
            f"GMR retarget exited with code {proc.returncode}", stderr=proc.stderr
        )
    if not out_pkl.exists():
        raise RetargetError(
            f"GMR finished but output PKL missing: {out_pkl}", stderr=proc.stderr
        )
    return out_pkl
