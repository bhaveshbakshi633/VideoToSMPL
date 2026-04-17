import { siteConfig } from "@/lib/site";

interface Source {
  label: string;
  file: string;
}

interface Props {
  sources: Source[];
  slug: string;
}

export function VideoCompare({ sources, slug }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {sources.map((s) => (
        <figure key={s.label} className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
          <video
            src={`${siteConfig.basePath}/demos/${slug}/${s.file}`}
            className="aspect-video w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
          <figcaption className="border-t border-border px-3 py-2 text-xs font-medium text-fg-muted">
            {s.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
