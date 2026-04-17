"use client";

import type { Health, Job, UploadResponse } from "@/lib/types";

/**
 * Base URL for the backend API.
 *   - dev/local: Next.js rewrites /api/* → http://localhost:8000/api/*
 *   - static export (Pages): there is no backend; every call throws, and the
 *     app UI shows the "run locally" banner.
 */
const API = "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      msg = body.detail ?? body.message ?? msg;
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<Health>("/health"),

  listJobs: () => request<{ jobs: Job[] }>("/jobs"),
  getJob: (id: string) => request<Job>(`/jobs/${id}`),
  deleteJob: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
  clearAllJobs: () => request<void>("/jobs", { method: "DELETE" }),

  uploadVideo: async (file: File, onProgress?: (frac: number) => void): Promise<UploadResponse> => {
    // Use XHR for upload progress (fetch doesn't expose it).
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append("video", file);

      xhr.open("POST", `${API}/jobs`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(err);
          }
        } else {
          let detail = xhr.statusText;
          try {
            detail = JSON.parse(xhr.responseText).detail ?? detail;
          } catch {
            /* ignore */
          }
          reject(new ApiError(xhr.status, detail));
        }
      };
      xhr.onerror = () => reject(new ApiError(0, "Network error"));
      xhr.send(form);
    });
  },

  runJob: (id: string, opts: { sanitize?: boolean; render_preview?: boolean } = {}) =>
    request<Job>(`/jobs/${id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sanitize: opts.sanitize ?? true,
        render_preview: opts.render_preview ?? true,
      }),
    }),

  artifactUrl: (jobId: string, filename: string) =>
    `${API}/jobs/${jobId}/artifacts/${encodeURIComponent(filename)}`,
};
