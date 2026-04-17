"""Whole-body-control plugin point (placeholder for NVIDIA Groot WBC integration).

Future interface (subject to change once Groot WBC API stabilizes):

    class WBCController(Protocol):
        def reset(self, motion: MotionData) -> None: ...
        def step(self, obs: dict) -> np.ndarray: ...     # joint targets
        def rollout(self, motion: MotionData, horizon: int) -> MotionData: ...

See docs/WBC_INTEGRATION.md for the full contract and extension plan.
"""

from __future__ import annotations

__all__: list[str] = []
