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
    try:
        import torch  # type: ignore[import-not-found]

        cuda = bool(torch.cuda.is_available())
        if not cuda:
            notes.append("CUDA unavailable — GVHMR will run on CPU (slow)")
    except ImportError:
        notes.append("torch not installed")

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
