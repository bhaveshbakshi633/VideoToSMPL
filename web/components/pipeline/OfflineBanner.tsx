"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Terminal } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { siteConfig } from "@/lib/site";

const COLAB_URL = `https://colab.research.google.com/github/${siteConfig.repoSlug}/blob/main/notebooks/03_full_pipeline.ipynb`;

export function OfflineBanner() {
  const [offline, setOffline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .health()
      .then(() => mounted && setOffline(false))
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof ApiError) setOffline(true);
        else setOffline(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (offline !== true) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* ───── Colab path ───── */}
      <a
        href={COLAB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col rounded-xl border border-border bg-bg-elevated p-5 transition-colors hover:border-accent hover:bg-accent/5"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            zero install
          </span>
          <ExternalLink className="h-4 w-4 text-fg-muted group-hover:text-accent" />
        </div>
        <p className="text-lg font-semibold">Open in Colab</p>
        <p className="mt-1 text-sm text-fg-muted">
          Free T4 GPU. Upload video, run all cells, download artifacts. ~2 min/video.
        </p>
      </a>

      {/* ───── Local path ───── */}
      <div className="flex flex-col rounded-xl border border-border bg-bg-subtle p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            byo-gpu local
          </span>
          <Terminal className="h-4 w-4 text-fg-muted" />
        </div>
        <p className="text-lg font-semibold">Run this webapp locally</p>
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg-elevated p-3 font-mono text-xs">
{`git clone ${siteConfig.repoUrl}
cd VideoToSMPL
bash scripts/install_local.sh
bash scripts/run_local.sh`}
        </pre>
        <p className="mt-auto pt-3 text-xs text-fg-subtle">
          Opens at <code>localhost:3000/app</code>
        </p>
      </div>
    </div>
  );
}
