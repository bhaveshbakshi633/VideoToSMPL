// Mirrors server/schemas.py — keep in sync.

export type StageName = "extract" | "retarget" | "sanitize" | "render";
export type StageStatus = "pending" | "running" | "done" | "failed";
export type JobStatus = "pending" | "running" | "done" | "failed";

export interface Stage {
  name: StageName;
  status: StageStatus;
  progress: number;
  started_at: number | null;
  ended_at: number | null;
  duration_sec: number | null;
  error: string | null;
  artifact: string | null;
}

export interface Job {
  id: string;
  video_name: string;
  created_at: number;
  stages: Stage[];
  status: JobStatus;
  error: string | null;
}

export interface UploadResponse {
  job_id: string;
  video_name: string;
  size_bytes: number;
}

export interface Health {
  ok: boolean;
  version: string;
  cuda_available: boolean;
  gvhmr_path: string;
  gmr_path: string;
  gvhmr_ok: boolean;
  gmr_ok: boolean;
  notes: string[];
}

export const STAGE_ORDER: StageName[] = ["extract", "retarget", "sanitize", "render"];

export const STAGE_LABEL: Record<StageName, string> = {
  extract: "Extract",
  retarget: "Retarget",
  sanitize: "Sanitize",
  render: "Render",
};
