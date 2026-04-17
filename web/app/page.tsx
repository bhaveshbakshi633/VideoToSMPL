import Link from "next/link";
import { ExternalLink, Github, Terminal, Zap } from "lucide-react";
import { siteConfig } from "@/lib/site";

const COLAB_URL = `https://colab.research.google.com/github/${siteConfig.repoSlug}/blob/main/notebooks/03_full_pipeline.ipynb`;

export default function HomePage() {
  return (
    <section className="container-page flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16">
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-6 h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover"
          aria-hidden
        />
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          VideoToSMPL
        </h1>
        <p className="mx-auto mt-3 max-w-md text-fg-muted">
          Video → SMPL → Unitree G1 motion.
        </p>
      </div>

      {/* ─── 2 equal paths ─── */}
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <a
          href={COLAB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-border bg-bg-elevated p-6 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <div className="mb-3 flex items-center justify-between">
            <Zap className="h-5 w-5 text-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
              zero install
            </span>
          </div>
          <h2 className="text-xl font-semibold">Colab</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Opens in your browser, free T4 GPU. Upload video, download SMPL + G1 PKL.
          </p>
          <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent">
            Open notebook <ExternalLink className="h-3.5 w-3.5" />
          </p>
        </a>

        <Link
          href="/docs/local-setup"
          className="group rounded-2xl border border-border bg-bg-elevated p-6 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <div className="mb-3 flex items-center justify-between">
            <Terminal className="h-5 w-5 text-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
              byo-gpu
            </span>
          </div>
          <h2 className="text-xl font-semibold">Local install</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Clone, run one script, open a full web UI on <code>localhost:3000</code>. Faster
            iteration, no upload/download loop.
          </p>
          <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent">
            Install guide →
          </p>
        </Link>
      </div>

      <p className="mt-16 font-mono text-xs text-fg-subtle">
        v{siteConfig.version} ·{" "}
        <Link href="/docs/quickstart" className="hover:text-fg">docs</Link> ·{" "}
        <a
          href={siteConfig.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-fg"
        >
          <Github className="h-3 w-3" /> github
        </a>
      </p>
    </section>
  );
}
