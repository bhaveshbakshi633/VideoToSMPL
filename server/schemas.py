"""API schemas — one source of truth for frontend/backend contract."""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class StageName(str, Enum):
    extract = "extract"
    retarget = "retarget"
    sanitize = "sanitize"
    render = "render"


class StageStatus(str, Enum):
    pending = "pending"
    running = "running"
    done = "done"
    failed = "failed"


class Stage(BaseModel):
    name: StageName
    status: StageStatus = StageStatus.pending
    progress: float = 0.0  # 0..1
    started_at: float | None = None
    ended_at: float | None = None
    duration_sec: float | None = None
    error: str | None = None
    artifact: str | None = None  # filename relative to job dir


class Job(BaseModel):
    id: str
    video_name: str
    created_at: float
    stages: list[Stage]
    status: Literal["pending", "running", "done", "failed"] = "pending"
    error: str | None = None


class UploadResponse(BaseModel):
    job_id: str
    video_name: str
    size_bytes: int


class JobListResponse(BaseModel):
    jobs: list[Job]


class RunRequest(BaseModel):
    sanitize: bool = True
    render_preview: bool = True


class HealthResponse(BaseModel):
    ok: bool = True
    version: str
    cuda_available: bool
    gvhmr_path: str
    gmr_path: str
    gvhmr_ok: bool
    gmr_ok: bool
    notes: list[str] = Field(default_factory=list)
