"""/api/jobs — create, list, inspect, delete pipeline jobs."""

from __future__ import annotations

import mimetypes
import shutil
import threading
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from server.pipeline_runner import run_job
from server.schemas import Job, JobListResponse, RunRequest, UploadResponse
from server.state import store

router = APIRouter()

ALLOWED_EXT = {".mp4", ".mov", ".webm", ".mkv", ".avi"}
MAX_SIZE_MB = 500


@router.post("/jobs", response_model=UploadResponse, status_code=201)
async def create_job(video: UploadFile = File(...)) -> UploadResponse:
    name = Path(video.filename or "upload.mp4").name
    ext = Path(name).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Unsupported extension {ext}. Allowed: {sorted(ALLOWED_EXT)}")

    record = store.create(name)
    size = 0
    with record.video_path.open("wb") as f:
        while chunk := await video.read(1 << 20):  # 1 MiB chunks
            size += len(chunk)
            if size > MAX_SIZE_MB * 1024 * 1024:
                f.close()
                store.delete(record.job.id)
                raise HTTPException(413, f"Video > {MAX_SIZE_MB} MB")
            f.write(chunk)

    return UploadResponse(job_id=record.job.id, video_name=name, size_bytes=size)


@router.get("/jobs", response_model=JobListResponse)
def list_jobs() -> JobListResponse:
    return JobListResponse(jobs=[r.job for r in store.all()])


@router.get("/jobs/{job_id}", response_model=Job)
def get_job(job_id: str) -> Job:
    record = store.get(job_id)
    if record is None:
        raise HTTPException(404, f"job {job_id} not found")
    return record.job


@router.delete("/jobs/{job_id}", status_code=204)
def delete_job(job_id: str) -> None:
    if not store.delete(job_id):
        raise HTTPException(404, f"job {job_id} not found")


@router.post("/jobs/{job_id}/run", response_model=Job)
def start_job(job_id: str, body: RunRequest = RunRequest()) -> Job:  # noqa: B008
    record = store.get(job_id)
    if record is None:
        raise HTTPException(404, f"job {job_id} not found")
    if record.job.status in ("running",):
        raise HTTPException(409, "job already running")

    worker = threading.Thread(
        target=run_job,
        args=(record,),
        kwargs={"do_sanitize": body.sanitize, "do_render": body.render_preview},
        daemon=True,
        name=f"job-{job_id}",
    )
    worker.start()
    return record.job


@router.get("/jobs/{job_id}/artifacts/{filename}")
def download_artifact(job_id: str, filename: str) -> FileResponse:
    record = store.get(job_id)
    if record is None:
        raise HTTPException(404, "job not found")

    # prevent traversal
    safe = Path(filename).name
    path = record.dir / safe
    if not path.exists() or not path.is_file():
        raise HTTPException(404, f"artifact {safe} not found")

    media_type, _ = mimetypes.guess_type(path.name)
    return FileResponse(path, media_type=media_type or "application/octet-stream", filename=path.name)


@router.delete("/jobs", status_code=204)
def clear_all_jobs() -> None:
    for record in store.all():
        store.delete(record.job.id)
    # wipe root just in case
    from server.state import JOBS_ROOT

    for child in JOBS_ROOT.iterdir():
        if child.is_dir():
            shutil.rmtree(child, ignore_errors=True)
