"use client";

import { Download, FileVideo, File as FileIcon } from "lucide-react";
import type { Job } from "@/lib/types";
import { api } from "@/lib/api";

interface Props {
  job: Job;
}

export function ArtifactPanel({ job }: Props) {
  const artifacts = job.stages
    .filter((s) => s.artifact && s.status === "done")
    .map((s) => ({ stage: s.name, filename: s.artifact as string }));

  if (artifacts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-subtle p-6 text-center text-sm text-fg-subtle">
        Artifacts appear here as each stage completes.
      </div>
    );
  }

  const preview = artifacts.find((a) => a.filename.endsWith(".mp4"));

  return (
    <div className="space-y-3">
      {preview && (
        <div className="overflow-hidden rounded-xl border border-border bg-black">
          <video
            key={api.artifactUrl(job.id, preview.filename)}
            src={api.artifactUrl(job.id, preview.filename)}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="aspect-video w-full object-contain"
          />
        </div>
      )}

      <ul className="divide-y divide-border rounded-lg border border-border bg-bg-elevated">
        {artifacts.map((a) => (
          <li
            key={a.filename}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <div className="flex items-center gap-3">
              {a.filename.endsWith(".mp4") ? (
                <FileVideo className="h-4 w-4 text-fg-subtle" />
              ) : (
                <FileIcon className="h-4 w-4 text-fg-subtle" />
              )}
              <span className="font-mono">{a.filename}</span>
            </div>
            <a
              href={api.artifactUrl(job.id, a.filename)}
              download={a.filename}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-bg-subtle hover:text-fg"
            >
              <Download className="h-3 w-3" /> download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
