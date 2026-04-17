import Link from "next/link";
import { ColabLauncher } from "@/components/ColabLauncher";
import { CodeBlock } from "@/components/CodeBlock";
import { TroubleshootCard } from "@/components/TroubleshootCard";
import { ArrowRight, Cpu, Film, Github, Zap } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { troubleshooting } from "@/content/troubleshooting";

export default function HomePage() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="container-page py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs font-medium text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            v{siteConfig.version} — alpha
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Turn any video into{" "}
            <span className="text-accent">humanoid motion</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-fg-muted">
            One RGB video in. SMPL parameters and Unitree G1 joint trajectories out. Run on a
            free Colab GPU or your own box — no cloud cost, no data leaves your machine.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ColabLauncher notebook="01_video_to_smpl.ipynb" label="Try in Colab · free GPU" />
            <Link href="/docs/local-setup" className="btn-secondary">
              <Cpu className="h-4 w-4" /> Run locally
            </Link>
          </div>

          <p className="mt-4 text-xs text-fg-subtle">
            No login. No API key. No upload to anyone&apos;s server.
          </p>
        </div>
      </section>

      {/* ───── Demo video ───── */}
      <section className="container-page pb-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-lg">
          <video
            src={`${siteConfig.basePath}/assets/demo-hero.mp4`}
            poster={`${siteConfig.basePath}/assets/demo-hero.jpg`}
            className="aspect-video w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-fg-muted">
            <span>Source · SMPL · G1 retarget — side-by-side</span>
            <Link href="/demo" className="link inline-flex items-center gap-1">
              More demos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section id="how" className="border-y border-border bg-bg-subtle py-20">
        <div className="container-page">
          <h2 className="text-center text-3xl font-semibold">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-fg-muted">
            Four stages. Every intermediate artifact is inspectable and reusable.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((s, i) => (
              <div key={s.title} className="card flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-accent" />
                  <span className="font-mono text-xs text-fg-subtle">0{i + 1}</span>
                </div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{s.desc}</p>
                <code className="mt-3 rounded bg-bg-subtle px-2 py-1 font-mono text-xs text-fg-muted">
                  {s.io}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Two paths ───── */}
      <section className="container-page py-20">
        <h2 className="text-center text-3xl font-semibold">Two ways to run it</h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold">Colab · zero install</h3>
            </div>
            <p className="text-fg-muted">
              Opens in your browser, runs on Google&apos;s free T4 GPU. ~5 min from click to
              SMPL download. Perfect for trying it out or working from a laptop.
            </p>
            <ul className="mt-4 space-y-1 text-sm text-fg-muted">
              <li>✓ Free Tesla T4 GPU (Google)</li>
              <li>✓ Auto-downloads model weights from HuggingFace</li>
              <li>✓ Results downloaded straight to your machine</li>
            </ul>
            <div className="mt-6">
              <ColabLauncher notebook="03_full_pipeline.ipynb" label="Open full pipeline" />
            </div>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold">Local · your GPU</h3>
            </div>
            <p className="text-fg-muted">
              Clone, install, run. Gradio GUI on localhost:7860 with 7 tabs for every stage.
              ~30 min initial setup; faster iteration after.
            </p>
            <CodeBlock
              language="bash"
              code={`git clone ${siteConfig.repoUrl}
cd VideoToSMPL
bash scripts/install_local.sh
bash scripts/run_local.sh`}
            />
            <div className="mt-4">
              <Link href="/docs/local-setup" className="link text-sm">
                Full local setup guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Troubleshooting ───── */}
      <section id="troubleshoot" className="border-t border-border bg-bg-subtle py-20">
        <div className="container-page">
          <h2 className="text-center text-3xl font-semibold">Something broke?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-fg-muted">
            The most common failures and what to do. Expandable answers with exact commands.
          </p>
          <div className="mx-auto mt-10 max-w-3xl space-y-2">
            {troubleshooting.slice(0, 6).map((t) => (
              <TroubleshootCard key={t.id} item={t} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/docs/troubleshooting" className="link text-sm">
              All {troubleshooting.length} troubleshooting entries →
            </Link>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="container-page py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-gradient-to-br from-accent/10 via-bg-elevated to-bg-elevated p-10 text-center">
          <h2 className="text-3xl font-semibold">Ship motion data to your robot today</h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-muted">
            Next on the roadmap: full-body tracking in MuJoCo with NVIDIA Groot WBC. Follow the
            repo for drops.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href={siteConfig.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Github className="h-4 w-4" /> View on GitHub
            </a>
            <Link href="/docs/quickstart" className="btn-secondary">
              Quickstart guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const stages = [
  { title: "Extract SMPL", desc: "GVHMR runs temporal human-pose tracking.", icon: Film, io: "mp4 → pt" },
  { title: "Retarget", desc: "GMR IK maps SMPL body pose to G1's 29 DoF.", icon: Cpu, io: "pt → pkl" },
  { title: "Sanitize", desc: "Velocity limits, joint clamping, foot grounding.", icon: Zap, io: "pkl → pkl" },
  { title: "Render", desc: "MuJoCo preview MP4 — verify before training.", icon: Film, io: "pkl → mp4" },
];
