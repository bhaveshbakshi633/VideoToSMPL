"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Trash2, RotateCcw } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Job } from "@/lib/types";
import { UploadZone } from "@/components/pipeline/UploadZone";
import { StageList } from "@/components/pipeline/StageList";
import { ArtifactPanel } from "@/components/pipeline/ArtifactPanel";
import { HealthBadge } from "@/components/pipeline/HealthBadge";
import { OfflineBanner } from "@/components/pipeline/OfflineBanner";

export default function ControlCentre() {
  const [job, setJob] = useState<Job | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  // ───── poll while a job is in flight ─────
  useEffect(() => {
    if (!job || job.status === "done" || job.status === "failed") {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = window.setInterval(async () => {
      try {
        const fresh = await api.getJob(job.id);
        setJob(fresh);
      } catch {
        /* transient errors OK */
      }
    }, 1200);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [job]);

  const onSelect = useCallback(async (file: File) => {
    setError(null);
    setUploading(0);
    try {
      const up = await api.uploadVideo(file, (frac) => setUploading(frac));
      const fresh = await api.getJob(up.job_id);
      setJob(fresh);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err);
      setError(msg);
    } finally {
      setUploading(null);
    }
  }, []);

  const onRun = useCallback(async () => {
    if (!job) return;
    setError(null);
    try {
      const fresh = await api.runJob(job.id);
      setJob(fresh);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err);
      setError(msg);
    }
  }, [job]);

  const onReset = useCallback(async () => {
    if (job) {
      try {
        await api.deleteJob(job.id);
      } catch {
        /* ignore */
      }
    }
    setJob(null);
    setError(null);
  }, [job]);

  const running = job?.status === "running";

  return (
    <section className="container-page py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Control centre</h1>
        <HealthBadge />
      </div>

      <OfflineBanner />

      {!job && (
        <div className="mt-6">
          <UploadZone onSelect={onSelect} disabled={uploading !== null} />
          {uploading !== null && (
            <div className="mt-4">
              <div className="h-1 w-full overflow-hidden rounded-full bg-bg-subtle">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${Math.round(uploading * 100)}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-xs text-fg-subtle">
                uploading · {Math.round(uploading * 100)}%
              </p>
            </div>
          )}
          {error && (
            <pre className="mt-4 overflow-x-auto rounded-md border border-danger/30 bg-danger/5 p-3 font-mono text-xs text-danger">
              {error}
            </pre>
          )}
        </div>
      )}

      {job && (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* ───── Job info + actions ───── */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-border bg-bg-elevated p-5">
              <p className="font-mono text-xs text-fg-subtle">job · {job.id}</p>
              <p className="mt-1 truncate font-medium">{job.video_name}</p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={onRun}
                  disabled={running || job.status === "done"}
                  className="btn-primary flex-1"
                >
                  <Play className="h-4 w-4" />
                  {job.status === "done" ? "Completed" : running ? "Running…" : "Run pipeline"}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  disabled={running}
                  className="btn-secondary"
                  aria-label="New job"
                  title="Discard and start over"
                >
                  {job.status === "done" || job.status === "failed" ? (
                    <RotateCcw className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {job.error && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-danger/30 bg-danger/5 p-3 font-mono text-xs text-danger">
                  {job.error}
                </pre>
              )}
            </div>

            <StageList stages={job.stages} />
          </div>

          {/* ───── Artifacts ───── */}
          <div className="lg:col-span-3">
            <ArtifactPanel job={job} />
          </div>
        </div>
      )}
    </section>
  );
}
