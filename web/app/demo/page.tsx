import { VideoCompare } from "@/components/VideoCompare";
import demos from "@/content/demos.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demos",
  description: "Source video, SMPL mesh, and Unitree G1 retargeting — side-by-side.",
};

export default function DemoPage() {
  return (
    <section className="container-page py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold">Demo gallery</h1>
        <p className="mt-3 text-fg-muted">
          Same video, three views: raw footage, GVHMR mesh overlay, and the retargeted G1
          trajectory rendered in MuJoCo.
        </p>
      </div>

      <div className="mt-12 space-y-16">
        {demos.map((d) => (
          <article key={d.slug} className="mx-auto max-w-5xl">
            <header className="mb-4">
              <h2 className="text-2xl font-semibold">{d.title}</h2>
              <p className="text-sm text-fg-muted">{d.description}</p>
            </header>
            <VideoCompare sources={d.sources} slug={d.slug} />
          </article>
        ))}
      </div>
    </section>
  );
}
