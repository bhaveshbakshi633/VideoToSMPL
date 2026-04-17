"""Stitches together core/* modules and reports progress into JobStore."""

from __future__ import annotations

import logging
import traceback

from core._types import PipelineConfig
from core.extraction import extract_gvhmr
from core.render import render_mujoco
from core.retargeting import retarget_to_g1
from core.sanitize import sanitize_motion
from server.schemas import StageName, StageStatus
from server.state import JobRecord, store

log = logging.getLogger(__name__)


def run_job(record: JobRecord, *, do_sanitize: bool = True, do_render: bool = True) -> None:
    """Blocking end-to-end pipeline. Runs inside a worker thread."""
    job_id = record.job.id
    jd = record.dir

    # ───── extract ─────
    try:
        store.update_stage(job_id, StageName.extract, status=StageStatus.running)
        pt = extract_gvhmr(record.video_path, output_dir=jd)
        store.update_stage(
            job_id, StageName.extract,
            status=StageStatus.done, progress=1.0, artifact=pt.name,
        )
    except Exception as e:  # noqa: BLE001
        _fail(job_id, StageName.extract, e)
        return

    if record.cancel_event.is_set():
        return

    # ───── retarget ─────
    try:
        store.update_stage(job_id, StageName.retarget, status=StageStatus.running)
        raw_pkl = jd / "raw.pkl"
        retarget_to_g1(pt, raw_pkl)
        store.update_stage(
            job_id, StageName.retarget,
            status=StageStatus.done, progress=1.0, artifact=raw_pkl.name,
        )
    except Exception as e:  # noqa: BLE001
        _fail(job_id, StageName.retarget, e)
        return

    if record.cancel_event.is_set():
        return

    # ───── sanitize ─────
    final_pkl = jd / "raw.pkl"
    if do_sanitize:
        try:
            store.update_stage(job_id, StageName.sanitize, status=StageStatus.running)
            clean = jd / "clean.pkl"
            sanitize_motion(raw_pkl, clean, PipelineConfig())
            final_pkl = clean
            store.update_stage(
                job_id, StageName.sanitize,
                status=StageStatus.done, progress=1.0, artifact=clean.name,
            )
        except Exception as e:  # noqa: BLE001
            _fail(job_id, StageName.sanitize, e)
            return
    else:
        store.update_stage(
            job_id, StageName.sanitize,
            status=StageStatus.done, progress=1.0, artifact=raw_pkl.name,
        )

    if record.cancel_event.is_set():
        return

    # ───── render ─────
    if do_render:
        try:
            store.update_stage(job_id, StageName.render, status=StageStatus.running)
            preview = jd / "preview.mp4"
            render_mujoco(final_pkl, preview)
            store.update_stage(
                job_id, StageName.render,
                status=StageStatus.done, progress=1.0, artifact=preview.name,
            )
        except Exception as e:  # noqa: BLE001
            _fail(job_id, StageName.render, e)
            return
    else:
        store.update_stage(job_id, StageName.render, status=StageStatus.done)


def _fail(job_id: str, stage: StageName, exc: Exception) -> None:
    msg = f"{exc.__class__.__name__}: {exc}"
    log.error("%s failed in stage %s: %s\n%s", job_id, stage.value, msg, traceback.format_exc())
    store.update_stage(job_id, stage, status=StageStatus.failed, error=msg)
