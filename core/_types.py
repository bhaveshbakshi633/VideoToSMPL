"""Shared types and the canonical motion-data schema."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np


@dataclass
class MotionData:
    """Canonical motion record — same schema consumed/produced across the pipeline.

    Units:
        root_pos  — meters, world frame (x-right, y-forward, z-up)
        root_rot  — quaternion xyzw (NOT wxyz — MuJoCo/GMR use wxyz; convert at boundary)
        dof_pos   — radians, joint order matches robot XML (G1: 29 DoF)
        fps       — frame rate of the source capture

    Invariants:
        root_pos.shape == (N, 3)
        root_rot.shape == (N, 4)
        dof_pos.shape  == (N, J)   # J == 29 for Unitree G1
        fps > 0
    """

    fps: float
    root_pos: np.ndarray  # (N, 3)
    root_rot: np.ndarray  # (N, 4) xyzw
    dof_pos: np.ndarray   # (N, J)
    local_body_pos: np.ndarray | None = None
    link_body_list: list[str] | None = None
    meta: dict[str, Any] = field(default_factory=dict)

    @property
    def n_frames(self) -> int:
        return int(self.root_pos.shape[0])

    @property
    def n_dof(self) -> int:
        return int(self.dof_pos.shape[1])

    @property
    def duration_sec(self) -> float:
        return self.n_frames / self.fps

    def validate(self) -> None:
        """Raise ValueError if shape/value invariants are broken."""
        n = self.n_frames
        if self.root_pos.shape != (n, 3):
            raise ValueError(f"root_pos must be (N,3), got {self.root_pos.shape}")
        if self.root_rot.shape != (n, 4):
            raise ValueError(f"root_rot must be (N,4), got {self.root_rot.shape}")
        if self.dof_pos.ndim != 2 or self.dof_pos.shape[0] != n:
            raise ValueError(f"dof_pos must be (N,J), got {self.dof_pos.shape}")
        if self.fps <= 0:
            raise ValueError(f"fps must be positive, got {self.fps}")
        norms = np.linalg.norm(self.root_rot, axis=1)
        if not np.allclose(norms, 1.0, atol=1e-3):
            raise ValueError(f"root_rot not unit quaternion (max deviation {abs(norms-1).max():.3e})")

    # ───── Serialization ─────
    def to_dict(self) -> dict[str, Any]:
        return {
            "fps": float(self.fps),
            "root_pos": self.root_pos,
            "root_rot": self.root_rot,
            "dof_pos": self.dof_pos,
            "local_body_pos": self.local_body_pos,
            "link_body_list": self.link_body_list,
            "meta": self.meta,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> MotionData:
        return cls(
            fps=float(d["fps"]),
            root_pos=np.asarray(d["root_pos"], dtype=np.float32),
            root_rot=np.asarray(d["root_rot"], dtype=np.float32),
            dof_pos=np.asarray(d["dof_pos"], dtype=np.float32),
            local_body_pos=d.get("local_body_pos"),
            link_body_list=d.get("link_body_list"),
            meta=d.get("meta", {}),
        )

    def save(self, path: str | Path) -> None:
        import pickle

        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open("wb") as f:
            pickle.dump(self.to_dict(), f)

    @classmethod
    def load(cls, path: str | Path) -> MotionData:
        import pickle

        with Path(path).open("rb") as f:
            return cls.from_dict(pickle.load(f))


@dataclass
class PipelineConfig:
    """End-to-end configuration for the video → G1 pipeline."""

    robot: str = "unitree_g1"
    fps: float = 30.0
    max_joint_vel_deg: float = 300.0
    smooth_window: int | None = None  # None → auto-size
    ground_margin_m: float = 0.005
    tilt_threshold_deg: float = 2.0
    gvhmr_static_cam: bool = True  # use -s flag
    device: str = "cuda"  # "cuda" or "cpu"
