import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "Interactive MuJoCo playback of retargeted motions — coming with WBC drop.",
};

export default function PlaygroundPage() {
  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs font-medium text-fg-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> Coming soon
        </p>
        <h1 className="text-4xl font-semibold">Playground</h1>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">
          Interactive browser playback of retargeted G1 motion, with hooks for NVIDIA Groot WBC
          rollouts. Ships as soon as the WBC module lands.
        </p>
        <p className="mt-8 text-sm text-fg-subtle">
          Want to be first in line? Watch the repo for the <code>v0.2</code> tag.
        </p>
      </div>
    </section>
  );
}
