"""/api/health — quick sanity probe."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter

from server import __version__
from server.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    notes: list[str] = []
    cuda = False

    # GVHMR runs in its own env via subprocess — probe CUDA there rather than
    # the backend env (which doesn't need torch).
    gvhmr_py = os.environ.get("GVHMR_PYTHON", "/home/ssi/anaconda3/envs/gvhmr/bin/python")
    if os.path.exists(gvhmr_py):
        import subprocess

        try:
            out = subprocess.run(
                [gvhmr_py, "-c", "import torch; print(torch.cuda.is_available())"],
                capture_output=True, text=True, timeout=10,
            )
            cuda = out.stdout.strip() == "True"
            if not cuda:
                notes.append("CUDA unavailable in gvhmr env — extraction will be slow")
        except Exception as e:  # noqa: BLE001
            notes.append(f"torch probe failed: {e}")
    else:
        notes.append(f"gvhmr python not found at {gvhmr_py} (set GVHMR_PYTHON)")

    gvhmr = Path(os.environ.get("GVHMR_PATH", "~/Projects/IL/GVHMR")).expanduser()
    gmr = Path(os.environ.get("GMR_PATH", "~/Projects/IL/GMR")).expanduser()
    gvhmr_ok = (gvhmr / "tools" / "demo" / "demo.py").exists()
    gmr_ok = (gmr / "scripts" / "gvhmr_to_robot.py").exists()
    if not gvhmr_ok:
        notes.append(f"GVHMR missing at {gvhmr}")
    if not gmr_ok:
        notes.append(f"GMR missing at {gmr}")

    return HealthResponse(
        ok=gvhmr_ok and gmr_ok,
        version=__version__,
        cuda_available=cuda,
        gvhmr_path=str(gvhmr),
        gmr_path=str(gmr),
        gvhmr_ok=gvhmr_ok,
        gmr_ok=gmr_ok,
        notes=notes,
    )
