"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal, ExternalLink } from "lucide-react";
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
    <div className="rounded-2xl border border-border bg-bg-elevated p-8 text-center">
      <Terminal className="mx-auto mb-4 h-6 w-6 text-fg-subtle" />
      <h2 className="text-xl font-semibold">This page is for local use</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
        The control centre talks to a backend running on your machine. Install it, then open
        this page from <code>localhost:3000</code>.
      </p>

      <Link
        href="/docs/local-setup"
        className="btn-primary mx-auto mt-6 w-fit"
      >
        Install guide →
      </Link>

      <div className="mx-auto mt-8 max-w-md border-t border-border pt-6">
        <p className="text-xs text-fg-subtle">or run the pipeline in your browser instead</p>
        <a
          href={COLAB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Open in Colab <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
