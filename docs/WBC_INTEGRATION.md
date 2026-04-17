# WBC integration plan

> Status: **spec / placeholder**, landing in `v0.2`.

This document locks the interface so the WBC module — being developed separately — can drop in without touching the rest of the pipeline.

## Goals

1. Take a retargeted G1 PKL and roll it out under a whole-body controller (NVIDIA Groot or similar).
2. Output torque-level trajectories that respect balance, contact, and actuator limits.
3. Render the rollout back into the same MuJoCo previewer so reference vs. simulated can be compared side-by-side.

## Non-goals (v0.2)

- Training new WBC policies. v0.2 assumes a pretrained checkpoint is supplied.
- Real-robot deployment. WBC here is a simulation validator.

## Interface

Lives at `core/wbc/__init__.py`. Concrete implementations drop a module under `core/wbc/<backend>/` and expose a `WBCController` satisfying:

```python
from typing import Protocol
import numpy as np

from core import MotionData

class WBCController(Protocol):
    """Torque-level whole-body controller tracking a reference MotionData."""

    def reset(self, motion: MotionData) -> None:
        """Initialize internal state (MuJoCo sim, controller, reference buffer)."""

    def step(self, obs: dict) -> np.ndarray:
        """One control step. Returns joint torques (shape (29,) for G1)."""

    def rollout(self, motion: MotionData, horizon: int | None = None) -> MotionData:
        """Simulate the full reference and return the actually-achieved motion.

        `horizon` defaults to `motion.n_frames`; shorter values let you
        validate start-up behavior quickly.
        """
```

## Drop-in checklist

When the Groot code is ready:

- [ ] Add `core/wbc/groot/controller.py` implementing `WBCController`.
- [ ] Wire `core/wbc/__init__.py` to export it: `from core.wbc.groot import GrootController`.
- [ ] Ship a loader: `core/wbc/groot/load.py` reading the checkpoint path from `PipelineConfig`.
- [ ] Add a new PKL key `meta["wbc_rolled_out"] = True` so downstream tools can tell.
- [ ] Implement `notebooks/04_wbc_simulation.ipynb` — currently a placeholder.
- [ ] Wire the `web/app/playground/` page to render rollout comparisons.
- [ ] Bump semver to `v0.2.0` and update `CHANGELOG.md`.

## Open questions

- Is the Groot controller observation scheme stable? If not, ship `step()` behind an adapter.
- Do we need per-joint torque limits enforced here, or upstream in `sanitize_motion`?  
  _Leaning towards: torque limits are a WBC concern; kinematic limits stay in `sanitize`._
- State machine for failed rollouts — log and continue, or hard-fail?

File issues against the `wbc` label when you hit any of these.

## Related reading

- `core/sanitize/motion_sanitizer.py` — kinematic cleanup this already does.
- `docs/ARCHITECTURE.md` — full pipeline, where WBC slots in.
