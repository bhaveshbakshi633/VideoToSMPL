"""Physics-aware cleanup of retargeted motion.

Four passes, in order:
    1. Temporal smoothing      — iterative SavGol until velocity limit satisfied
    2. Joint-limit scaling     — proportional squeeze (no hard clips)
    3. Tilt-bias removal       — zero out mean roll/pitch, preserve yaw
    4. Per-frame foot grounding — lowest foot = ground + margin

Heavy deps (mujoco, scipy) are imported inside the function so `import core`
stays cheap in environments that only need MotionData.
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

import numpy as np

from core._types import MotionData, PipelineConfig

if TYPE_CHECKING:  # pragma: no cover
    import mujoco


def _get_joint_limits(robot: str) -> np.ndarray:
    """(J, 2) array of (lo, hi) radians from the MuJoCo XML."""
    import mujoco

    from core.sanitize._gmr_paths import robot_xml_path

    model = mujoco.MjModel.from_xml_path(str(robot_xml_path(robot)))
    limits = []
    for i in range(model.njnt):
        if model.joint(i).type == 3:  # hinge only
            limits.append(model.jnt_range[i])
    return np.asarray(limits, dtype=np.float64)


def _smooth_joints(
    dof_pos: np.ndarray, fps: float, max_vel_deg: float, window: int | None
) -> np.ndarray:
    """Iterative SavGol smoothing until max joint velocity ≤ max_vel_deg."""
    from scipy.signal import savgol_filter

    n = len(dof_pos)
    if n < 5:
        return dof_pos

    raw_vel = np.abs(np.diff(np.degrees(dof_pos), axis=0)) * fps
    if raw_vel.max() <= max_vel_deg:
        return dof_pos

    w = window or 5
    w = w if w % 2 == 1 else w + 1
    w = min(w, n if n % 2 == 1 else n - 1)
    if w < 5:
        return dof_pos

    smoothed = dof_pos.copy()
    for _ in range(5):
        smoothed = savgol_filter(smoothed, w, 2, axis=0)
        vel = np.abs(np.diff(np.degrees(smoothed), axis=0)) * fps
        if vel.max() <= max_vel_deg:
            return smoothed
        w = min(w + 4, n if n % 2 == 1 else n - 1)
        w = w if w % 2 == 1 else w + 1

    return smoothed


def _smooth_root_rot(root_rot: np.ndarray, window: int = 7) -> np.ndarray:
    """Hemisphere-consistent quaternion smoothing + renorm."""
    from scipy.signal import savgol_filter

    n = len(root_rot)
    w = window if window % 2 == 1 else window + 1
    w = min(w, n if n % 2 == 1 else n - 1)
    if w < 5:
        return root_rot

    rot = root_rot.copy()
    for i in range(1, n):
        if np.dot(rot[i], rot[i - 1]) < 0:
            rot[i] = -rot[i]
    rot = savgol_filter(rot, w, 2, axis=0)
    norms = np.linalg.norm(rot, axis=1, keepdims=True)
    return rot / np.maximum(norms, 1e-8)


def _scale_to_limits(
    dof_pos: np.ndarray, limits: np.ndarray, margin_deg: float = 2.0
) -> np.ndarray:
    """Squeeze each joint trajectory into [lo+margin, hi-margin] proportionally."""
    margin = np.radians(margin_deg)
    scaled = dof_pos.copy()

    for j in range(dof_pos.shape[1]):
        lo, hi = limits[j]
        lo_s, hi_s = lo + margin, hi - margin
        jmin, jmax = scaled[:, j].min(), scaled[:, j].max()
        if jmin >= lo_s and jmax <= hi_s:
            continue

        jrange = jmax - jmin
        srange = hi_s - lo_s
        if jrange < 1e-6:
            scaled[:, j] = np.clip(scaled[:, j], lo_s, hi_s)
            continue

        if jrange <= srange:
            if jmin < lo_s:
                scaled[:, j] += lo_s - jmin
            elif jmax > hi_s:
                scaled[:, j] -= jmax - hi_s
        else:
            center = (jmin + jmax) / 2
            safe_center = (lo_s + hi_s) / 2
            scale = srange / jrange
            scaled[:, j] = safe_center + (scaled[:, j] - center) * scale

    return scaled


def _remove_tilt_bias(root_rot: np.ndarray, threshold_deg: float) -> np.ndarray:
    """Zero out mean roll/pitch if |mean| > threshold. Yaw untouched."""
    from scipy.spatial.transform import Rotation as R

    eulers = R.from_quat(root_rot).as_euler("xyz", degrees=False)
    mean_x, mean_y = eulers[:, 0].mean(), eulers[:, 1].mean()
    if abs(np.degrees(mean_x)) <= threshold_deg and abs(np.degrees(mean_y)) <= threshold_deg:
        return root_rot
    correction = R.from_euler("xy", [-mean_x, -mean_y])
    return (correction * R.from_quat(root_rot)).as_quat()


def _ground_feet_per_frame(
    root_pos: np.ndarray,
    root_rot: np.ndarray,
    dof_pos: np.ndarray,
    robot: str,
    margin: float,
) -> np.ndarray:
    """For each frame: FK → shift root.z so lowest ankle/toe sits at `margin`."""
    import mujoco

    from core.sanitize._gmr_paths import robot_xml_path

    model = mujoco.MjModel.from_xml_path(str(robot_xml_path(robot)))
    data = mujoco.MjData(model)

    foot_ids = [
        i for i in range(model.nbody)
        if ("ankle" in model.body(i).name.lower() or "toe" in model.body(i).name.lower())
    ]
    if not foot_ids:
        return root_pos

    grounded = root_pos.copy()
    for i in range(len(root_pos)):
        qw, qx, qy, qz = root_rot[i][[3, 0, 1, 2]]  # xyzw → wxyz
        data.qpos[:3] = grounded[i]
        data.qpos[3:7] = [qw, qx, qy, qz]
        data.qpos[7:] = dof_pos[i]
        mujoco.mj_forward(model, data)
        min_z = min(data.xpos[bid][2] for bid in foot_ids)
        if abs(min_z - margin) > 1e-3:
            grounded[i, 2] -= min_z - margin
    return grounded


def sanitize_motion(
    motion: str | Path | MotionData,
    output: str | Path | None = None,
    config: PipelineConfig | None = None,
    *,
    verbose: bool = False,
) -> MotionData:
    """Sanitize a motion and optionally write to disk.

    Accepts either a MotionData object or a path to a PKL.
    Returns the cleaned MotionData. If `output` is given, also writes it.
    """
    cfg = config or PipelineConfig()
    m = motion if isinstance(motion, MotionData) else MotionData.load(motion)
    m.validate()

    root_pos = m.root_pos.copy()
    root_rot = m.root_rot.copy()
    dof_pos = m.dof_pos.copy()
    n = m.n_frames

    if verbose:
        raw_vel = np.abs(np.diff(np.degrees(dof_pos), axis=0)) * m.fps
        print(f"[sanitize] input: {n} frames @ {m.fps} fps, max_vel={raw_vel.max():.0f} deg/s")

    dof_pos = _smooth_joints(dof_pos, m.fps, cfg.max_joint_vel_deg, cfg.smooth_window)
    from scipy.signal import savgol_filter

    w_xy = min(11, n if n % 2 == 1 else n - 1)
    if w_xy >= 5:
        root_pos[:, :2] = savgol_filter(root_pos[:, :2], w_xy, 2, axis=0)
    root_rot = _smooth_root_rot(root_rot)

    limits = _get_joint_limits(cfg.robot)
    dof_pos = _scale_to_limits(dof_pos, limits)

    root_rot = _remove_tilt_bias(root_rot, cfg.tilt_threshold_deg)

    root_pos[:, 0] -= root_pos[:, 0].mean()
    root_pos[:, 1] -= root_pos[:, 1].mean()
    root_pos = _ground_feet_per_frame(root_pos, root_rot, dof_pos, cfg.robot, cfg.ground_margin_m)

    cleaned = MotionData(
        fps=m.fps,
        root_pos=root_pos.astype(np.float32),
        root_rot=root_rot.astype(np.float32),
        dof_pos=dof_pos.astype(np.float32),
        local_body_pos=m.local_body_pos,
        link_body_list=m.link_body_list,
        meta={**m.meta, "sanitized": True, "max_vel_deg": cfg.max_joint_vel_deg},
    )
    cleaned.validate()

    if verbose:
        final_vel = np.abs(np.diff(np.degrees(cleaned.dof_pos), axis=0)) * cleaned.fps
        print(f"[sanitize] output: max_vel={final_vel.max():.0f} deg/s, "
              f"root_z mean={cleaned.root_pos[:, 2].mean():.3f}m")

    if output is not None:
        cleaned.save(output)
    return cleaned
