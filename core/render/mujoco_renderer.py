"""Headless MuJoCo renderer — PKL → MP4 preview."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from core._types import MotionData


def render_mujoco(
    motion: str | Path | MotionData,
    output_mp4: str | Path,
    *,
    robot: str = "unitree_g1",
    width: int = 1280,
    height: int = 720,
    camera_distance: float = 3.0,
    camera_azimuth: float = 90.0,
    camera_elevation: float = -15.0,
) -> Path:
    """Render a motion to MP4 using MuJoCo's off-screen renderer.

    Returns the output path.
    """
    import imageio.v2 as imageio  # type: ignore[import-untyped]
    import mujoco

    from core.sanitize._gmr_paths import robot_xml_path

    m = motion if isinstance(motion, MotionData) else MotionData.load(motion)
    m.validate()

    model = mujoco.MjModel.from_xml_path(str(robot_xml_path(robot)))
    data = mujoco.MjData(model)
    renderer = mujoco.Renderer(model, height=height, width=width)

    cam = mujoco.MjvCamera()
    cam.distance = camera_distance
    cam.azimuth = camera_azimuth
    cam.elevation = camera_elevation
    cam.lookat[:] = [0.0, 0.0, 0.9]

    out = Path(output_mp4).expanduser().resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    writer = imageio.get_writer(str(out), fps=int(round(m.fps)), codec="libx264", quality=8)
    try:
        for i in range(m.n_frames):
            qw, qx, qy, qz = m.root_rot[i][[3, 0, 1, 2]]  # xyzw → wxyz
            data.qpos[:3] = m.root_pos[i]
            data.qpos[3:7] = [qw, qx, qy, qz]
            data.qpos[7:] = m.dof_pos[i]
            mujoco.mj_forward(model, data)
            renderer.update_scene(data, camera=cam)
            writer.append_data(np.asarray(renderer.render()))
    finally:
        writer.close()
        renderer.close()

    return out
