#!/usr/bin/env python3
"""Verify a local install — CUDA, external repos, weights, env sanity.

Exits 0 if everything required is present; prints warnings for optional bits.
Run after install, or whenever the pipeline mysteriously breaks.
"""

from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path

GREEN, YELLOW, RED, RESET = "\033[32m", "\033[33m", "\033[31m", "\033[0m"


def ok(msg: str) -> None:
    print(f"{GREEN}✓{RESET} {msg}")


def warn(msg: str) -> None:
    print(f"{YELLOW}!{RESET} {msg}")


def fail(msg: str) -> None:
    print(f"{RED}✗{RESET} {msg}")


def check_cuda() -> bool:
    try:
        import torch
    except ImportError:
        fail("torch not installed")
        return False
    if not torch.cuda.is_available():
        warn("CUDA not available — GVHMR extraction will fall back to CPU (very slow)")
        return True
    name = torch.cuda.get_device_name(0)
    mem = torch.cuda.get_device_properties(0).total_memory / 1e9
    ok(f"CUDA: {name} · {mem:.1f} GB VRAM · torch {torch.__version__}")
    return True


def check_repo(name: str, env_var: str, default: str) -> bool:
    path = Path(os.environ.get(env_var, default)).expanduser()
    if not path.exists():
        fail(f"{name} missing at {path} (set {env_var} or clone the repo)")
        return False
    ok(f"{name} at {path}")
    return True


def check_weights(gvhmr_root: Path) -> bool:
    required = [
        "gvhmr/gvhmr_siga24_release.ckpt",
        "hmr2/epoch=10-step=25000.ckpt",
        "vitpose/vitpose-h-multi-coco.pth",
        "yolo/yolov8x.pt",
        "body_models/smpl/SMPL_NEUTRAL.pkl",
    ]
    ckpt = gvhmr_root / "inputs" / "checkpoints"
    all_ok = True
    for rel in required:
        p = ckpt / rel
        if p.exists() and p.stat().st_size > 1024:
            ok(f"weight {rel} ({p.stat().st_size / 1e6:.0f} MB)")
        else:
            fail(f"missing weight: {p}")
            all_ok = False
    smplx = ckpt / "body_models" / "smplx" / "SMPLX_NEUTRAL.npz"
    if smplx.exists() or smplx.is_symlink():
        ok("SMPLX_NEUTRAL linked")
    else:
        warn("SMPLX_NEUTRAL.npz missing — download from https://smpl-x.is.tue.mpg.de/")
    return all_ok


def check_ffmpeg() -> bool:
    if shutil.which("ffmpeg"):
        ok("ffmpeg found")
        return True
    warn("ffmpeg missing — rendering may fail (sudo apt install ffmpeg)")
    return False


def check_core_import() -> bool:
    try:
        import core  # noqa: F401
        from core import MotionData  # noqa: F401
        from core.sanitize import sanitize_motion  # noqa: F401
    except ImportError as e:
        fail(f"cannot import core: {e}")
        return False
    ok("core package imports cleanly")
    return True


def main() -> int:
    print(f"\n{'─' * 60}\n VideoToSMPL · healthcheck\n{'─' * 60}\n")
    problems = 0

    if not check_cuda():
        problems += 1
    if not check_repo("GVHMR", "GVHMR_PATH", "~/Projects/IL/GVHMR"):
        problems += 1
    if not check_repo("GMR", "GMR_PATH", "~/Projects/IL/GMR"):
        problems += 1

    gvhmr_root = Path(os.environ.get("GVHMR_PATH", "~/Projects/IL/GVHMR")).expanduser()
    if gvhmr_root.exists() and not check_weights(gvhmr_root):
        problems += 1

    check_ffmpeg()
    if not check_core_import():
        problems += 1

    print()
    if problems:
        fail(f"{problems} critical issue(s) — fix before running the pipeline")
        return 1
    ok("all critical checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
