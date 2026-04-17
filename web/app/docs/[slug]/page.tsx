import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/markdown";

const DOC_DIR = path.join(process.cwd(), "..", "docs");

const DOCS: Record<string, { file: string; title: string; description: string }> = {
  quickstart: {
    file: "QUICKSTART.md",
    title: "Quickstart",
    description: "5-minute path from a new video to SMPL parameters via Colab.",
  },
  "local-setup": {
    file: "LOCAL_SETUP.md",
    title: "Local setup",
    description: "Run the full pipeline on your own GPU.",
  },
  troubleshooting: {
    file: "TROUBLESHOOTING.md",
    title: "Troubleshooting",
    description: "Common failures and exact fixes.",
  },
  architecture: {
    file: "ARCHITECTURE.md",
    title: "Architecture",
    description: "Data flow, module boundaries, and extension points.",
  },
  "wbc-integration": {
    file: "WBC_INTEGRATION.md",
    title: "WBC integration",
    description: "Plugin contract for the forthcoming NVIDIA Groot WBC module.",
  },
};

export async function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const doc = DOCS[slug];
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function DocPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  let markdown: string;
  try {
    markdown = await fs.readFile(path.join(DOC_DIR, doc.file), "utf8");
  } catch {
    notFound();
  }
  const html = await renderMarkdown(markdown);

  return (
    <article className="container-page py-16">
      <div className="mx-auto max-w-prose">
        <header className="mb-10 border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Docs</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="mt-3 text-fg-muted">{doc.description}</p>
        </header>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none
                     prose-headings:scroll-mt-20 prose-headings:font-semibold
                     prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                     prose-code:rounded prose-code:bg-bg-subtle prose-code:px-1.5 prose-code:py-0.5
                     prose-code:before:content-none prose-code:after:content-none
                     prose-pre:bg-transparent prose-pre:p-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </article>
  );
}
