import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-subtle">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold">VideoToSMPL</p>
          <p className="mt-2 max-w-sm text-sm text-fg-muted">
            Open pipeline for video → SMPL → Unitree G1 motion. MIT licensed.
          </p>
          <p className="mt-3 text-xs text-fg-subtle">v{siteConfig.version}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Docs</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link className="text-fg-muted hover:text-fg" href="/docs/quickstart">Quickstart</Link></li>
            <li><Link className="text-fg-muted hover:text-fg" href="/docs/local-setup">Local setup</Link></li>
            <li><Link className="text-fg-muted hover:text-fg" href="/docs/troubleshooting">Troubleshooting</Link></li>
            <li><Link className="text-fg-muted hover:text-fg" href="/docs/architecture">Architecture</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Links</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><a className="text-fg-muted hover:text-fg" href={siteConfig.repoUrl}>GitHub</a></li>
            <li><a className="text-fg-muted hover:text-fg" href={`${siteConfig.repoUrl}/issues`}>Issues</a></li>
            <li><a className="text-fg-muted hover:text-fg" href={`${siteConfig.repoUrl}/releases`}>Releases</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-fg-subtle md:flex-row">
          <p>© {new Date().getFullYear()} Bhavesh Bakshi. MIT license.</p>
          <p>
            Built on{" "}
            <a className="link" href="https://github.com/zju3dv/GVHMR">GVHMR</a>,{" "}
            <a className="link" href="https://github.com/generalroboticslab/GMR">GMR</a>, and{" "}
            <a className="link" href="https://mujoco.org">MuJoCo</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
