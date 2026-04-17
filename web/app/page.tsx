import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="container-page text-center">
        <div
          className="mx-auto mb-8 h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover"
          aria-hidden
        />
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          VideoToSMPL
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-fg-muted">
          Video → SMPL → Unitree G1 motion. Full pipeline in your browser.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <Link href="/app" className="btn-primary w-full sm:w-auto">
            Open app <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full sm:w-auto"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>

        <p className="mt-16 font-mono text-xs text-fg-subtle">
          v{siteConfig.version} · <Link href="/docs/quickstart" className="hover:text-fg">docs</Link>
        </p>
      </div>
    </section>
  );
}
