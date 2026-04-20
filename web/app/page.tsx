import Link from "next/link";
import { ExternalLink, Github, Terminal, Zap } from "lucide-react";
import { siteConfig } from "@/lib/site";

const COLAB_URL = `https://colab.research.google.com/github/${siteConfig.repoSlug}/blob/main/notebooks/03_full_pipeline.ipynb`;
const HERO_VIDEO = `${siteConfig.basePath}/demos/hero-groot-mimic.mp4`;

export default function HomePage() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60
                     [background:radial-gradient(60rem_28rem_at_50%_-10%,rgb(var(--accent)/0.18),transparent)]"
          aria-hidden
        />

        <div className="container-page pt-20 pb-12 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1 font-mono text-xs text-fg-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              v{siteConfig.version} · GR00T WBC in MuJoCo
            </p>
            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
              Video in.{" "}
              <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                Humanoid motion
              </span>{" "}
              out.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-fg-muted">
              Open pipeline: 2D video → SMPL → Unitree G1 physics-mimic in MuJoCo under NVIDIA
              GR00T WBC.
            </p>
          </div>

          {/* Hero video */}
          <div className="mx-auto mt-12 max-w-5xl">
            <div
              className="relative overflow-hidden rounded-2xl border border-border bg-black shadow-2xl
                         ring-1 ring-accent/10"
            >
              <video
                src={HERO_VIDEO}
                className="aspect-video w-full object-contain"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20
                           bg-gradient-to-t from-black/60 to-transparent"
                aria-hidden
              />
              <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <p className="font-mono text-xs uppercase tracking-wider text-white/80">
                  MuJoCo · Unitree G1 · GR00T WBC · tracked reference from GVHMR
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Two paths ───── */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Pick how you run it
            </h2>
            <p className="mt-2 text-fg-muted">No hosted compute. Your GPU or Google&apos;s.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={COLAB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-7 transition
                         hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10
                           opacity-0 blur-2xl transition group-hover:opacity-100"
                aria-hidden
              />
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
                  zero install
                </span>
              </div>
              <h3 className="text-xl font-semibold">Colab notebook</h3>
              <p className="mt-1.5 text-sm text-fg-muted">
                Opens in your browser with a free T4. Upload a video, run all cells, download
                the SMPL NPZ + G1 PKL + preview.
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-accent">
                Open in Colab <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>

            <Link
              href="/docs/local-setup"
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-7 transition
                         hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10
                           opacity-0 blur-2xl transition group-hover:opacity-100"
                aria-hidden
              />
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Terminal className="h-5 w-5 text-accent" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
                  byo-gpu
                </span>
              </div>
              <h3 className="text-xl font-semibold">Local install</h3>
              <p className="mt-1.5 text-sm text-fg-muted">
                Clone, run one script, open the full control centre on{" "}
                <code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">
                  localhost:3000
                </code>
                . Drag-drop, artifact inspection, GR00T hook-ins.
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-accent">
                Install guide →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Pipeline at a glance ───── */}
      <section className="border-t border-border bg-bg-subtle py-16">
        <div className="container-page mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold">Pipeline at a glance</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {stages.map((s, i) => (
              <div key={s.label} className="flex flex-col gap-2">
                <div className="rounded-xl border border-border bg-bg-elevated p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                    step {i + 1}
                  </p>
                  <p className="mt-1 font-medium">{s.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-fg-muted">{s.io}</p>
                </div>
                <p className="px-1 text-xs leading-relaxed text-fg-muted">{s.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-fg-subtle">
            Steps 1–4 ship in this repo (MIT). Step 5 plugs into{" "}
            <a
              href="https://github.com/NVIDIA/Isaac-GR00T"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              NVIDIA GR00T
            </a>{" "}
            — separate repo, private WBC policy.
          </p>
        </div>
      </section>

      {/* ───── Footer CTA ───── */}
      <section className="container-page py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-sm text-fg-muted">Open source · MIT · single maintainer</p>
          <div className="flex gap-3">
            <a
              href={siteConfig.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
            <Link href="/docs/quickstart" className="btn-secondary">
              Quickstart
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const stages = [
  { label: "GVHMR",        io: "mp4 → pt",  note: "Temporal SMPL param extraction" },
  { label: "Convert NPZ",  io: "pt → npz",  note: "Y-up → Z-up, SONIC-ready schema" },
  { label: "GMR retarget", io: "pt → pkl",  note: "IK to G1's 29-DOF chain" },
  { label: "Sanitize",     io: "pkl → pkl", note: "Velocity, limits, grounding" },
  { label: "GR00T + MuJoCo", io: "npz → mp4", note: "Physics mimic via WBC" },
];
