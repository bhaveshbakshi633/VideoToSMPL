"""VideoToSMPL core — video → SMPL → G1 robot motion pipeline.

Public API:
    MotionData          # shared dataclass (PKL schema)
    extract_gvhmr       # video → SMPL params (.pt)
    retarget_to_g1      # SMPL → G1 PKL via GMR IK
    sanitize_motion     # physics-aware cleanup
    render_mujoco       # headless MuJoCo render (.pkl → .mp4)

Heavy deps (torch, mujoco, GVHMR, GMR) are imported lazily inside functions,
so `import core` is cheap and safe in any environment.
"""

from core._types import MotionData, PipelineConfig

__all__ = ["MotionData", "PipelineConfig"]
__version__ = "0.1.0"
