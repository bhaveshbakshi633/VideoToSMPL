# Architecture

## Data flow

```
video.mp4
   │
   ▼   GVHMR  (extraction/gvhmr_wrapper.py → calls tools/demo/demo.py)
hmr4d_results.pt                                     ← SMPL global/incam params
   │
   ▼   GMR   (retargeting/gmr_wrapper.py → calls scripts/gvhmr_to_robot.py)
raw.pkl        ← MotionData { fps, root_pos, root_rot (xyzw), dof_pos (29) }
   │
   ▼   sanitizer  (sanitize/motion_sanitizer.py)
clean.pkl      ← same schema, velocity-limited + joint-clamped + foot-grounded
   │
   ▼   renderer   (render/mujoco_renderer.py)
preview.mp4    ← off-screen MuJoCo playback
   │
   ▼   (coming in v0.2)
WBC rollout    ← NVIDIA Groot controller in MuJoCo, torque-level
```

Each arrow is a pure function over its input artifact — drop in a new video at the top, new `.mp4` at the bottom. Every intermediate file is inspectable and reusable.

## Module boundaries

| Module              | Responsibility                                         | Heavy deps     |
|---------------------|--------------------------------------------------------|----------------|
| `core._types`       | `MotionData`, `PipelineConfig`, schema validation      | numpy          |
| `core.extraction`   | Video → SMPL params via GVHMR                          | torch, GVHMR   |
| `core.retargeting`  | SMPL → G1 PKL via GMR IK                               | mujoco, GMR    |
| `core.sanitize`     | Velocity smoothing, joint clamping, foot grounding     | scipy, mujoco  |
| `core.render`       | PKL → MP4 headless MuJoCo                              | mujoco, imageio|
| `core.wbc`          | Plugin point for Groot WBC (placeholder in v0.1)       | TBD            |

Heavy deps are imported **inside** functions, not at module top. `import core` is ~1 ms and works in any env — the heavy stuff only loads when you actually call `extract_gvhmr()`.

## Why wrappers, not re-implementations?

Both GVHMR and GMR are actively developed. Re-implementing their entry points would mean re-porting every fix. Instead:

- `extract_gvhmr()` shells out to `GVHMR/tools/demo/demo.py`.
- `retarget_to_g1()` shells out to `GMR/scripts/gvhmr_to_robot.py`.
- Our wrappers manage paths, timeouts, logging, and failure modes.

Trade-off: subprocess overhead (~1 s per call). Gain: we inherit every upstream improvement for free.

## Quaternion conventions

The single most common source of bugs in this kind of pipeline.

| Location              | Order |
|-----------------------|-------|
| `MotionData.root_rot` | **xyzw** |
| MuJoCo `qpos[3:7]`    | wxyz  |
| GMR internals         | wxyz  |
| GVHMR internals       | rotation matrices |
| PKL on disk           | **xyzw** |

Convention: **xyzw at the boundary, wxyz inside MuJoCo**. Every wrapper converts on the way in/out. If you see a "robot upside-down" bug, check this first.

## Frame conventions

| Frame       | Axes                                          | Used by           |
|-------------|-----------------------------------------------|-------------------|
| GVHMR world | x-right, y-up, z-forward (OpenGL)             | GVHMR output      |
| NLF camera  | x-right, y-down, z-forward (OpenCV)           | NLF legacy path   |
| Robot world | x-right, y-forward, z-up                      | MuJoCo, G1, PKL   |

`core.retargeting` handles the GVHMR → robot rotation via GMR's built-in `Rx+90°`. The NLF legacy path needs `Rx(-90°)` post-FK. Don't apply either twice.

## Extension points

### Adding a new human-pose extractor

Drop a new file under `core/extraction/` with the same signature as `extract_gvhmr`:

```python
def extract_mymethod(video_path, *, output_dir=None, **kwargs) -> Path:
    """Returns path to a result file consumable by downstream retargeting."""
```

Register it in `core/extraction/__init__.py`.

### Adding a new robot

Robots are defined in GMR's `ROBOT_XML_DICT`. To add a new one:

1. Place the MuJoCo XML under `GMR/assets/<robot_name>/<robot_name>.xml`.
2. Register in GMR's `__init__.py`.
3. Update `PipelineConfig.robot` default if you want.

The sanitizer and renderer already read joint counts / foot body names from the XML — no code changes needed.

### Adding a WBC controller (v0.2)

See [WBC_INTEGRATION.md](./WBC_INTEGRATION.md) for the plugin contract.

## What's NOT in this repo

- **RL training code** — lives in the separate [VideoToRLPolicy](https://github.com/bhaveshbakshi633/VideoToRLPolicy) repo with Isaac Sim + Isaac Lab.
- **Policy deployment / ONNX export** — same.
- **Real-robot control** — on the G1 directly, via Unitree SDK.

This repo stops at validated motion data. Downstream training/deployment is a separate concern with a much larger dep graph.
