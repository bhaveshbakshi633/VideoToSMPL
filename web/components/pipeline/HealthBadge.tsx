"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { api, ApiError } from "@/lib/api";
import type { Health } from "@/lib/types";
import { siteConfig } from "@/lib/site";

type State =
  | { kind: "loading" }
  | { kind: "ok"; health: Health }
  | { kind: "warn"; health: Health }
  | { kind: "offline" };

export function HealthBadge() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      try {
        const health = await api.health();
        if (!mounted) return;
        setState({ kind: health.ok ? "ok" : "warn", health });
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 0) {
          setState({ kind: "offline" });
        } else {
          setState({ kind: "offline" });
        }
      }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (state.kind === "loading") {
    return <Dot label="connecting…" tone="neutral" />;
  }
  if (state.kind === "offline") {
    return (
      <a
        href={`${siteConfig.repoUrl}#installation`}
        target="_blank"
        rel="noopener noreferrer"
        title="Backend not reachable — install & run locally"
      >
        <Dot label="offline" tone="danger" />
      </a>
    );
  }
  const tone = state.kind === "ok" ? "success" : "warn";
  return (
    <div title={state.health.notes.join("\n") || "Backend healthy"}>
      <Dot
        label={
          state.health.cuda_available ? `gpu · ${state.kind === "warn" ? "warn" : "ready"}` : "cpu · ready"
        }
        tone={tone}
      />
    </div>
  );
}

function Dot({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warn" | "danger" | "neutral";
}) {
  const color = {
    success: "bg-success",
    warn: "bg-yellow-500",
    danger: "bg-danger",
    neutral: "bg-fg-subtle",
  }[tone];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs font-mono",
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", color)} aria-hidden />
      {label}
    </span>
  );
}
