"use client";

import clsx from "clsx";
import { Check, CircleDashed, Loader2, TriangleAlert } from "lucide-react";
import type { Stage } from "@/lib/types";
import { STAGE_LABEL, STAGE_ORDER } from "@/lib/types";

interface Props {
  stages: Stage[];
}

export function StageList({ stages }: Props) {
  const byName = new Map(stages.map((s) => [s.name, s]));
  return (
    <ol className="space-y-2">
      {STAGE_ORDER.map((name, i) => {
        const s = byName.get(name);
        if (!s) return null;
        return <StageRow key={name} idx={i + 1} stage={s} />;
      })}
    </ol>
  );
}

function StageRow({ idx, stage }: { idx: number; stage: Stage }) {
  const icon = {
    pending: <CircleDashed className="h-4 w-4 text-fg-subtle" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-accent" />,
    done: <Check className="h-4 w-4 text-success" />,
    failed: <TriangleAlert className="h-4 w-4 text-danger" />,
  }[stage.status];

  const duration = stage.duration_sec != null ? `${stage.duration_sec.toFixed(1)}s` : null;

  return (
    <li
      className={clsx(
        "rounded-lg border px-4 py-3 transition-colors",
        stage.status === "running" && "border-accent bg-accent/5",
        stage.status === "failed" && "border-danger bg-danger/5",
        stage.status === "done" && "border-border bg-bg-elevated",
        stage.status === "pending" && "border-border bg-bg-subtle",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-fg-subtle">0{idx}</span>
          {icon}
          <span className="font-medium">{STAGE_LABEL[stage.name]}</span>
        </div>
        {duration && <span className="font-mono text-xs text-fg-subtle">{duration}</span>}
      </div>
      {stage.error && (
        <pre className="mt-2 overflow-x-auto rounded bg-danger/10 p-2 font-mono text-xs text-danger">
          {stage.error}
        </pre>
      )}
    </li>
  );
}
