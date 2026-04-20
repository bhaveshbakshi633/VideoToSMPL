"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Trash2, RotateCcw, Film, Sparkles } from "lucide-react";
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
      setError(err instanceof ApiError ? err.message : String(err));
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
      setError(err instanceof ApiError ? err.message : String(err));
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Control centre</h1>
          <span className="hidden rounded-md bg-bg-subtle px-2 py-0.5 font-mono text-xs text-fg-muted sm:inline">
            video → G1 motion
          </span>
        </div>
        <HealthBadge />
      </div>

      <OfflineBanner />

      {!job && (
        <div className="animate-fade-in">
          <UploadZone onSelect={onSelect} disabled={uploading !== null} />
          {uploading !== null && (
            <div className="mt-5 rounded-xl border border-border bg-bg-elevated p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-fg-muted">
                <span>uploading</span>
                <span className="font-mono">{Math.round(uploading * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${Math.round(uploading * 100)}%` }}
                />
              </div>
            </div>
          )}
          {error && (
            <pre className="mt-5 overflow-x-auto rounded-md border border-danger/30 bg-danger/5 p-3 font-mono text-xs text-danger">
              {error}
            </pre>
          )}

          {/* Hint card */}
          <div className="mt-8 grid gap-3 text-sm text-fg-muted sm:grid-cols-3">
            <HintTile
              icon={<Film className="h-4 w-4" />}
              title="Best results"
              body="Single person, full body visible, static camera, ≤ 30 s clip."
            />
            <HintTile
              icon={<Sparkles className="h-4 w-4" />}
              title="Formats"
              body="MP4, MOV, WebM, MKV, AVI — up to 500 MB per upload."
            />
            <HintTile
              icon={<Play className="h-4 w-4" />}
              title="What runs"
              body="GVHMR · GMR IK · sanitizer · MuJoCo preview — end to end."
            />
          </div>
        </div>
      )}

      {job && (
        <div className="animate-fade-in grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                job
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-fg-muted">{job.id}</p>
              <p className="mt-2 truncate font-medium">{job.video_name}</p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={onRun}
                  disabled={running || job.status === "done"}
                  className="btn-primary flex-1"
                >
                  <Play className="h-4 w-4" />
                  {job.status === "done"
                    ? "Completed"
                    : running
                      ? "Running…"
                      : "Run pipeline"}
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

          <div className="lg:col-span-3">
            <ArtifactPanel job={job} />
          </div>
        </div>
      )}
    </section>
  );
}

function HintTile({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-subtle p-4">
      <div className="mb-1.5 flex items-center gap-2 text-fg">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-fg-muted">{body}</p>
    </div>
  );
}
