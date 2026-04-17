"use client";

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { siteConfig } from "@/lib/site";

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
    <div className="rounded-xl border border-border bg-bg-subtle p-6">
      <div className="flex items-start gap-3">
        <Terminal className="mt-0.5 h-5 w-5 text-fg-muted" />
        <div className="flex-1">
          <p className="font-medium">Backend not running</p>
          <p className="mt-1 text-sm text-fg-muted">
            The control centre needs a local backend for the actual pipeline. Clone and start it:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg-elevated p-3 font-mono text-xs">
{`git clone ${siteConfig.repoUrl}
cd VideoToSMPL
bash scripts/install_local.sh
bash scripts/run_local.sh`}
          </pre>
          <p className="mt-3 text-xs text-fg-subtle">
            Backend listens on <code>localhost:8000</code>. This page talks to it via{" "}
            <code>/api/*</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
