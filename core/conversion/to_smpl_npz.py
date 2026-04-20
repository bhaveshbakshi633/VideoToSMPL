"""GVHMR ``hmr4d_results.pt`` → SMPL ``.npz`` (SONIC / GR00T WBC compatible).

Output schema (consumed by `run_test.py smpl --npz <file>`):
    pose_body         (T, 63)  float32  — 21 joints × 3 axis-angle
    root_orient       (T, 3)   float32  — pelvis axis-angle, Z-up world
    trans             (T, 3)   float32  — pelvis position, Z-up world
    betas             (10,)    float32  — SMPL shape (frame-0, GVHMR keeps betas constant)
    gender            scalar   "neutral"
    mocap_frame_rate  int64    FPS

Frame convention:
    GVHMR's `smpl_params_global` is Y-up. SONIC / gear_sonic `walk_smplx_world`
    expects Z-up. We rotate world by Rx(+90°) — same matrix GMR applies in
    `general_motion_retargeting/kinematics_model/smpl.py` (line ~354).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

_R_YUP_TO_ZUP = np.array(
    [[1, 0, 0],
     [0, 0, -1],
     [0, 1, 0]],
    dtype=np.float32,
)


def convert_gvhmr_to_npz(
    pt_path: str | Path,
    out_path: str | Path,
    *,
    fps: int = 30,
) -> Path:
    """Convert a GVHMR result file to a SONIC-compatible SMPL NPZ.

    Args:
        pt_path: GVHMR output (``hmr4d_results.pt``).
        out_path: Output ``.npz`` path.
        fps: Motion frame rate stored in the NPZ.

    Returns:
        Resolved output path.

    Raises:
        FileNotFoundError: if ``pt_path`` is missing.
        KeyError: if GVHMR keys are missing from the .pt.
    """
    import torch  # lazy — keep `core` importable without torch
    from scipy.spatial.transform import Rotation as R

    pt = Path(pt_path).expanduser().resolve()
    if not pt.exists():
        raise FileNotFoundError(pt)

    data = torch.load(pt, map_location="cpu", weights_only=False)
    g = data["smpl_params_global"]
    body_pose = g["body_pose"].numpy().astype(np.float32)           # (T, 63)
    global_orient = g["global_orient"].numpy().astype(np.float32)   # (T, 3)
    transl = g["transl"].numpy().astype(np.float32)                 # (T, 3)
    betas_per_frame = g["betas"].numpy().astype(np.float32)         # (T, 10)
    n = body_pose.shape[0]

    # Y-up → Z-up: rows rotate by Rx(+90°)
    trans_z = (transl @ _R_YUP_TO_ZUP.T).astype(np.float32)

    # Rotate pelvis axis-angle: new_rot = R_world * old_rot
    r_world = R.from_matrix(_R_YUP_TO_ZUP)
    root_z = (r_world * R.from_rotvec(global_orient)).as_rotvec().astype(np.float32)

    betas = betas_per_frame[0].astype(np.float32)  # GVHMR keeps betas constant

    out = Path(out_path).expanduser().resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    np.savez(
        out,
        pose_body=body_pose,
        root_orient=root_z,
        trans=trans_z,
        betas=betas,
        gender=np.array("neutral", dtype="<U7"),
        mocap_frame_rate=np.int64(fps),
    )
    return out


def _cli() -> int:
    import argparse

    p = argparse.ArgumentParser(description="GVHMR .pt → SMPL .npz")
    p.add_argument("--pt", required=True, help="hmr4d_results.pt")
    p.add_argument("--out", required=True, help="Output .npz")
    p.add_argument("--fps", type=int, default=30)
    a = p.parse_args()

    out = convert_gvhmr_to_npz(a.pt, a.out, fps=a.fps)
    print(f"✓ wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(_cli())
