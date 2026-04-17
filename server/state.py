"""In-memory job store. Ephemeral — fine for a single-user local app."""

from __future__ import annotations

import os
import shutil
import threading
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path

from server.schemas import Job, Stage, StageName, StageStatus

JOBS_ROOT = Path(os.environ.get("VIDEOTOSMPL_JOBS_DIR", "/tmp/videotosmpl_jobs"))


@dataclass
class JobRecord:
    job: Job
    dir: Path
    video_path: Path
    lock: threading.Lock = field(default_factory=threading.Lock)
    cancel_event: threading.Event = field(default_factory=threading.Event)


class JobStore:
    """Thread-safe registry of in-flight jobs."""

    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._lock = threading.Lock()
        JOBS_ROOT.mkdir(parents=True, exist_ok=True)

    def create(self, video_name: str) -> JobRecord:
        job_id = uuid.uuid4().hex[:12]
        job_dir = JOBS_ROOT / job_id
        job_dir.mkdir(parents=True, exist_ok=False)

        stages = [
            Stage(name=StageName.extract),
            Stage(name=StageName.retarget),
            Stage(name=StageName.sanitize),
            Stage(name=StageName.render),
        ]
        job = Job(
            id=job_id,
            video_name=video_name,
            created_at=time.time(),
            stages=stages,
        )
        record = JobRecord(job=job, dir=job_dir, video_path=job_dir / video_name)

        with self._lock:
            self._jobs[job_id] = record
        return record

    def get(self, job_id: str) -> JobRecord | None:
        with self._lock:
            return self._jobs.get(job_id)

    def all(self) -> list[JobRecord]:
        with self._lock:
            return sorted(self._jobs.values(), key=lambda r: r.job.created_at, reverse=True)

    def delete(self, job_id: str) -> bool:
        with self._lock:
            record = self._jobs.pop(job_id, None)
        if not record:
            return False
        record.cancel_event.set()
        shutil.rmtree(record.dir, ignore_errors=True)
        return True

    def update_stage(
        self,
        job_id: str,
        stage_name: StageName,
        *,
        status: StageStatus | None = None,
        progress: float | None = None,
        error: str | None = None,
        artifact: str | None = None,
    ) -> None:
        record = self.get(job_id)
        if record is None:
            return
        with record.lock:
            for s in record.job.stages:
                if s.name != stage_name:
                    continue
                if status is not None:
                    s.status = status
                    now = time.time()
                    if status == StageStatus.running and s.started_at is None:
                        s.started_at = now
                    if status in (StageStatus.done, StageStatus.failed):
                        s.ended_at = now
                        if s.started_at is not None:
                            s.duration_sec = s.ended_at - s.started_at
                if progress is not None:
                    s.progress = progress
                if error is not None:
                    s.error = error
                if artifact is not None:
                    s.artifact = artifact
            # roll up job status
            statuses = {s.status for s in record.job.stages}
            if StageStatus.failed in statuses:
                record.job.status = "failed"
                if error and not record.job.error:
                    record.job.error = error
            elif all(s.status == StageStatus.done for s in record.job.stages):
                record.job.status = "done"
            elif StageStatus.running in statuses:
                record.job.status = "running"


# Singleton used by routes
store = JobStore()
